import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * Translation endpoint - COMPLETELY FREE
 * 
 * IMPORTANT: This endpoint does NOT deduct credits.
 * Translation is free for all users, regardless of subscription status.
 * Credits are ONLY deducted when generating transcripts via /api/transcribe.
 */

type Segment = { text: string; start?: number; duration?: number }

// Keep in sync with the language options shown in the UI.
const SUPPORTED = new Set(["EN", "ES", "FR", "DE", "IT", "PT", "TR", "AR", "HI", "UR", "RU", "JA", "KO", "ZH"])

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
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

  let body: any = null
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, code: "INVALID_INPUT", error: "Expected JSON body." }, { status: 400 })
  }

  const targetLang = String(body?.targetLang || "").toUpperCase().trim()
  const sourceLang = body?.sourceLang ? String(body.sourceLang) : undefined
  const segments = Array.isArray(body?.segments) ? (body.segments as Segment[]) : null

  if (!targetLang || !SUPPORTED.has(targetLang)) {
    return NextResponse.json(
      { ok: false, code: "INVALID_INPUT", error: "Unsupported target language." },
      { status: 400 }
    )
  }

  if (!segments || segments.length === 0) {
    return NextResponse.json({ ok: false, code: "INVALID_INPUT", error: "Missing segments." }, { status: 400 })
  }

  const texts = segments.map((s) => String(s?.text ?? ""))

  // Translate in one request; keep alignment by returning an array with the same length/order.
  const prompt = [
    `Translate the following transcript segments into ${targetLang}.`,
    sourceLang ? `Source language hint: ${sourceLang}.` : "",
    "Return ONLY valid JSON: an array of strings, same length and same order as input.",
    "Do not add commentary, labels, or extra fields.",
    "",
    "Input JSON array:",
    JSON.stringify(texts),
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
      messages: [
        { role: "system", content: "You are a precise translation engine." },
        { role: "user", content: prompt },
      ],
    }),
  })

  const raw = await res.text()
  if (!res.ok) {
    const detail = safeJsonParse(raw) ?? { raw: raw.slice(0, 500) }
    return NextResponse.json(
      { ok: false, code: "UPSTREAM_ERROR", error: "Translation request failed.", detail },
      { status: 502 }
    )
  }

  const payload = safeJsonParse(raw)
  const content = payload?.choices?.[0]?.message?.content
  if (!content || typeof content !== "string") {
    return NextResponse.json({ ok: false, code: "UPSTREAM_ERROR", error: "Invalid translation response." }, { status: 502 })
  }

  const translated = safeJsonParse(content)
  if (!Array.isArray(translated) || translated.length !== segments.length) {
    return NextResponse.json(
      { ok: false, code: "UPSTREAM_ERROR", error: "Translation output shape mismatch." },
      { status: 502 }
    )
  }

  const out: Segment[] = segments.map((s, idx) => ({
    start: s.start,
    duration: s.duration,
    text: String(translated[idx] ?? ""),
  }))

  return NextResponse.json({ ok: true, segments: out })
}

