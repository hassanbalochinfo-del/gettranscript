import { Link2, Cpu, Download } from "lucide-react"

const steps = [
  {
    icon: Link2,
    title: "Paste link / Upload",
    description: "Paste a YouTube URL or upload your audio/video file",
  },
  {
    icon: Cpu,
    title: "We transcribe with AI",
    description: "Our AI processes your content in seconds",
  },
  {
    icon: Download,
    title: "Edit + Download",
    description: "Review, edit, and download in your preferred format",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">How it works</h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute -top-2 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
