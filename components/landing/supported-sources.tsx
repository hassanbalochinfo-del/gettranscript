import { Youtube, Instagram, Twitter } from "lucide-react"

const sources = [
  { name: "YouTube", icon: Youtube, active: true },
  { name: "TikTok", icon: null, active: false },
  { name: "Instagram", icon: Instagram, active: false },
  { name: "X (Twitter)", icon: Twitter, active: false },
  { name: "Reddit", icon: null, active: false },
]

export function SupportedSources() {
  return (
    <section className="bg-background py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h3 className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Supported Sources
        </h3>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
          {sources.map((source) => (
            <div
              key={source.name}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                source.active ? "bg-primary/10 text-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {source.icon ? <source.icon className="h-5 w-5" /> : <span className="h-5 w-5 rounded bg-current/20" />}
              <span className="text-sm font-medium">{source.name}</span>
              {!source.active && (
                <span className="ml-1 rounded bg-muted-foreground/20 px-1.5 py-0.5 text-xs">Soon</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
