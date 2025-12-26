"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { AdSlot } from "@/components/adsense/AdSlot"
import { ArrowLeft, Check, Copy, Download, Loader2 } from "lucide-react"

type TranscriptSegment = {
  text: string
  start?: number
  duration?: number
}

type TranscriptMetadata = {
  title?: string | null
  author_name?: string | null
  author_url?: string | null
  thumbnail_url?: string | null
}

function formatTimestamp(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  const mm = String(Math.floor(s / 60)).padStart(2, "0")
  const ss = String(s % 60).padStart(2, "0")
  return `${mm}:${ss}`
}

function isYouTubeChannelUrl(input: string) {
  try {
    const u = new URL(input)
    const host = u.hostname.replace(/^www\./, "")
    if (host !== "youtube.com" && host !== "m.youtube.com") return false
    const p = u.pathname
    return (
      p.startsWith("/@") ||
      p.startsWith("/channel/") ||
      p.startsWith("/c/") ||
      p.startsWith("/user/") ||
      p === "/channel" ||
      p === "/c" ||
      p === "/user"
    )
  } catch {
    return false
  }
}

function extractYouTubeVideoId(input: string) {
  try {
    const u = new URL(input)
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

export default function ResultClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const url = searchParams.get("url") || ""
  const transcriptParam = searchParams.get("transcript")
  const titleParam = searchParams.get("title")

  const adSenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const adSenseSlotResult = process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rawTranscript, setRawTranscript] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [videoId, setVideoId] = useState<string>("")
  const [language, setLanguage] = useState<string>("")
  const [metadata, setMetadata] = useState<TranscriptMetadata | null>(null)
  const [includeTimestamps, setIncludeTimestamps] = useState<boolean>(true)
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [copied, setCopied] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const segmentRefs = useRef<Array<HTMLDivElement | null>>([])

  const displayText = useMemo(() => {
    if (segments.length > 0) {
      if (includeTimestamps) {
        return segments
          .map((s) => (typeof s.start === "number" ? `[${formatTimestamp(s.start)}] ${s.text}` : s.text))
          .join("\n")
      }
      return segments.map((s) => s.text).join(" ")
    }
    return rawTranscript || ""
  }, [segments, includeTimestamps, rawTranscript])

  useEffect(() => {
    if (transcriptParam) {
      setRawTranscript(decodeURIComponent(transcriptParam))
      setTitle(titleParam ? decodeURIComponent(titleParam) : "Transcript")
      setLoading(false)
      return
    }

    if (!url) {
      setError("No URL provided. Please go back and paste a YouTube video link.")
      return
    }
    if (isYouTubeChannelUrl(url)) {
      setError("Please paste a YouTube video link, not a channel link.\n\nTip: open a video from the channel and paste that video URL.")
      return
    }

    const run = async () => {
      setLoading(true)
      setError(null)
      setRawTranscript("")
      setTitle("")
      setVideoId("")
      setLanguage("")
      setMetadata(null)
      setSegments([])

      try {
        const reqId =
          (globalThis.crypto as any)?.randomUUID?.() ??
          `${Date.now()}_${Math.random().toString(16).slice(2)}`

        const res = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            format: "json",
            includeTimestamp: includeTimestamps,
            sendMetadata: true,
            requestId: reqId,
          }),
        })

        const text = await res.text()
        if (!text || text.trim().length === 0) {
          setError("Server returned an empty response. Please try again.")
          return
        }

        let data: any
        try {
          data = JSON.parse(text)
        } catch {
          setError(`Invalid response from server: ${text.length > 200 ? text.slice(0, 200) + "…" : text}`)
          return
        }

        if (!res.ok) {
          const baseMsg = data?.error || "Failed to fetch transcript."
          const code = data?.code ? ` (${data.code})` : ""
          const detail = data?.detail?.detail || data?.detail?.message || data?.detail?.raw || null
          const detailMsg = detail ? `\n\nDetails: ${String(detail).slice(0, 300)}` : ""
          setError(`${baseMsg}${code}${detailMsg}`)
          return
        }

        setVideoId(String(data.videoId || ""))
        setLanguage(String(data.language || ""))
        setMetadata((data.metadata as TranscriptMetadata) ?? null)

        const tr = data.transcript
        if (Array.isArray(tr)) {
          setSegments(tr as TranscriptSegment[])
        } else if (typeof tr === "string") {
          setRawTranscript(tr)
        } else {
          setError("Unexpected transcript format returned by server.")
          return
        }

        const titleFromMeta = (data.metadata?.title as string | undefined) ?? null
        if (titleFromMeta) setTitle(titleFromMeta)
        else {
          const extracted = extractYouTubeVideoId(url)
          setTitle(extracted ? `Transcript • ${extracted}` : "Transcript")
        }
      } catch (e: any) {
        setError(e?.message || "Something went wrong.")
      } finally {
        setLoading(false)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, transcriptParam, titleParam, includeTimestamps])

  const handleCopy = async () => {
    if (!displayText) return
    await navigator.clipboard.writeText(displayText)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDownload = async (format: "txt" | "json" = "txt") => {
    if (!displayText) return

    setLoading(true)

    try {
      let content: string
      if (format === "json") {
        content = JSON.stringify(
          {
            title: metadata?.title || title,
            videoId,
            language,
            sourceUrl: url || undefined,
            segments,
            metadata,
          },
          null,
          2
        )
      } else {
        content = displayText
      }

      const response = await fetch("/api/transcript/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format,
          content,
          metadata: {
            title: metadata?.title || title,
            videoId,
            language,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        
        if (response.status === 401) {
          toast.error("Please log in to export transcripts")
          router.push("/login")
          return
        }
        
        if (response.status === 403 || response.status === 402) {
          toast.error(error.error || "Subscription required")
          router.push("/pricing")
          return
        }

        throw new Error(error.error || "Export failed")
      }

      // Download the file
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = response.headers.get("Content-Disposition")?.split('filename="')[1]?.split('"')[0] || `transcript.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
      
      toast.success(`Downloaded ${format.toUpperCase()}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to export transcript")
    } finally {
      setLoading(false)
    }
  }

  const onClickSegment = (idx: number) => {
    setActiveIndex(idx)
    const el = segmentRefs.current[idx]
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const canShowVideo = Boolean(url && extractYouTubeVideoId(url))
  const embedId = extractYouTubeVideoId(url) || videoId

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to home
              </Link>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight">{metadata?.title || title || "Transcript"}</h1>
              {url ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Source:{" "}
                  <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                    {url}
                  </a>
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleCopy} disabled={!displayText}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload("txt")} disabled={!displayText}>
                <Download className="h-4 w-4 mr-2" />
                Download TXT
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload("json")} disabled={!displayText || segments.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </div>

          <AdSlot client={adSenseClient} slot={adSenseSlotResult} className="w-full mb-6" />

          {!url && !transcriptParam ? (
            <Card className="border-border/60">
              <CardContent className="p-8 text-center text-muted-foreground">No URL or transcript provided.</CardContent>
            </Card>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading transcript…</span>
            </div>
          ) : null}

          {error ? (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-destructive">Unable to get transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-destructive/80">{error}</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Button variant="outline" onClick={() => router.push("/")}>
                    Try another video
                  </Button>
                  {url ? (
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      Retry
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {!loading && !error ? (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                {canShowVideo && embedId ? (
                  <Card className="border-border/60 overflow-hidden">
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube.com/embed/${embedId}`}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </Card>
                ) : null}

                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Transcript</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={includeTimestamps} onCheckedChange={setIncludeTimestamps} />
                      <span className="text-sm text-muted-foreground">Include timestamps</span>
                    </div>

                    <Separator />

                    {segments.length > 0 ? (
                      <div className="max-h-[70vh] overflow-auto rounded-lg border border-border/60">
                        <div className="p-4 space-y-2">
                          {segments.map((s, idx) => {
                            const hasTs = includeTimestamps && typeof s.start === "number"
                            return (
                              <div
                                key={idx}
                                ref={(el) => {
                                  segmentRefs.current[idx] = el
                                }}
                                className={`rounded-md px-2 py-2 text-sm leading-relaxed ${
                                  activeIndex === idx ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/40"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {hasTs ? (
                                    <button
                                      type="button"
                                      className="shrink-0 font-mono text-xs text-muted-foreground hover:text-foreground"
                                      onClick={() => onClickSegment(idx)}
                                    >
                                      {formatTimestamp(s.start as number)}
                                    </button>
                                  ) : null}
                                  <div className="text-foreground">{s.text}</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : rawTranscript ? (
                      <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">{rawTranscript}</pre>
                    ) : (
                      <p className="text-sm text-muted-foreground">No transcript to display.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Video details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {metadata?.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={metadata.thumbnail_url}
                        alt="Video thumbnail"
                        className="w-full rounded-lg border border-border/60 object-cover"
                      />
                    ) : null}
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{metadata?.title || title || "—"}</div>
                      <div className="text-sm text-muted-foreground">
                        Channel:{" "}
                        {metadata?.author_url ? (
                          <a
                            href={metadata.author_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2 hover:text-foreground"
                          >
                            {metadata?.author_name || "View channel"}
                          </a>
                        ) : (
                          metadata?.author_name || "—"
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">Language: {language || "—"}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>If a video has no transcript available, it may be disabled by the creator or restricted.</p>
                    <p>Use "Include timestamps" to make quoting and navigation easier.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  )
}
