import { NextResponse } from "next/server";

export const runtime = "nodejs";

type TranscriptFormat = "json" | "text";

type CacheKey = string;
type CacheValue = {
  expiresAt: number;
  value: any;
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const cache = new Map<CacheKey, CacheValue>();

type RateEntry = { count: number; resetAt: number };
const RATE_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_PER_IP = 5; // 5 requests per minute per IP
const rate = new Map<string, RateEntry>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = rate.get(ip);
  if (!entry || entry.resetAt <= now) {
    rate.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (entry.count >= RATE_LIMIT_PER_IP) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  entry.count++;
  rate.set(ip, entry);
  return { allowed: true, retryAfterSeconds: 0 };
}

function buildCacheKey(input: { url: string; format: TranscriptFormat; includeTimestamp: boolean; sendMetadata: boolean }) {
  return `${input.url}|${input.format}|${input.includeTimestamp}|${input.sendMetadata}`;
}

function getCached(key: string) {
  const item = cache.get(key);
  if (!item) return null;
  if (item.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

function setCached(key: string, value: any) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  // small opportunistic cleanup
  if (cache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (v.expiresAt <= now) cache.delete(k);
    }
  }
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

function mapTranscriptApiError(status: number) {
  switch (status) {
    case 401:
      return { status: 401, code: "UNAUTHORIZED", message: "Invalid or missing TranscriptAPI key." };
    case 403:
      return { status: 403, code: "FORBIDDEN", message: "TranscriptAPI rejected this request (403). Check your API key status/plan or account restrictions." };
    case 402:
      return { status: 402, code: "PAYMENT_REQUIRED", message: "TranscriptAPI credits exhausted or no active plan." };
    case 404:
      return { status: 404, code: "NOT_FOUND", message: "Transcript unavailable for this video." };
    case 422:
      return { status: 422, code: "INVALID_INPUT", message: "Invalid YouTube URL or video ID." };
    case 429:
      return { status: 429, code: "RATE_LIMITED", message: "Upstream rate limited. Please retry shortly." };
    default:
      return { status, code: "UPSTREAM_ERROR", message: "Upstream error fetching transcript." };
  }
}

async function callTranscriptApi(params: {
  url: string;
  format: TranscriptFormat;
  includeTimestamp: boolean;
  sendMetadata: boolean;
}) {
  // Server-only secret (never expose to client)
  const apiKey = process.env.TRANSCRIPTAPI_KEY;
  if (!apiKey) {
    return { ok: false as const, status: 500, code: "CONFIG_MISSING", message: "Missing TRANSCRIPTAPI_KEY on server. Please add it to .env.local and restart the dev server." };
  }

  const qs = new URLSearchParams({
    video_url: params.url,
    format: params.format,
    include_timestamp: String(params.includeTimestamp),
    send_metadata: String(params.sendMetadata),
  });
  const endpoint = `https://transcriptapi.com/api/v2/youtube/transcript?${qs.toString()}`;

  // Retry 408/503 up to 2 times with small backoff
  const retryable = new Set([408, 503]);
  const backoffs = [250, 750]; // ms

  for (let attempt = 0; attempt < 1 + backoffs.length; attempt++) {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return { ok: true as const, status: 200, data };
    }

    if (retryable.has(res.status) && attempt < backoffs.length) {
      await sleep(backoffs[attempt]);
      continue;
    }

    let detail: any = null;
    try {
      const text = await res.text();
      // Try JSON parse first; otherwise keep short text snippet
      try {
        detail = JSON.parse(text);
      } catch {
        detail = { raw: text.slice(0, 500) };
      }
    } catch {
      // ignore
    }
    const mapped = mapTranscriptApiError(res.status);
    return { ok: false as const, status: mapped.status, code: mapped.code, message: mapped.message, detail };
  }

  return { ok: false as const, status: 500, code: "UPSTREAM_ERROR", message: "Unknown upstream error." };
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, code: "RATE_LIMITED", error: "Too many requests. Please try again soon." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "INVALID_INPUT", error: "Expected JSON body." },
      { status: 400 }
    );
    }

  const url = (body?.url || "").toString().trim();
  const format: TranscriptFormat = body?.format === "json" ? "json" : "text";
  const includeTimestamp = body?.includeTimestamp !== undefined ? Boolean(body.includeTimestamp) : false;
  const sendMetadata = body?.sendMetadata !== undefined ? Boolean(body.sendMetadata) : false;

  if (!url) {
    return NextResponse.json({ ok: false, code: "INVALID_INPUT", error: "Missing url." }, { status: 400 });
    }

  const cacheKey = buildCacheKey({ url, format, includeTimestamp, sendMetadata });
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const upstream = await callTranscriptApi({ url, format, includeTimestamp, sendMetadata });
  if (!upstream.ok) {
      return NextResponse.json(
      { ok: false, provider: "transcriptapi", code: upstream.code, error: upstream.message, detail: upstream.detail ?? null },
      { status: upstream.status }
      );
    }

  const data = upstream.data;
  const responsePayload: any = {
    ok: true,
    provider: "transcriptapi",
    videoId: data.video_id,
    language: data.language,
    transcript: data.transcript,
  };
  if (sendMetadata && data.metadata) {
    responsePayload.metadata = data.metadata;
  }

  setCached(cacheKey, responsePayload);
  return NextResponse.json(responsePayload);
}
