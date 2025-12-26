"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, Check, Copy, Download, Loader2, Languages } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TranscriptMetadata = {
  title?: string | null
  author_name?: string | null
  author_url?: string | null
  thumbnail_url?: string | null
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

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rawTranscript, setRawTranscript] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [videoId, setVideoId] = useState<string>("")
  const [language, setLanguage] = useState<string>("")
  const [metadata, setMetadata] = useState<TranscriptMetadata | null>(null)
  const [copied, setCopied] = useState(false)
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [translating, setTranslating] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")

  const displayText = useMemo(() => {
    return translatedText || rawTranscript || ""
  }, [translatedText, rawTranscript])

  const handleTranslate = async (targetLang: string) => {
    if (!rawTranscript || translating) return

    setTranslating(true)
    setSelectedLanguage(targetLang)

    try {
      // Convert plain text to segments for translation API
      const segments = [{ text: rawTranscript }]
      
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments: segments,
          targetLang: targetLang,
          sourceLang: language || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Translation failed")
      }

      if (data.segments && Array.isArray(data.segments) && data.segments.length > 0) {
        setTranslatedText(data.segments[0].text)
        toast.success(`Translated to ${targetLang.toUpperCase()}`)
      }
    } catch (error: any) {
      toast.error(error.message || "Translation failed")
      setSelectedLanguage("")
    } finally {
      setTranslating(false)
    }
  }

  // Load transcript from cache (localStorage) or URL params (no API call, no charge)
  useEffect(() => {
    // First priority: URL params (if transcript was just generated)
    if (transcriptParam) {
      const transcript = decodeURIComponent(transcriptParam)
      setRawTranscript(transcript)
      setTitle(titleParam ? decodeURIComponent(titleParam) : "Transcript")
      
      // Also cache it in localStorage for future visits
      if (url) {
        const videoId = extractYouTubeVideoId(url)
        if (videoId) {
          const cacheKey = `transcript_${videoId}`
          localStorage.setItem(cacheKey, JSON.stringify({
            transcript,
            title: titleParam ? decodeURIComponent(titleParam) : null,
            url,
            timestamp: Date.now(),
          }))
        }
      }
      
      setLoading(false)
      return
    }

    // Second priority: Check localStorage cache
    if (url) {
      const videoId = extractYouTubeVideoId(url)
      if (videoId) {
        const cacheKey = `transcript_${videoId}`
        const cached = localStorage.getItem(cacheKey)
        
        if (cached) {
          try {
            const data = JSON.parse(cached)
            // Cache is valid for 24 hours
            const cacheAge = Date.now() - (data.timestamp || 0)
            const maxAge = 24 * 60 * 60 * 1000 // 24 hours
            
            if (cacheAge < maxAge && data.transcript) {
              setRawTranscript(data.transcript)
              if (data.title) setTitle(data.title)
              if (data.videoId) setVideoId(data.videoId)
              if (data.language) setLanguage(data.language)
              if (data.metadata) setMetadata(data.metadata)
              setLoading(false)
              return
            } else {
              // Cache expired, remove it
              localStorage.removeItem(cacheKey)
            }
          } catch {
            // Invalid cache, remove it
            localStorage.removeItem(cacheKey)
          }
        }
      }
    }

    // If URL is provided but no cached transcript, show message to generate
    if (url && !transcriptParam) {
      setError("Click 'Get Transcript' to generate the transcript for this video.")
      setLoading(false)
    } else if (!url && !transcriptParam) {
      setError("No URL provided. Please go back and paste a YouTube video link.")
      setLoading(false)
    }
  }, [url, transcriptParam, titleParam])

  // Function to generate transcript (only called when user clicks button)
  const handleGenerateTranscript = async () => {
    if (!url) {
      toast.error("Please enter a YouTube URL")
      return
    }

    if (isYouTubeChannelUrl(url)) {
      setError("Please paste a YouTube video link, not a channel link.\n\nTip: open a video from the channel and paste that video URL.")
      return
    }

    // Check cache first - if transcript exists, use it (no API call, no charge)
    const videoId = extractYouTubeVideoId(url)
    if (videoId) {
      const cacheKey = `transcript_${videoId}`
      const cached = localStorage.getItem(cacheKey)
      
      if (cached) {
        try {
          const data = JSON.parse(cached)
          const cacheAge = Date.now() - (data.timestamp || 0)
          const maxAge = 24 * 60 * 60 * 1000 // 24 hours
          
          if (cacheAge < maxAge && data.transcript) {
            // Use cached transcript (no API call, no charge)
            setRawTranscript(data.transcript)
            if (data.title) setTitle(data.title)
            if (data.videoId) setVideoId(data.videoId)
            if (data.language) setLanguage(data.language)
            if (data.metadata) setMetadata(data.metadata)
            toast.success("Loaded cached transcript")
            return
          } else {
            // Cache expired, remove it
            localStorage.removeItem(cacheKey)
          }
        } catch {
          localStorage.removeItem(cacheKey)
        }
      }
    }

    setLoading(true)
    setError(null)
    setRawTranscript("")
    setTitle("")
    setVideoId("")
    setLanguage("")
    setMetadata(null)
    setTranslatedText(null)

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          format: "json",
          sendMetadata: true,
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

      // Always expect plain text transcript (no segments, no timestamps)
      if (typeof data.transcript === "string") {
        setRawTranscript(data.transcript)
        
        // Cache transcript in localStorage for future visits (no API call on refresh)
        const videoId = extractYouTubeVideoId(url)
        if (videoId) {
          const cacheKey = `transcript_${videoId}`
          localStorage.setItem(cacheKey, JSON.stringify({
            transcript: data.transcript,
            title: data.metadata?.title || null,
            videoId: String(data.videoId || videoId),
            language: String(data.language || ""),
            metadata: data.metadata || null,
            url,
            timestamp: Date.now(),
          }))
        }
        
        // Update URL with transcript param (optional, for sharing)
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set("transcript", encodeURIComponent(data.transcript))
        if (data.metadata?.title) {
          newUrl.searchParams.set("title", encodeURIComponent(data.metadata.title))
        }
        window.history.replaceState({}, "", newUrl.toString())
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
      const safeTitle = String(metadata?.title || title || "transcript")
        .trim()
        .replace(/[^\w\s.-]+/g, "")
        .slice(0, 80) || "transcript"

      let content: string
      let mimeType: string
      let filename: string

      if (format === "json") {
        mimeType = "application/json"
        content = JSON.stringify(
          {
            title: metadata?.title || title,
            videoId,
            language: selectedLanguage || language,
            sourceUrl: url || undefined,
            transcript: displayText,
            metadata,
            translated: translatedText !== null,
          },
          null,
          2
        )
        filename = `${safeTitle}.json`
      } else {
        mimeType = "text/plain"
        content = displayText
        filename = `${safeTitle}.txt`
      }

      // Client-side download (no server call, no extra credit/gating)
      const blob = new Blob([content], { type: mimeType })
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = filename
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
              <h1 className="text-2xl font-semibold tracking-tight">{metadata?.title || title || "Transcript"}</h1>
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
              {rawTranscript && (
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedLanguage}
                    onValueChange={handleTranslate}
                    disabled={translating}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder={<><Languages className="h-4 w-4 mr-2 inline" />Translate</>} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="fr">🇫🇷 French</SelectItem>
                      <SelectItem value="de">🇩🇪 German</SelectItem>
                      <SelectItem value="it">🇮🇹 Italian</SelectItem>
                      <SelectItem value="pt">🇵🇹 Portuguese</SelectItem>
                      <SelectItem value="ru">🇷🇺 Russian</SelectItem>
                      <SelectItem value="ja">🇯🇵 Japanese</SelectItem>
                      <SelectItem value="ko">🇰🇷 Korean</SelectItem>
                      <SelectItem value="zh">🇨🇳 Chinese</SelectItem>
                      <SelectItem value="ar">🇸🇦 Arabic</SelectItem>
                      <SelectItem value="hi">🇮🇳 Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                  {translating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {translatedText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTranslatedText(null)
                        setSelectedLanguage("")
                      }}
                    >
                      Show Original
                    </Button>
                  )}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleCopy} disabled={!displayText}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload("txt")} disabled={!displayText}>
                <Download className="h-4 w-4 mr-2" />
                Download TXT
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload("json")} disabled={!displayText}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </div>

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
                <CardTitle className="text-base text-destructive">
                  {url && !transcriptParam ? "Generate Transcript" : "Unable to get transcript"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-destructive/80">{error}</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Button variant="outline" onClick={() => router.push("/")}>
                    Try another video
                  </Button>
                  {url && !transcriptParam ? (
                    <Button onClick={handleGenerateTranscript} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Get Transcript"
                      )}
                    </Button>
                  ) : url ? (
                    <Button variant="outline" onClick={handleGenerateTranscript} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Retry"
                      )}
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
                    <CardTitle className="text-base">
                      {translatedText ? "Translated Transcript" : "Transcript"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {displayText ? (
                      <div className="max-h-[70vh] overflow-auto rounded-lg border border-border/60 bg-muted/20 p-6">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground">
                          {displayText}
                        </p>
                      </div>
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
