import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "What video sources are supported?",
    answer:
      "Currently, we fully support YouTube videos. Support for TikTok, Instagram, X (Twitter), and Reddit is coming soon.",
  },
  {
    question: "How accurate are the transcripts?",
    answer:
      "Our AI-powered transcription achieves over 95% accuracy for clear audio. Accuracy may vary depending on audio quality, accents, and background noise.",
  },
  {
    question: "What export formats are available?",
    answer:
      "You can download transcripts in TXT, SRT, VTT, DOCX, and PDF formats. All formats are available on both free and paid plans.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Yes, we take privacy seriously. We don't store your videos, and transcripts are automatically deleted after 7 days on the free plan.",
  },
  {
    question: "Can I edit the transcript?",
    answer: "You can edit any part of the transcript directly in our editor before downloading.",
  },
  {
    question: "What's the maximum video length?",
    answer: "Free users can transcribe videos up to 30 minutes. Pro users have no length limits.",
  },
  {
    question: "How does speaker detection work?",
    answer:
      "Our AI automatically identifies different speakers in the audio and labels them (Speaker 1, Speaker 2, etc.). This feature is available on the Pro plan.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Frequently asked questions</h2>
          <p className="mt-3 text-muted-foreground">Everything you need to know about GetTranscript</p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-foreground">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
