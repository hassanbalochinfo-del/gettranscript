import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

/**
 * AI Summarization endpoint - AVAILABLE TO ALL USERS
 * 
 * IMPORTANT: This endpoint does NOT deduct credits.
 * Summarization is available to all logged-in users (no subscription or credits required).
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

    // Verify user exists (no subscription or credits check required)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { ok: false, code: "USER_NOT_FOUND", error: "User not found." },
        { status: 404 }
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

    // Generate summary using OpenAI with retry logic and fallback
    const generateSummary = async (model: string, retryCount = 0): Promise<{ summary: string } | { error: string }> => {
      const prompt = `You are a professional video content summarizer. Create a clear, well-structured summary of the following video transcript.

STRUCTURE YOUR SUMMARY AS FOLLOWS:

1. **Introduction** (1-2 sentences)
   - Briefly state what the video is about and its main topic

2. **Main Points** (3-5 bullet points or short paragraphs)
   - Identify and explain the key points discussed
   - Use clear, concise language
   - Focus on the most important information

3. **Key Takeaways** (2-3 sentences)
   - Highlight the most valuable insights or lessons
   - What should the viewer remember?

4. **Conclusion** (1-2 sentences)
   - Summarize the overall message or purpose
   - What is the main takeaway?

GUIDELINES:
- Write in a clear, professional, and easy-to-read style
- Use proper paragraph breaks for readability
- Be specific and accurate - base everything on the transcript
- Aim for 250-400 words total
- Make it scannable - use formatting that helps readers quickly understand the content
- Focus on clarity and consistency

Transcript:
${transcript}

Summary:`

      try {
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content:
                  "You are a professional content summarizer. Create clear, well-structured summaries that help readers quickly understand video content. Use consistent formatting and clear language.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.5, // Lower temperature for more consistent results
            max_tokens: 1200, // Increased for better summaries
          }),
        })

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.json().catch(() => ({}))
          const errorMessage = errorData?.error?.message || ""
          
          // Handle rate limit - retry with fallback model or wait
          if ((errorMessage.includes("Rate limit") || errorMessage.includes("rate_limit")) && retryCount === 0) {
            // Try with gpt-3.5-turbo as fallback (usually has higher rate limits)
            if (model === "gpt-4o-mini") {
              console.log("Rate limit hit on gpt-4o-mini, trying gpt-3.5-turbo fallback")
              return generateSummary("gpt-3.5-turbo", 1)
            }
          }
          
          throw new Error(errorMessage || "OpenAI API error")
        }

        const openaiData = await openaiResponse.json()
        const summary = openaiData?.choices?.[0]?.message?.content?.trim() || ""

        if (!summary) {
          throw new Error("Empty summary returned")
        }

        return { summary }
      } catch (error: any) {
        const errorMessage = error?.message || "Unknown error"
        
        // If rate limit and we haven't tried fallback yet
        if (errorMessage.includes("Rate limit") && retryCount === 0 && model === "gpt-4o-mini") {
          console.log("Rate limit error, trying gpt-3.5-turbo fallback")
          return generateSummary("gpt-3.5-turbo", 1)
        }
        
        return { error: errorMessage }
      }
    }

    // Try with gpt-4o-mini first, fallback to gpt-3.5-turbo if rate limited
    const result = await generateSummary("gpt-4o-mini")
    
    if ("error" in result) {
      const errorMessage = result.error
      
      // Handle rate limit errors specifically
      if (errorMessage.includes("Rate limit") || errorMessage.includes("rate_limit")) {
        return NextResponse.json(
          {
            ok: false,
            code: "RATE_LIMIT_EXCEEDED",
            error: "OpenAI rate limit reached. Please try again in a few minutes. If this persists, the service may need to upgrade its OpenAI plan.",
          },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        {
          ok: false,
          code: "OPENAI_ERROR",
          error: errorMessage || "Failed to generate summary. Please try again.",
        },
        { status: 500 }
      )
    }

    const summary = result.summary


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
