import crypto from "crypto"
import { PLAN_CREDITS, type PlanType } from "./constants"

/**
 * Verify Paddle webhook signature
 * Paddle uses HMAC SHA256 with the webhook secret
 */
export function verifyPaddleSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret)
    const digest = hmac.update(payload).digest("hex")
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
  } catch (error) {
    return false
  }
}

/**
 * Get credits amount for a plan
 */
export function getCreditsForPlan(plan: PlanType): number {
  return PLAN_CREDITS[plan]
}

/**
 * Map Paddle product/price ID to our plan type
 * You'll configure these in env vars:
 * - PADDLE_PRICE_STARTER_ID
 * - PADDLE_PRICE_PRO_ID
 * - PADDLE_PRICE_PLUS_ID
 */
export function mapPaddlePriceToPlanType(
  priceId: string | number
): PlanType | null {
  const priceIdMap: Record<string, PlanType> = {}
  
  if (process.env.PADDLE_PRICE_STARTER_ID) {
    priceIdMap[String(process.env.PADDLE_PRICE_STARTER_ID)] = "starter"
  }
  if (process.env.PADDLE_PRICE_PRO_ID) {
    priceIdMap[String(process.env.PADDLE_PRICE_PRO_ID)] = "pro"
  }
  if (process.env.PADDLE_PRICE_PLUS_ID) {
    priceIdMap[String(process.env.PADDLE_PRICE_PLUS_ID)] = "plus"
  }

  const idStr = String(priceId)
  if (priceIdMap[idStr]) {
    return priceIdMap[idStr]
  }

  return null
}

/**
 * Extract plan type from Paddle transaction/subscription data
 * Tries multiple fields: price_id, product_id, items[0].price_id
 */
export function extractPlanFromPaddleData(data: any): PlanType | null {
  // Try price_id first (most common)
  if (data.price_id) {
    const plan = mapPaddlePriceToPlanType(data.price_id)
    if (plan) return plan
  }

  // Try items array
  if (data.items && Array.isArray(data.items) && data.items.length > 0) {
    const firstItem = data.items[0]
    if (firstItem.price_id) {
      const plan = mapPaddlePriceToPlanType(firstItem.price_id)
      if (plan) return plan
    }
  }

  // Try product_id (fallback)
  if (data.product_id) {
    // You might need to map product_id to plan if Paddle uses product IDs
    // For now, return null and log for debugging
    console.warn("Could not map product_id to plan:", data.product_id)
  }

  return null
}
