import { NextResponse } from "next/server"

export const runtime = "nodejs"

type Segment = { text: string; start?: number; duration?: number }

const SUPPORTED = new Set([
  "EN", "ES", "FR", "DE", "IT", "PT", "TR", "AR", "HI", "UR", "RU", "JA", "KO", "ZH",
])

const CHUNK_SIZE = 3500
const PARALLEL = 4

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function chunkText(text: string, maxSize = CHUNK_SIZE): string[] {
  if (text.length <= maxSize) return [text]

  const chunks: string[] = []
  const paragraphs = text.split(/\n{2,}/)
  let current = ""

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph
    if (next.length > maxSize && current) {
      chunks.push(current.trim())
      current = paragraph
    } else if (paragraph.length > maxSize) {
      if (current) {
        chunks.push(current.trim())
        current = ""
      }
      for (let i = 0; i < paragraph.length; i += maxSize) {
        chunks.push(paragraph.slice(i, i + maxSize))
      }
    } else {
      current = next
    }
  }

  if (current.trim()) chunks.push(current.trim())
  return chunks.length > 0 ? chunks : [text]
}

async function translateChunk(
  apiKey: string,
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<string> {
  const prompt = [
    `Translate the following text into ${targetLang}.`,
    sourceLang ? `Source language: ${sourceLang}.` : "",
    "Preserve paragraph breaks. Return ONLY the translated text — no labels, quotes, or JSON.",
    "",
    text,
  ]
    .filter(Boolean)
    .join("\n")

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: Math.min(4096, Math.ceil(text.length * 1.5)),
      messages: [
        { role: "system", content: "You are a fast, accurate translator. Output only the translation." },
        { role: "user", content: prompt },
      ],
    }),
  })

  const raw = await res.text()
  if (!res.ok) {
    const detail = safeJsonParse(raw) ?? { raw: raw.slice(0, 300) }
    throw new Error((detail as { error?: { message?: string } })?.error?.message || "Translation failed")
  }

  const payload = safeJsonParse(raw)
  const content = payload?.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error("Empty translation response")
  return content
}

async function translateInParallel(
  apiKey: string,
  chunks: string[],
  targetLang: string,
  sourceLang?: string
): Promise<string> {
  const results = new Array<string>(chunks.length)
  let index = 0

  async function worker() {
    while (index < chunks.length) {
      const i = index++
      results[i] = await translateChunk(apiKey, chunks[i], targetLang, sourceLang)
    }
  }

  await Promise.all(Array.from({ length: Math.min(PARALLEL, chunks.length) }, () => worker()))
  return results.join("\n\n")
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        code: "TRANSLATION_NOT_CONFIGURED",
        error: "Translation is not configured. Please set OPENAI_API_KEY on the server.",
      },
      { status: 501 }
    )
  }

  let body: Record<string, unknown> | null = null
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, code: "INVALID_INPUT", error: "Expected JSON body." }, { status: 400 })
  }

  const targetLang = String(body?.targetLang || "").toUpperCase().trim()
  const sourceLang = body?.sourceLang ? String(body.sourceLang) : undefined
  const segments = Array.isArray(body?.segments) ? (body.segments as Segment[]) : null
  const plainText = typeof body?.text === "string" ? body.text : null

  if (!targetLang || !SUPPORTED.has(targetLang)) {
    return NextResponse.json(
      { ok: false, code: "INVALID_INPUT", error: "Unsupported target language." },
      { status: 400 }
    )
  }

  const fullText =
    plainText?.trim() ||
    (segments?.length ? segments.map((s) => String(s?.text ?? "")).join("\n") : "")

  if (!fullText) {
    return NextResponse.json({ ok: false, code: "INVALID_INPUT", error: "Missing text to translate." }, { status: 400 })
  }

  try {
    const chunks = chunkText(fullText)
    const translated = await translateInParallel(apiKey, chunks, targetLang, sourceLang)

    return NextResponse.json({
      ok: true,
      text: translated,
      segments: [{ text: translated }],
      chunkCount: chunks.length,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Translation failed"
    return NextResponse.json(
      { ok: false, code: "UPSTREAM_ERROR", error: message },
      { status: 502 }
    )
  }
}
