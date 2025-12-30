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
 * Configure via env vars:
 * - PADDLE_PRICE_STARTER_ID
 * - PADDLE_PRICE_PRO_ID
 * - PADDLE_PRICE_PLUS_ID
 */
export function mapPaddlePriceToPlanType(
  priceId: string | number,
  productName?: string
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

  // Fallback: try to match by product name
  if (productName) {
    const nameLower = productName.toLowerCase()
    if (nameLower.includes("starter")) return "starter"
    if (nameLower.includes("pro")) return "pro"
    if (nameLower.includes("plus")) return "plus"
  }

  return null
}
