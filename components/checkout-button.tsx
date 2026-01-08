"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type Plan = "starter" | "pro" | "plus"

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
      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })

      if (res.status === 401) {
        toast.error("Please log in to subscribe.")
        router.push(`/login?next=${encodeURIComponent("/pricing")}`)
        return
      }

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        const errorMsg = data?.error || data?.detail?.errors?.[0]?.detail || "Failed to start checkout"
        console.error("Checkout error:", { status: res.status, data })
        toast.error(errorMsg)
        return
      }

      if (!data?.checkoutUrl) {
        toast.error("Checkout URL missing")
        return
      }

      window.location.href = String(data.checkoutUrl)
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
