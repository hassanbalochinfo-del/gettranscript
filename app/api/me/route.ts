import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // First, get user without subscriptions to avoid potential query issues
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        creditsBalance: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Then get subscriptions separately
    let activeSubscription = null
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: {
          userId: session.user.id,
          status: {
            in: ["active", "inactive", "cancelled", "payment_failed", "unpaid"],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      })

      activeSubscription = subscriptions.find((sub) => sub.status === "active") || null
    } catch (subError) {
      // If subscription query fails, log but don't fail the whole request
      console.error("Error fetching subscriptions:", subError)
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        creditsBalance: user.creditsBalance,
      },
      subscription: activeSubscription
        ? {
            id: activeSubscription.id,
            status: activeSubscription.status,
            plan: activeSubscription.plan,
            currentPeriodEnd: activeSubscription.currentPeriodEnd,
          }
        : null,
    })
  } catch (error: any) {
    console.error("Error fetching user data:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error?.message || "Unknown error",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
