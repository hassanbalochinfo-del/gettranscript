import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * AI Polish endpoint - improves transcript readability
 * Automatically called during transcript generation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transcript, segments } = body

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      // If OpenAI is not configured, return original transcript
      return NextResponse.json({
        polished: typeof transcript === "string" ? transcript : null,
        segments: Array.isArray(segments) ? segments : null,
        polished: false,
      })
    }

    // If segments are provided, polish each segment individually to preserve timestamps
    if (Array.isArray(segments) && segments.length > 0) {
      const texts = segments.map((s: any) => String(s?.text ?? "").trim()).filter(Boolean)
      
      if (texts.length === 0) {
        return NextResponse.json({ polished: false, segments: segments })
      }

      // Polish all segments in one request for efficiency
      const prompt = `You are a professional transcript editor. Improve the following transcript segments for readability:
- Fix grammar and spelling errors
- Add proper punctuation
- Improve sentence structure and flow
- Maintain the original meaning and tone
- Keep the text natural and conversational
- Do not change technical terms or proper nouns unless they are misspelled

Return ONLY a valid JSON array of strings, same length and order as the input. Do not add commentary or extra fields.

Input segments:
${JSON.stringify(texts)}`

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: "You are a professional transcript editor. Return only valid JSON arrays.",
            },
            { role: "user", content: prompt },
          ],
        }),
      })

      if (!response.ok) {
        // If OpenAI fails, return original segments
        return NextResponse.json({ polished: false, segments: segments })
      }

      const data = await response.json()
      const content = data?.choices?.[0]?.message?.content
      
      if (!content) {
        return NextResponse.json({ polished: false, segments: segments })
      }

      // Parse the polished text array
      let polishedTexts: string[] = []
      try {
        const parsed = JSON.parse(content)
        if (Array.isArray(parsed) && parsed.length === texts.length) {
          polishedTexts = parsed.map((t: any) => String(t ?? "").trim())
        } else {
          return NextResponse.json({ polished: false, segments: segments })
        }
      } catch {
        return NextResponse.json({ polished: false, segments: segments })
      }

      // Map polished text back to segments with preserved timestamps
      const polishedSegments = segments.map((seg: any, idx: number) => ({
        ...seg,
        text: polishedTexts[idx] || seg.text,
      }))

      return NextResponse.json({
        polished: true,
        segments: polishedSegments,
      })
    }

    // If plain text transcript
    if (typeof transcript === "string" && transcript.trim()) {
      const prompt = `You are a professional transcript editor. Improve the following transcript for readability:
- Fix grammar and spelling errors
- Add proper punctuation
- Improve sentence structure and flow
- Maintain the original meaning and tone
- Keep the text natural and conversational
- Do not change technical terms or proper nouns unless they are misspelled

Return ONLY the polished transcript text, nothing else.

Transcript:
${transcript}`

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: "You are a professional transcript editor. Return only the polished text.",
            },
            { role: "user", content: prompt },
          ],
        }),
      })

      if (!response.ok) {
        return NextResponse.json({ polished: false, transcript: transcript })
      }

      const data = await response.json()
      const polished = data?.choices?.[0]?.message?.content?.trim()

      return NextResponse.json({
        polished: true,
        transcript: polished || transcript,
      })
    }

    return NextResponse.json({ polished: false, transcript: transcript, segments: segments })
  } catch (error: any) {
    // On any error, return original transcript
    return NextResponse.json({
      polished: false,
      error: error?.message,
    })
  }
}
