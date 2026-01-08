import crypto from "crypto"
import { PLAN_CREDITS, type PlanType } from "./constants"

/**
 * Verify Lemon Squeezy webhook signature
 */
export function verifyLemonSqueezySignature(
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
 * Map Lemon Squeezy plan variant ID or name to our plan type
 * Configure via env vars:
 * - LEMONSQUEEZY_VARIANT_STARTER_ID
 * - LEMONSQUEEZY_VARIANT_PRO_ID
 * - LEMONSQUEEZY_VARIANT_PLUS_ID
 */
export function mapLemonSqueezyPlanToPlanType(
  variantId: string | number,
  variantName?: string
): PlanType | null {
  // Map by variant ID (preferred). Configure these in env:
  const variantIdMap: Record<string, PlanType> = {}
  if (process.env.LEMONSQUEEZY_VARIANT_STARTER_ID) {
    variantIdMap[String(process.env.LEMONSQUEEZY_VARIANT_STARTER_ID)] = "starter"
  }
  if (process.env.LEMONSQUEEZY_VARIANT_PRO_ID) {
    variantIdMap[String(process.env.LEMONSQUEEZY_VARIANT_PRO_ID)] = "pro"
  }
  if (process.env.LEMONSQUEEZY_VARIANT_PLUS_ID) {
    variantIdMap[String(process.env.LEMONSQUEEZY_VARIANT_PLUS_ID)] = "plus"
  }

  // Map by variant name (fallback)
  const variantNameMap: Record<string, PlanType> = {
    starter: "starter",
    pro: "pro",
    plus: "plus",
  }

  const idStr = String(variantId)
  if (variantIdMap[idStr]) {
    return variantIdMap[idStr]
  }

  if (variantName) {
    const nameLower = variantName.toLowerCase()
    for (const [key, value] of Object.entries(variantNameMap)) {
      if (nameLower.includes(key)) {
        return value
      }
    }
  }

  return null
}
