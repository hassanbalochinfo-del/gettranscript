/**
 * UI Copy Strings and Constants
 */

export const UI_COPY = {
  // Subscription status messages
  subscriptionRequired: "Subscription required to use credits",
  renewToUnlock: "Renew to unlock your saved credits",
  outOfCredits: "You're out of credits. Upgrade or wait for next billing cycle.",
  subscriptionInactive: "Please renew your subscription to use your credits.",
  
  // Buttons
  renewSubscription: "Renew subscription",
  viewPlans: "View plans",
  upgrade: "Upgrade",
  getStarted: "Get started",
  
  // Pricing page
  pricingHeadline: "Simple, transparent pricing",
  pricingSubhead: "Choose the plan that fits your needs. Credits roll over forever.",
  
  // Plan features
  starterFeatures: [
    "100 credits per month",
    "Credits roll over",
    "Export transcripts",
    "Email support"
  ],
  proFeatures: [
    "200 credits per month",
    "Credits roll over",
    "Export transcripts",
    "Priority support",
    "All Starter features"
  ],
  plusFeatures: [
    "500 credits per month",
    "Credits roll over",
    "Export transcripts",
    "Priority support",
    "All Pro features",
    "Future AI features"
  ],
  
  // FAQs
  faqCreditsRollover: {
    q: "Do credits roll over?",
    a: "Yes! Credits never expire and roll over month to month. However, you need an active subscription to use your credits."
  },
  faqInactiveSubscription: {
    q: "What happens to my credits if I cancel?",
    a: "Your credits are saved and never expire. However, you'll need to renew your subscription to use them."
  },
  faqRefunds: {
    q: "Do you offer refunds?",
    a: "We offer refunds within 24 hours of purchase. Contact us at transcriptget@gmail.com for assistance."
  },
  faqCancelAnytime: {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time. Your credits will be saved for when you return."
  }
} as const

export const PLAN_CREDITS = {
  starter: 100,
  pro: 200,
  plus: 500
} as const

export const PLAN_PRICES = {
  starter: 5,
  pro: 10,
  plus: 15
} as const

export type PlanType = keyof typeof PLAN_CREDITS
