import { getYoutubeTranscriptFastPost } from "./articles/get-youtube-transcript-fast"
import { timestampsMakeTranscriptsBetterPost } from "./articles/timestamps-make-transcripts-better"
import { whyWeNeedSubtitlesPost } from "./articles/why-we-need-subtitles"
import { videoSourceQualityGuide } from "./articles/video-source-quality-guide"
import { comprehensibleInputEnglishPost } from "./articles/comprehensible-input-english"
import { bestAiToolsStudents2026Post } from "./articles/best-ai-tools-students-2026"

export type BlogPost = {
  slug: string
  title: string
  date: string
  excerpt: string
  html: string
  thumbnail?: string
  thumbnailAlt?: string
}

/** On-topic posts only — aligned with GetTranscript (YouTube transcripts, captions, video learning). */
export const BLOG_POSTS: BlogPost[] = [
  getYoutubeTranscriptFastPost,
  timestampsMakeTranscriptsBetterPost,
  whyWeNeedSubtitlesPost,
  videoSourceQualityGuide,
  comprehensibleInputEnglishPost,
  bestAiToolsStudents2026Post,
]

export function getPostBySlug(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null
}
