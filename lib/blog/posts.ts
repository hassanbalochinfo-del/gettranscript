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
import { videoSourceQualityGuide } from "./articles/video-source-quality-guide"
import { whyWeNeedSubtitlesPost } from "./articles/why-we-need-subtitles"

export type BlogPost = {
  slug: string
  title: string
  date: string
  excerpt: string
  html: string
}

export const BLOG_POSTS: BlogPost[] = [
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
  {
    slug: "get-youtube-transcript-fast",
    title: "How to Get a YouTube Transcript Instantly",
    date: "2025-01-01",
    excerpt: "Paste a YouTube link, enable timestamps, and download a clean transcript in seconds.",
    html: `
      <p>Getting a transcript shouldn’t be a hassle. With GetTranscript, you can paste a YouTube video URL and fetch a clean transcript instantly.</p>
      <h2>Tips</h2>
      <ul>
        <li><strong>Use timestamps</strong> for quoting and navigation.</li>
        <li><strong>Download</strong> the transcript as TXT for easy sharing.</li>
        <li>If a transcript isn’t available, it may be disabled by the creator or restricted.</li>
      </ul>
    `,
  },
  {
    slug: "timestamps-make-transcripts-better",
    title: "Why Timestamps Make Transcripts More Useful",
    date: "2025-01-02",
    excerpt: "Timestamps help you jump to the exact moment and keep quotes verifiable.",
    html: `
      <p>Timestamps make transcripts actionable: you can cite exact moments, navigate quickly, and keep notes aligned to the video.</p>
      <p>Enable the <em>Include timestamps</em> toggle to get segment-level timing when available.</p>
    `,
  },
]

export function getPostBySlug(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null
}

