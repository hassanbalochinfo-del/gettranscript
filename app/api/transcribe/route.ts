import { NextRequest, NextResponse } from "next/server"

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, format = "json", includeTimestamp = true, sendMetadata = false } = body

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

    // Call official TranscriptAPI endpoint
    // Docs: GET https://api.transcriptapi.com/api/v2/video-transcript?platform=youtube&video_id=VIDEO_ID
    // Auth: x-api-key: YOUR_API_KEY
    const transcriptApiUrl = `https://api.transcriptapi.com/api/v2/video-transcript?platform=youtube&video_id=${encodeURIComponent(
      videoId
    )}`

    const response = await fetch(transcriptApiUrl, {
      method: "GET",
      headers: {
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

    // Format response based on requested format
    if (format === "json" && includeTimestamp) {
      return NextResponse.json({
        transcript: picked.segments,
        videoId,
        language,
        metadata,
      })
    } else if (format === "json" && !includeTimestamp) {
      // Return plain text when timestamps not requested
      const plainText = picked.segments.map((s) => s.text).join(" ")
      return NextResponse.json({
        transcript: plainText,
        videoId,
        language,
        metadata,
      })
    } else {
      // Return as string
      return NextResponse.json({
        transcript: picked.segments.map((s) => s.text).join(" "),
        videoId,
        language,
        metadata,
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to transcribe video" },
      { status: 500 }
    )
  }
}
