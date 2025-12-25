"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UI_COPY } from "@/lib/constants"
import { X } from "lucide-react"
import { useState } from "react"

type UpgradeBannerProps = {
  message?: string
  variant?: "subscription" | "credits"
  onDismiss?: () => void
}

export function UpgradeBanner({
  message,
  variant = "subscription",
  onDismiss,
}: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const displayMessage =
    message ||
    (variant === "subscription"
      ? UI_COPY.subscriptionRequired
      : UI_COPY.outOfCredits)

  return (
    <Card className="border-primary/50 bg-primary/5 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-foreground">{displayMessage}</p>
          {variant === "subscription" && (
            <p className="text-sm text-muted-foreground mt-1">
              {UI_COPY.renewToUnlock}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/pricing">{UI_COPY.viewPlans}</Link>
          </Button>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
