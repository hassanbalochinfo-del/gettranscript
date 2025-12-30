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

    // Get Paddle checkout URL from env
    const priceIdMap: Record<Plan, string | undefined> = {
      starter: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_ID,
      pro: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_ID,
      plus: process.env.NEXT_PUBLIC_PADDLE_PRICE_PLUS_ID,
    }

    const priceId = priceIdMap[plan]
    if (!priceId) {
      toast.error("Checkout not configured for this plan")
      return
    }

    // Get success URL
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const successUrl = `${baseUrl}/account?payment=success`

    // Build Paddle checkout URL
    // Format: https://buy.paddle.com/product/{priceId}?success_url={successUrl}
    const paddleCheckoutUrl = `https://buy.paddle.com/product/${priceId}?success_url=${encodeURIComponent(successUrl)}`

    // Open Paddle checkout
    window.location.href = paddleCheckoutUrl
  }

  return (
    <Button className={className} variant={variant} size={size} onClick={onClick} disabled={loading}>
      {loading ? "Loading..." : children}
    </Button>
  )
}
