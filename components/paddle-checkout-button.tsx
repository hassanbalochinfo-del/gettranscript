"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type Plan = "starter" | "pro" | "plus"

/**
 * Paddle Checkout Button
 * 
 * Opens Paddle checkout overlay for the selected plan.
 * Paddle handles the payment flow and redirects back to /account?payment=success
 */
export function PaddleCheckoutButton({
  plan,
  variant = "default",
  size = "lg",
  className,
  children,
}: {
  plan: Plan
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onClick = () => {
    if (loading) return

    // Get Paddle checkout URLs from env (can be full checkout URLs or just price IDs)
    const checkoutUrlMap: Record<Plan, string | undefined> = {
      starter: process.env.NEXT_PUBLIC_PADDLE_CHECKOUT_STARTER_URL || process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_ID,
      pro: process.env.NEXT_PUBLIC_PADDLE_CHECKOUT_PRO_URL || process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_ID,
      plus: process.env.NEXT_PUBLIC_PADDLE_CHECKOUT_PLUS_URL || process.env.NEXT_PUBLIC_PADDLE_PRICE_PLUS_ID,
    }

    const checkoutValue = checkoutUrlMap[plan]
    if (!checkoutValue) {
      toast.error("Checkout not configured for this plan")
      return
    }

    // Get success URL
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const successUrl = `${baseUrl}/account?payment=success`

    // If it's already a full URL, use it; otherwise build checkout URL
    let paddleCheckoutUrl: string
    if (checkoutValue.startsWith("http")) {
      // Already a full URL, just append success_url if not present
      const url = new URL(checkoutValue)
      url.searchParams.set("success_url", successUrl)
      paddleCheckoutUrl = url.toString()
    } else {
      // It's a price ID, use the correct Paddle checkout format
      // Format: https://buy.paddle.com/checkout?price_id={priceId}&success_url={successUrl}
      paddleCheckoutUrl = `https://buy.paddle.com/checkout?price_id=${checkoutValue}&success_url=${encodeURIComponent(successUrl)}`
    }

    // Open Paddle checkout
    window.location.href = paddleCheckoutUrl
  }

  return (
    <Button className={className} variant={variant} size={size} onClick={onClick} disabled={loading}>
      {loading ? "Loading..." : children}
    </Button>
  )
}
