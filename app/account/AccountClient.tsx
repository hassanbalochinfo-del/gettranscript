"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { UI_COPY, PLAN_PRICES } from "@/lib/constants"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type UserData = {
  user: {
    id: string
    email: string
    name: string | null
    creditsBalance: number
  }
  subscription: {
    id: string
    status: string
    plan: string
    currentPeriodEnd: string | null
  } | null
}

export default function AccountClient() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchUserData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router])

  // After a successful checkout redirect, webhooks may take a few seconds to arrive.
  // Poll briefly so credits/subscription show "immediately" without manual refresh.
  useEffect(() => {
    if (status !== "authenticated") return

    const payment = searchParams.get("payment")
    const checkout = searchParams.get("checkout")
    const shouldPoll = payment === "success" || checkout === "success"
    if (!shouldPoll) return

    let attempts = 0
    const maxAttempts = 10 // ~30s
    const intervalMs = 3000

    const timer = setInterval(async () => {
      attempts += 1
      await fetchUserData()
      if (attempts >= maxAttempts) {
        clearInterval(timer)
      }
    }, intervalMs)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, searchParams])

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/me")
      if (!res.ok) throw new Error("Failed to fetch user data")
      const data = await res.json()
      setUserData(data)
    } catch (error: any) {
      toast.error(error.message || "Failed to load account data")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!userData) {
    return null
  }

  const { user, subscription } = userData
  const isActive = subscription?.status === "active"
  const planName = subscription?.plan || "none"
  const planPrice = subscription?.plan ? PLAN_PRICES[subscription.plan as keyof typeof PLAN_PRICES] : null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Account</h1>
            <p className="text-muted-foreground mt-2">Manage your subscription and credits</p>
          </div>

          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Your current plan and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{planName} Plan</p>
                      <p className="text-sm text-muted-foreground">{planPrice ? `$${planPrice}/month` : "No plan"}</p>
                    </div>
                    <Badge variant={isActive ? "default" : "secondary"}>{subscription.status}</Badge>
                  </div>
                  {subscription.currentPeriodEnd && (
                    <p className="text-sm text-muted-foreground">
                      {isActive
                        ? `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                        : `Expired on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                    </p>
                  )}
                  {!isActive && (
                    <div className="pt-2">
                      <Button asChild>
                        <Link href="/pricing">{UI_COPY.renewSubscription}</Link>
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-4">No active subscription</p>
                  <Button asChild>
                    <Link href="/pricing">{UI_COPY.viewPlans}</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credits Balance */}
          <Card>
            <CardHeader>
              <CardTitle>Credits</CardTitle>
              <CardDescription>Your available transcript credits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{user.creditsBalance}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isActive ? "Credits available" : "Credits saved (subscription required to use)"}
                  </p>
                </div>
                {!isActive && user.creditsBalance > 0 && (
                  <Button asChild variant="outline">
                    <Link href="/pricing">{UI_COPY.renewToUnlock}</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              {user.name && (
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              )}
              <div className="pt-4">
                <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

