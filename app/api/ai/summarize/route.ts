import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const MAX_TRANSCRIPT_CHARS = 14000

function trimTranscript(transcript: string) {
  if (transcript.length <= MAX_TRANSCRIPT_CHARS) {
    return { text: transcript, truncated: false }
  }
  return {
    text: transcript.slice(0, MAX_TRANSCRIPT_CHARS),
    truncated: true,
  }
}

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

    const body = await req.json().catch(() => ({}))
    const transcript = body?.transcript || body?.text || ""

    if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
      return NextResponse.json(
        { ok: false, code: "INVALID_INPUT", error: "Transcript text is required." },
        { status: 400 }
      )
    }

    const { text: transcriptForModel, truncated } = trimTranscript(transcript.trim())

    const prompt = `You help people understand YouTube videos without watching them. Write a clear, friendly summary from this transcript.

Rules:
- Use plain language (no jargon unless the video uses it)
- Be accurate — only include what the transcript supports
- Use this exact structure with markdown headings:

## What this video is about
2–3 short sentences explaining the topic in simple terms.

## Main points
- 4–6 bullet points with the most important ideas
- Each bullet should be one easy-to-read line

## Key takeaways
2–3 sentences on what matters most for the viewer.

## Who this is useful for
One sentence on who would benefit (students, creators, etc.).

${truncated ? "Note: The transcript was long — base the summary on the portion provided.\n" : ""}
Transcript:
${transcriptForModel}`

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
              "You write readable video summaries for everyday people. Use clear headings and bullets. Be concise and helpful.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 900,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}))
      const errorMessage = errorData?.error?.message || "OpenAI API error"

      if (errorMessage.includes("Rate limit") || errorMessage.includes("rate_limit")) {
        return NextResponse.json(
          {
            ok: false,
            code: "RATE_LIMIT_EXCEEDED",
            error: "Rate limit reached. Please try again in a few minutes.",
          },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { ok: false, code: "OPENAI_ERROR", error: errorMessage },
        { status: 500 }
      )
    }

    const openaiData = await openaiResponse.json()
    const summary = openaiData?.choices?.[0]?.message?.content?.trim() || ""

    if (!summary) {
      return NextResponse.json(
        { ok: false, code: "OPENAI_ERROR", error: "Empty summary returned." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      summary,
      truncated,
    })
  } catch (error: unknown) {
    console.error("Summarization error:", error)
    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        error: error instanceof Error ? error.message : "An error occurred while generating the summary.",
      },
      { status: 500 }
    )
  }
}
