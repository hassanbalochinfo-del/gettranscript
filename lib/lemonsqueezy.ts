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
 * You'll need to update this based on your actual Lemon Squeezy product variant IDs
 */
export function mapLemonSqueezyPlanToPlanType(
  variantId: string | number,
  variantName?: string
): PlanType | null {
  // Map by variant ID (you'll get these from Lemon Squeezy dashboard)
  const variantIdMap: Record<string, PlanType> = {
    // Update these with your actual variant IDs
    // "12345": "starter",
    // "12346": "pro",
    // "12347": "plus",
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
