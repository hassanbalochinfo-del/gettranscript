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

    // Call TranscriptAPI.com via RapidAPI
    const transcriptApiUrl = "https://transcriptapi.p.rapidapi.com/api/v1/transcript"
    
    const response = await fetch(transcriptApiUrl, {
      method: "POST",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "transcriptapi.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_url: url,
      }),
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

    // Extract transcript data
    let transcript: any = null
    let metadata: any = null
    let language = ""

    if (data.transcript) {
      // Handle different response formats
      if (Array.isArray(data.transcript)) {
        transcript = data.transcript.map((item: any) => ({
          text: item.text || item.transcript || "",
          start: typeof item.start === "number" ? item.start : item.start_time || item.time || undefined,
          duration: typeof item.duration === "number" ? item.duration : item.duration_ms ? item.duration_ms / 1000 : undefined,
        }))
      } else if (typeof data.transcript === "string") {
        transcript = data.transcript
      } else if (data.transcript.text) {
        transcript = data.transcript.text
      }
    }

    if (sendMetadata && data.metadata) {
      metadata = {
        title: data.metadata.title || data.title,
        author_name: data.metadata.author_name || data.author || data.channel,
        author_url: data.metadata.author_url || data.channel_url,
        thumbnail_url: data.metadata.thumbnail_url || data.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      }
    }

    language = data.language || data.lang || ""

    // Format response based on requested format
    if (format === "json" && includeTimestamp && Array.isArray(transcript)) {
      return NextResponse.json({
        transcript,
        videoId,
        language,
        metadata: sendMetadata ? metadata : undefined,
      })
    } else if (format === "json" && !includeTimestamp && Array.isArray(transcript)) {
      // Return plain text when timestamps not requested
      const plainText = transcript.map((s: any) => s.text).join(" ")
      return NextResponse.json({
        transcript: plainText,
        videoId,
        language,
        metadata: sendMetadata ? metadata : undefined,
      })
    } else {
      // Return as-is (string transcript)
      return NextResponse.json({
        transcript: typeof transcript === "string" ? transcript : JSON.stringify(transcript),
        videoId,
        language,
        metadata: sendMetadata ? metadata : undefined,
      })
    }
  } catch (error: any) {
    console.error("Transcribe error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to transcribe video" },
      { status: 500 }
    )
  }
}
