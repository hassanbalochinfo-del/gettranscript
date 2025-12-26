import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

/**
 * Export transcript endpoint with credit gating
 * 
 * Requirements:
 * - User must be logged in
 * - User must have active subscription
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please log in to export transcripts" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          where: { status: "active" },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check subscription status
    const hasActiveSubscription = user.subscriptions.length > 0

    if (!hasActiveSubscription) {
      return NextResponse.json(
        {
          error: "Please renew your subscription to use your credits.",
          code: "SUBSCRIPTION_INACTIVE",
        },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { format, content, metadata } = body

    if (!content || !format) {
      return NextResponse.json(
        { error: "Content and format are required" },
        { status: 400 }
      )
    }

    // Generate file content
    let fileContent: string
    let mimeType: string
    let filename: string

    if (format === "json") {
      mimeType = "application/json"
      fileContent = typeof content === "string" ? content : JSON.stringify(content, null, 2)
      filename = `${metadata?.title || "transcript"}.json`
    } else {
      mimeType = "text/plain"
      fileContent = typeof content === "string" ? content : String(content)
      filename = `${metadata?.title || "transcript"}.txt`
    }

    // Return file as response
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename.replace(/[^\w\s.-]+/g, "")}"`,
      },
    })
  } catch (error: any) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
