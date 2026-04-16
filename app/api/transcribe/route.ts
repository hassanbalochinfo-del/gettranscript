import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

function extractYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, "")
    
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0]
      return id || null
    }
    
    if (host.endsWith("youtube.com")) {
      const v = u.searchParams.get("v")
      if (v) return v
      
      const parts = u.pathname.split("/").filter(Boolean)
      const shortsIdx = parts.indexOf("shorts")
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1]
      
      const embedIdx = parts.indexOf("embed")
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1]
    }
    
    return null
  } catch {
    return null
  }
}

function hhmmssToSeconds(input: string | undefined | null): number | undefined {
  if (!input) return undefined
  const s = input.trim()
  // Supports HH:MM:SS, MM:SS, SS
  const parts = s.split(":").map((p) => p.trim())
  if (parts.some((p) => p.length === 0 || Number.isNaN(Number(p)))) return undefined
  const nums = parts.map((p) => Number(p))
  if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2]
  if (nums.length === 2) return nums[0] * 60 + nums[1]
  if (nums.length === 1) return nums[0]
  return undefined
}

function pickTranscriptSegments(data: any): { segments: Array<{ text: string; start?: number; duration?: number }>; language?: string } | null {
  // Possible shapes:
  // - { transcript: [{ start/end/text }] }
  // - { transcripts: { en: { custom: [{ start/end/text }] } } }
  // - nested under data.*
  const root = data?.data ?? data

  // 1) direct array
  const direct = root?.transcript
  if (Array.isArray(direct)) {
    const segments = direct
      .map((it: any) => {
        const text = String(it?.text ?? it?.transcript ?? "").trim()
        if (!text) return null
        const start = typeof it?.start === "number" ? it.start : hhmmssToSeconds(it?.start)
        const end = typeof it?.end === "number" ? it.end : hhmmssToSeconds(it?.end)
        const duration = typeof it?.duration === "number" ? it.duration : typeof start === "number" && typeof end === "number" ? Math.max(0, end - start) : undefined
        return { text, start, duration }
      })
      .filter(Boolean) as Array<{ text: string; start?: number; duration?: number }>
    return { segments }
  }

  // 2) transcripts map by language
  const transcripts = root?.transcripts
  if (transcripts && typeof transcripts === "object") {
    const languagePreference = typeof root?.language === "string" ? root.language : "en"
    const langKey =
      (languagePreference && transcripts[languagePreference] ? languagePreference : null) ??
      (transcripts.en ? "en" : null) ??
      (Object.keys(transcripts)[0] ?? null)

    if (!langKey) return null
    const langObj = transcripts[langKey]
    const arr =
      langObj?.custom ??
      langObj?.default ??
      langObj?.segments ??
      langObj?.transcript ??
      (Array.isArray(langObj) ? langObj : null)

    if (!Array.isArray(arr)) return null
    const segments = arr
      .map((it: any) => {
        const text = String(it?.text ?? it?.transcript ?? "").trim()
        if (!text) return null
        const start = typeof it?.start === "number" ? it.start : hhmmssToSeconds(it?.start)
        const end = typeof it?.end === "number" ? it.end : hhmmssToSeconds(it?.end)
        const duration = typeof it?.duration === "number" ? it.duration : typeof start === "number" && typeof end === "number" ? Math.max(0, end - start) : undefined
        return { text, start, duration }
      })
      .filter(Boolean) as Array<{ text: string; start?: number; duration?: number }>
    return { segments, language: langKey }
  }

  return null
}

/**
 * GET /api/transcribe - Fetch existing transcript (NO CHARGE)
 * Query params: videoId, userId (optional)
 * Returns transcript if it exists, otherwise 404
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const videoId = searchParams.get("videoId")
    const userId = searchParams.get("userId")

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 })
    }

    // If userId provided, check if we have a transcript record for this user+video
    if (userId) {
      const existingLedger = await prisma.creditLedger.findFirst({
        where: {
          userId,
          externalId: `transcribe_${userId}_${videoId}`,
          type: "transcript_generated",
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      })

      if (existingLedger) {
        // User has already generated this transcript, but we don't store the transcript itself
        // Return a signal that it exists (client should use cached/URL param version)
        return NextResponse.json({
          exists: true,
          videoId,
          message: "Transcript already generated for this user and video",
        })
      }
    }

    // For now, GET endpoint just confirms if transcript was generated
    // Actual transcript should come from URL params or client-side cache
    return NextResponse.json({
      exists: false,
      videoId,
      message: "Transcript not found. Generate it using POST /api/transcribe",
    }, { status: 404 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to check transcript" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/transcribe - Generate transcript (public, no login, no credits)
 * Body: { url, format?, sendMetadata?, requestId? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, format = "json", sendMetadata = false, requestId } = body

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const videoId = extractYouTubeVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
    }

    const apiKey = process.env.TRANSCRIPTAPI_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "TranscriptAPI key not configured" },
        { status: 500 }
      )
    }

    // Call official TranscriptAPI endpoint (YouTube)
    // Endpoint exists: GET https://transcriptapi.com/api/v2/youtube/transcript?video_url=VIDEO_URL
    // Auth: Authorization: Bearer YOUR_API_KEY
    const transcriptApiUrl = `https://transcriptapi.com/api/v2/youtube/transcript?video_url=${encodeURIComponent(url)}`

    const response = await fetch(transcriptApiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        // Some docs mention x-api-key; sending both is safe.
        "x-api-key": apiKey,
      },
      // avoid caching in serverless
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData: any
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || "Failed to fetch transcript" }
      }

      return NextResponse.json(
        {
          error: errorData.error || errorData.message || "Failed to fetch transcript",
          code: errorData.code,
          detail: errorData,
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    const picked = pickTranscriptSegments(data)
    if (!picked || !picked.segments || picked.segments.length === 0) {
      return NextResponse.json(
        { error: "No transcript found for this video.", code: "NO_TRANSCRIPT", detail: data },
        { status: 404 }
      )
    }

    const language = picked.language || (typeof data?.language === "string" ? data.language : "") || ""

    const metadata =
      sendMetadata
        ? {
            title: data?.video?.title ?? data?.title ?? null,
            author_name: data?.video?.channel ?? data?.channel ?? data?.author ?? null,
            author_url: data?.video?.channel_url ?? data?.channel_url ?? null,
            thumbnail_url:
              data?.video?.thumbnail ??
              data?.thumbnail ??
              `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          }
        : undefined

    // Automatically polish the transcript using AI
    let polishedSegments = picked.segments
    let polishedTranscript: string | null = null
    let isPolished = false

    // Automatically polish the transcript using AI (silently, no badge shown)
    const openaiKey = process.env.OPENAI_API_KEY
    const aiConfigured = Boolean(openaiKey)
    
    // Always return as plain text paragraph (no timestamps, no segments)
    const plainText = picked.segments.map((s) => s.text).join(" ")
    let polishedText = plainText
    
    if (openaiKey && plainText.trim()) {
      try {
        const prompt = `You are a professional transcript editor. Clean up this transcript while preserving its original structure and conversational style.

CRITICAL RULES:
- Fix obvious spelling mistakes and typos (e.g., "teh" → "the", "recieve" → "receive")
- Fix grammar errors (subject-verb agreement, verb tenses, etc.)
- Add missing punctuation (periods, commas, question marks)
- Fix common speech-to-text errors (e.g., "um", "uh" can be removed if excessive)
- Keep the transcript format - do NOT rewrite as an essay or formal document
- Maintain the natural, conversational flow and tone
- Preserve all technical terms, names, and proper nouns exactly as spoken (unless clearly misspelled)
- Keep the original sentence structure - only fix mistakes, don't rewrite for style
- Do not add information that wasn't in the original
- Return the cleaned transcript as a continuous paragraph, preserving the natural flow

Return ONLY the cleaned transcript text, nothing else.

Transcript:
${plainText}`

        const polishResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.2, // Lower temperature for more consistent, conservative edits
            messages: [
              {
                role: "system",
                content: "You are a careful transcript editor. Fix mistakes and errors while preserving the original transcript's structure, tone, and content. Return only the cleaned text.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: Math.min(Math.ceil(plainText.length * 1.2), 4000), // Allow some growth but cap it
          }),
        })

        if (polishResponse.ok) {
          const polishData = await polishResponse.json()
          const polished = polishData?.choices?.[0]?.message?.content?.trim()
          if (polished && polished.length > 0) {
            polishedText = polished
            isPolished = true
          }
        }
      } catch (error) {
        // If polishing fails, continue with original transcript
        // Silently fail - polishing is enhancement, not required
        console.error("Polishing error:", error)
      }
    }

    // Always return as plain text paragraph (no timestamps, no segments)
    return NextResponse.json({
      transcript: polishedText,
      videoId,
      language,
      metadata,
      polished: isPolished,
      aiConfigured,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to transcribe video" },
      { status: 500 }
    )
  }
}
