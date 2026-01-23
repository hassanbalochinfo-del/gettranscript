"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { ArrowLeft, Check, Copy, Download, Loader2, Languages, FileText, Sparkles } from "lucide-react"
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
  const [summary, setSummary] = useState<string | null>(null)
  const [summarizing, setSummarizing] = useState(false)
  const [activeTab, setActiveTab] = useState<"transcript" | "summary">("transcript")

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

  const handleSummarize = async () => {
    if (!rawTranscript || summarizing) return

    setSummarizing(true)
    setSummary(null)

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: rawTranscript,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === "RATE_LIMIT_EXCEEDED") {
          toast.error("Rate limit reached. Please try again in a few minutes.", {
            duration: 5000,
          })
          return
        }
        throw new Error(data.error || "Failed to generate summary")
      }

      if (data.ok && data.summary) {
        setSummary(data.summary)
        setActiveTab("summary")
        toast.success("Summary generated successfully!")
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate summary")
    } finally {
      setSummarizing(false)
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
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{metadata?.title || title || "Transcript"}</h1>
            {url ? (
              <p className="text-gray-600 text-sm">
                Source:{" "}
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">
                  {url}
                </a>
              </p>
            ) : null}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {canShowVideo && embedId ? (
                  <Card className="bg-gray-50 border-gray-200 overflow-hidden">
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

                <Card className="bg-gray-50 border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-gray-700 text-sm font-medium">Quick Actions</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      <Select
                        value={selectedLanguage}
                        onValueChange={handleTranslate}
                        disabled={translating || !rawTranscript}
                      >
                        <SelectTrigger className="h-9 bg-white border-gray-300 text-gray-900 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all">
                          <SelectValue
                            placeholder={
                              <>
                                <Languages className="h-4 w-4 mr-2 inline" />
                                Translate
                              </>
                            }
                          />
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

                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-gray-300 text-gray-900 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all"
                        onClick={handleSummarize}
                        disabled={summarizing || !rawTranscript}
                      >
                        {summarizing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Summarizing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Summarize
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-gray-300 text-gray-900 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all"
                        onClick={handleCopy}
                        disabled={!displayText}
                      >
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-gray-300 text-gray-900 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all"
                        onClick={() => handleDownload("txt")}
                        disabled={!displayText}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        TXT
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-gray-300 text-gray-900 hover:bg-emerald-600 hover:border-emerald-500 hover:text-white transition-all"
                        onClick={() => handleDownload("json")}
                        disabled={!displayText}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        JSON
                      </Button>
                    </div>
                  </div>
                  {translatedText ? (
                    <div className="mt-3">
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
                    </div>
                  ) : null}
                </Card>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "transcript" | "summary")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 border border-gray-200 mb-6 p-1">
                      <TabsTrigger
                        value="transcript"
                        className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-700"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {translatedText ? "Translated Transcript" : "Full Transcript"}
                      </TabsTrigger>
                      <TabsTrigger
                        value="summary"
                        className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-700"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Summary
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="transcript">
                      <Card className="bg-white border-gray-200 p-6">
                        {displayText ? (
                          <div className="max-h-[60vh] overflow-y-auto text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {displayText}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No transcript to display.</p>
                        )}
                      </Card>
                    </TabsContent>

                    <TabsContent value="summary">
                      <Card className="bg-white border-gray-200 p-6">
                        {summary ? (
                          <div className="space-y-4">
                            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {summary}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(summary)
                                  toast.success("Summary copied to clipboard!")
                                }}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Summary
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const blob = new Blob([summary], { type: "text/plain" })
                                  const blobUrl = URL.createObjectURL(blob)
                                  const a = document.createElement("a")
                                  a.href = blobUrl
                                  a.download = `${title || "summary"}_summary.txt`
                                  document.body.appendChild(a)
                                  a.click()
                                  document.body.removeChild(a)
                                  URL.revokeObjectURL(blobUrl)
                                  toast.success("Summary downloaded!")
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setSummary(null)}>
                                Hide
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-500">No summary yet. Click Summarize to generate one.</p>
                            <Button onClick={handleSummarize} disabled={summarizing || !rawTranscript}>
                              {summarizing ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Summarizing...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Summarize
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-gray-50 border-gray-200 p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Video Details
                  </h3>
                  <div className="space-y-4">
                    {metadata?.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={metadata.thumbnail_url}
                        alt="Video thumbnail"
                        className="w-full rounded-lg border border-gray-200 object-cover"
                      />
                    ) : null}
                    <div className="rounded-lg bg-white p-3 border border-gray-200">
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Title</p>
                      <p className="text-gray-900 font-medium text-sm">{metadata?.title || title || "—"}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-gray-200">
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Channel</p>
                      <p className="text-gray-900 font-medium text-sm">
                        {metadata?.author_url ? (
                          <a
                            href={metadata.author_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2 hover:text-gray-900"
                          >
                            {metadata?.author_name || "View channel"}
                          </a>
                        ) : (
                          metadata?.author_name || "—"
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-gray-200">
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Language</p>
                      <p className="text-gray-900 font-medium text-sm">{language || "—"}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-emerald-50 border-emerald-200 p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Quick Tips
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex gap-2 text-gray-700 text-sm">
                      <span className="text-emerald-600 flex-shrink-0 mt-1">→</span>
                      <span>If a video has no transcript available, it may be disabled by the creator.</span>
                    </li>
                    <li className="flex gap-2 text-gray-700 text-sm">
                      <span className="text-emerald-600 flex-shrink-0 mt-1">→</span>
                      <span>Use translation to compare phrasing across languages.</span>
                    </li>
                    <li className="flex gap-2 text-gray-700 text-sm">
                      <span className="text-emerald-600 flex-shrink-0 mt-1">→</span>
                      <span>Summaries help you capture the main points quickly.</span>
                    </li>
                  </ul>
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
