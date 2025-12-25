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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ["active", "inactive", "cancelled", "payment_failed", "unpaid"],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Get most recent subscription
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const activeSubscription = user.subscriptions.find((sub) => sub.status === "active")

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
