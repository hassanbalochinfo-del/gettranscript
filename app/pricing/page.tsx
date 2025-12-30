import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { UI_COPY, PLAN_PRICES, PLAN_CREDITS } from "@/lib/constants"
import { PaddleCheckoutButton } from "@/components/paddle-checkout-button"

const plans = [
  {
    name: "Starter",
    price: PLAN_PRICES.starter,
    credits: PLAN_CREDITS.starter,
    features: UI_COPY.starterFeatures,
    plan: "starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: PLAN_PRICES.pro,
    credits: PLAN_CREDITS.pro,
    features: UI_COPY.proFeatures,
    plan: "pro",
    highlighted: true,
  },
  {
    name: "Plus",
    price: PLAN_PRICES.plus,
    credits: PLAN_CREDITS.plus,
    features: UI_COPY.plusFeatures,
    plan: "plus",
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pb-16 pt-12 sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {UI_COPY.pricingHeadline}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {UI_COPY.pricingSubhead}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.highlighted
                    ? "border-primary shadow-xl ring-2 ring-primary"
                    : "border-border"
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
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.credits} credits per month
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="flex-1 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <PaddleCheckoutButton
                      plan={plan.plan as any}
                      variant={plan.highlighted ? "default" : "outline"}
                      size="lg"
                      className="w-full"
                    >
                      {UI_COPY.getStarted}
                    </PaddleCheckoutButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQs */}
          <div className="mx-auto mt-20 max-w-3xl">
            <h2 className="text-center text-2xl font-bold text-foreground mb-8">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{UI_COPY.faqCreditsRollover.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{UI_COPY.faqCreditsRollover.a}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{UI_COPY.faqInactiveSubscription.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{UI_COPY.faqInactiveSubscription.a}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{UI_COPY.faqRefunds.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{UI_COPY.faqRefunds.a}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{UI_COPY.faqCancelAnytime.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{UI_COPY.faqCancelAnytime.a}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
