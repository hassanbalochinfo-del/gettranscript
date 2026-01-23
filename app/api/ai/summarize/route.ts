import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

/**
 * AI Summarization endpoint - SUBSCRIPTION REQUIRED
 * 
 * IMPORTANT: This endpoint does NOT deduct credits.
 * Summarization is a subscription feature (requires active subscription).
 * Credits are ONLY deducted when generating transcripts via /api/transcribe.
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          code: "SUMMARIZATION_NOT_CONFIGURED",
          error: "Summarization is not configured. Please set OPENAI_API_KEY on the server.",
        },
        { status: 501 }
      )
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, code: "UNAUTHORIZED", error: "Please log in to use summarization." },
        { status: 401 }
      )
    }

    // Check subscription status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          where: {
            status: "active",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { ok: false, code: "USER_NOT_FOUND", error: "User not found." },
        { status: 404 }
      )
    }

    const hasActiveSubscription = user.subscriptions.length > 0
    if (!hasActiveSubscription) {
      return NextResponse.json(
        {
          ok: false,
          code: "SUBSCRIPTION_REQUIRED",
          error: "An active subscription is required to use the summarization feature. Please upgrade your plan.",
        },
        { status: 403 }
      )
    }

    // Get transcript from request
    const body = await req.json().catch(() => ({}))
    const transcript = body?.transcript || body?.text || ""

    if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
      return NextResponse.json(
        { ok: false, code: "INVALID_INPUT", error: "Transcript text is required." },
        { status: 400 }
      )
    }

    // Generate summary using OpenAI
    const prompt = `You are a professional video content summarizer. Create a comprehensive, well-structured summary of the following video transcript.

Requirements:
1. Start with a brief introduction (1-2 sentences) about what the video covers
2. List the main points discussed in a clear, organized manner
3. Include key takeaways and insights
4. End with a conclusion that captures the overall message and purpose of the video
5. Write in a professional, engaging tone
6. Use clear paragraphs and proper formatting
7. Make it comprehensive but concise (aim for 200-400 words)

Transcript:
${transcript}

Summary:`

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a professional content summarizer. Create clear, comprehensive summaries that capture the essence, main points, and key takeaways of video content.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}))
      console.error("OpenAI API error:", errorData)
      return NextResponse.json(
        {
          ok: false,
          code: "OPENAI_ERROR",
          error: errorData?.error?.message || "Failed to generate summary. Please try again.",
        },
        { status: 500 }
      )
    }

    const openaiData = await openaiResponse.json()
    const summary = openaiData?.choices?.[0]?.message?.content?.trim() || ""

    if (!summary) {
      return NextResponse.json(
        { ok: false, code: "EMPTY_SUMMARY", error: "Failed to generate summary. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      summary,
    })
  } catch (error: any) {
    console.error("Summarization error:", error)
    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        error: error?.message || "An error occurred while generating the summary.",
      },
      { status: 500 }
    )
  }
}
