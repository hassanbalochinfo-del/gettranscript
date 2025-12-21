"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Upload, Zap, Shield, Clock, FileText } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const [url, setUrl] = useState("")

  return (
    <section className="relative overflow-hidden bg-background pb-16 pt-12 sm:pb-24 sm:pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Instant Video Transcripts
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
            Paste a link or upload a file. Get a clean transcript in seconds. Copy, edit, and download.
          </p>

          {/* Main Input */}
          <div className="mt-10">
            <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
              <Input
                type="url"
                placeholder="Paste YouTube link here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 flex-1 rounded-xl border-border bg-card text-base shadow-sm"
              />
              <Button size="lg" className="h-12 rounded-xl px-6 shadow-sm" asChild>
                <Link href={url ? `/app?url=${encodeURIComponent(url)}` : "/app"}>
                  Get Transcript
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link href="/app">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload a file
                </Link>
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-2 text-sm text-secondary-foreground">
              <Zap className="h-4 w-4 text-primary" />
              <span>Fast</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-2 text-sm text-secondary-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Private</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-2 text-sm text-secondary-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Accurate</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-2 text-sm text-secondary-foreground">
              <FileText className="h-4 w-4 text-primary" />
              <span>TXT/SRT/VTT/PDF/DOCX</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
