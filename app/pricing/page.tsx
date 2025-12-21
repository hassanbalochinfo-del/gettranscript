import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out GetTranscript",
    features: [
      { name: "5 transcripts per day", included: true },
      { name: "Videos up to 30 minutes", included: true },
      { name: "Basic export formats (TXT, SRT)", included: true },
      { name: "7-day transcript history", included: true },
      { name: "Speaker detection", included: false },
      { name: "Priority processing", included: false },
      { name: "DOCX & PDF exports", included: false },
      { name: "Unlimited history", included: false },
    ],
    cta: "Get started",
    href: "/",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For power users and professionals",
    features: [
      { name: "Unlimited transcripts", included: true },
      { name: "No video length limits", included: true },
      { name: "All export formats", included: true },
      { name: "Unlimited transcript history", included: true },
      { name: "Speaker detection", included: true },
      { name: "Priority processing", included: true },
      { name: "DOCX & PDF exports", included: true },
      { name: "Priority support", included: true },
    ],
    cta: "Start free trial",
    href: "/",
    highlighted: true,
  },
]

const comparisonFeatures = [
  { feature: "Transcripts per day", free: "5", pro: "Unlimited" },
  { feature: "Max video length", free: "30 min", pro: "Unlimited" },
  { feature: "Processing speed", free: "Standard", pro: "Priority" },
  { feature: "Export formats", free: "TXT, SRT, VTT", pro: "All formats" },
  { feature: "Transcript history", free: "7 days", pro: "Unlimited" },
  { feature: "Speaker detection", free: "No", pro: "Yes" },
  { feature: "Translation", free: "No", pro: "Coming soon" },
  { feature: "Support", free: "Community", pro: "Priority" },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pb-16 pt-12 sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">Simple, transparent pricing</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Start free and upgrade when you need more. No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.highlighted ? "border-primary shadow-xl ring-2 ring-primary" : "border-border"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <X className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                        )}
                        <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-8 w-full" variant={plan.highlighted ? "default" : "outline"} size="lg" asChild>
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mx-auto mt-20 max-w-4xl">
            <h2 className="text-center text-2xl font-bold text-foreground">Feature comparison</h2>
            <div className="mt-8 overflow-hidden rounded-xl border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-primary">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comparisonFeatures.map((row) => (
                    <tr key={row.feature}>
                      <td className="px-6 py-4 text-sm text-foreground">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-sm text-muted-foreground">{row.free}</td>
                      <td className="px-6 py-4 text-center text-sm font-medium text-foreground">{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              Have questions?{" "}
              <Link href="/#faq" className="font-medium text-primary hover:underline">
                Check our FAQ
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="font-medium text-primary hover:underline">
                contact us
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
