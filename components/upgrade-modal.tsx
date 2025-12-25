"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UI_COPY } from "@/lib/constants"

type UpgradeModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: "subscription" | "credits"
}

export function UpgradeModal({
  open,
  onOpenChange,
  variant = "subscription",
}: UpgradeModalProps) {
  const message =
    variant === "subscription"
      ? UI_COPY.subscriptionInactive
      : UI_COPY.outOfCredits

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Required</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button asChild>
            <Link href="/pricing" onClick={() => onOpenChange(false)}>
              {UI_COPY.viewPlans}
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
