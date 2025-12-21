import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    content:
      "GetTranscript has saved me hours every week. The accuracy is incredible and the export options are exactly what I needed.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Podcast Host",
    content:
      "Finally, a transcription tool that just works. I paste my YouTube links and get perfect transcripts in seconds.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Researcher",
    content:
      "The speaker detection feature is a game-changer for my interview analysis. Highly recommend for anyone doing qualitative research.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Loved by creators</h2>
          <p className="mt-3 text-muted-foreground">See what our users are saying</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mt-4 text-sm text-foreground">{testimonial.content}</p>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
