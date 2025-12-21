import { Users, Clock, Languages, FileDown, Copy, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Users,
    title: "Speaker labels",
    description: "Automatically detect and label different speakers",
    badge: "Optional",
  },
  {
    icon: Clock,
    title: "Timestamps",
    description: "Toggle timestamps on or off as needed",
  },
  {
    icon: Languages,
    title: "Translation",
    description: "Translate your transcript to other languages",
    badge: "Coming soon",
  },
  {
    icon: FileDown,
    title: "Multiple formats",
    description: "Download as TXT, SRT, VTT, DOCX, or PDF",
  },
  {
    icon: Copy,
    title: "Copy to clipboard",
    description: "One-click copy for easy sharing",
  },
  {
    icon: Search,
    title: "Search inside",
    description: "Find specific words or phrases instantly",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Powerful features</h2>
          <p className="mt-3 text-muted-foreground">Everything you need for perfect transcripts</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 bg-card shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      {feature.badge && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {feature.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
