"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type Plan = "starter" | "pro" | "plus"

const PADDLE_CHECKOUT_URLS: Record<Plan, string | undefined> = {
  starter: process.env.NEXT_PUBLIC_PADDLE_STARTER_URL,
  pro: process.env.NEXT_PUBLIC_PADDLE_PRO_URL,
  plus: process.env.NEXT_PUBLIC_PADDLE_PLUS_URL,
}

export function CheckoutButton({
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

  const onClick = async () => {
    if (loading) return
    setLoading(true)
    
    try {
      // Get Paddle checkout URL for this plan
      const checkoutUrl = PADDLE_CHECKOUT_URLS[plan]
      
      if (!checkoutUrl) {
        toast.error("Checkout not configured for this plan")
        return
      }

      // Redirect to Paddle hosted checkout
      // Paddle will handle payment and redirect back to /account?payment=success
      window.location.href = checkoutUrl
    } catch (error: any) {
      toast.error(error.message || "Failed to start checkout")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className={className} variant={variant} size={size} onClick={onClick} disabled={loading}>
      {loading ? "Redirecting…" : children}
    </Button>
  )
}

