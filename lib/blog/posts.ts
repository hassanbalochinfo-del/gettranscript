import { picassoTimelinePost } from "./articles/picasso-timeline"
import { imaxCameraPost } from "./articles/imax-camera"
import { journalismNewsPost } from "./articles/journalism-news"
import { ramPricesHighPost } from "./articles/ram-prices-high"
import { solarGreenEnergyPost } from "./articles/solar-green-energy"
import { boredomBenefitsPost } from "./articles/boredom-benefits"
import { subscriptionEconomyPost } from "./articles/subscription-economy"
import { techFailsPost } from "./articles/tech-fails"
import { lieDetectorsPost } from "./articles/lie-detectors"
import { aiChangingJobsPost } from "./articles/ai-changing-jobs"
import { lifeAlgorithmAgiPost } from "./articles/life-algorithm-agi"
import { neuromorphicComputingPost } from "./articles/neuromorphic-computing"
import { goldInvestment2026Post } from "./articles/gold-investment-2026"
import { differinGelBenefitsPost } from "./articles/differin-gel-benefits"
import { residencyWithoutMillionsPost } from "./articles/residency-without-millions"
import { bestAiToolsStudents2026Post } from "./articles/best-ai-tools-students-2026"
import { nolanOdyssey2026Post } from "./articles/nolan-odyssey-2026"
import { comprehensibleInputEnglishPost } from "./articles/comprehensible-input-english"
import { whyWeNeedSubtitlesPost } from "./articles/why-we-need-subtitles"
import { videoSourceQualityGuide } from "./articles/video-source-quality-guide"
import { getYoutubeTranscriptFastPost } from "./articles/get-youtube-transcript-fast"
import { timestampsMakeTranscriptsBetterPost } from "./articles/timestamps-make-transcripts-better"

export type BlogPost = {
  slug: string
  title: string
  date: string
  excerpt: string
  html: string
  /** Hero / card image (falls back to first image in html) */
  thumbnail?: string
  thumbnailAlt?: string
}

export const BLOG_POSTS: BlogPost[] = [
  picassoTimelinePost,
  imaxCameraPost,
  journalismNewsPost,
  ramPricesHighPost,
  solarGreenEnergyPost,
  boredomBenefitsPost,
  subscriptionEconomyPost,
  techFailsPost,
  lieDetectorsPost,
  aiChangingJobsPost,
  lifeAlgorithmAgiPost,
  neuromorphicComputingPost,
  goldInvestment2026Post,
  differinGelBenefitsPost,
  residencyWithoutMillionsPost,
  bestAiToolsStudents2026Post,
  nolanOdyssey2026Post,
  comprehensibleInputEnglishPost,
  whyWeNeedSubtitlesPost,
  videoSourceQualityGuide,
  getYoutubeTranscriptFastPost,
  timestampsMakeTranscriptsBetterPost,
]

export function getPostBySlug(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null
}
