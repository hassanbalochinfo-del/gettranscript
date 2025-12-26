import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyLemonSqueezySignature, getCreditsForPlan, mapLemonSqueezyPlanToPlanType } from "@/lib/lemonsqueezy"
import type { PlanType } from "@/lib/constants"

export const runtime = "nodejs"

/**
 * Lemon Squeezy Webhook Handler
 * 
 * Handles webhook events from Lemon Squeezy:
 * - subscription_created
 * - subscription_updated
 * - subscription_payment_success
 * - subscription_payment_failed
 * - subscription_cancelled
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    if (!secret) {
      console.error("LEMONSQUEEZY_WEBHOOK_SECRET not configured")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    // Get raw body for signature verification
    const body = await req.text()
    const signature = req.headers.get("x-signature") || ""

    // Verify signature
    if (!verifyLemonSqueezySignature(body, signature, secret)) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    const eventName = event.meta?.event_name || event.event_name
    const data = event.data || {}
    const eventId = String(event.meta?.event_id || "")

    console.log(`Processing Lemon Squeezy webhook: ${eventName}`)

    // Handle different event types
    switch (eventName) {
      case "subscription_created":
      case "subscription.created": {
        // Create/update subscription record only (NO CREDITS HERE to avoid double-grant).
        await handleSubscriptionCreated(data)
        break
      }

      case "subscription_updated":
      case "subscription.updated": {
        await handleSubscriptionUpdated(data)
        break
      }

      case "subscription_payment_success":
      case "subscription.payment_success": {
        // Grant credits on successful payment (initial + renewals). Must be idempotent.
        await handlePaymentSuccess(data, eventId)
        break
      }

      case "subscription_payment_failed":
      case "subscription.payment_failed": {
        await handlePaymentFailed(data)
        break
      }

      case "subscription_cancelled":
      case "subscription.cancelled": {
        await handleSubscriptionCancelled(data)
        break
      }

      default:
        console.log(`Unhandled event type: ${eventName}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    )
  }
}

/**
 * Handle new subscription creation
 */
async function handleSubscriptionCreated(data: any) {
  const subscriptionId = data.id?.toString()
  const customerId = data.attributes?.customer_id?.toString()
  const orderId = data.attributes?.order_id?.toString()
  const variantId = data.attributes?.variant_id?.toString()
  const variantName = data.attributes?.variant_name
  const userEmail = (data.attributes?.user_email || data.attributes?.email || "").toString().toLowerCase()
  const status = (data.attributes?.status || "").toString()

  if (!subscriptionId) {
    console.error("Missing subscription ID")
    return
  }

  // Link subscription to the correct app user.
  // With hosted checkouts, the most reliable identifier is the email in the webhook payload.
  const user = userEmail
    ? await prisma.user.findUnique({ where: { email: userEmail } })
    : null

  const planType = mapLemonSqueezyPlanToPlanType(variantId, variantName)
  if (!planType) {
    console.error(`Could not map plan for variant: ${variantId}`)
    return
  }

  const currentPeriodEnd = data.attributes?.renews_at
    ? new Date(data.attributes.renews_at)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days

  if (!user) {
    console.error(`User not found for subscription_created email: ${userEmail || "(missing)"}`)
    return
  }

  // Create or update subscription
  await prisma.subscription.upsert({
    where: {
      lemonsqueezySubscriptionId: subscriptionId,
    },
    update: {
      status: normalizeLsStatus(status) || "active",
      plan: planType,
      currentPeriodEnd,
      lemonsqueezyCustomerId: customerId,
      lemonsqueezyOrderId: orderId,
      updatedAt: new Date(),
    },
    create: {
      userId: user.id,
      status: normalizeLsStatus(status) || "active",
      plan: planType,
      currentPeriodEnd,
      lemonsqueezySubscriptionId: subscriptionId,
      lemonsqueezyCustomerId: customerId,
      lemonsqueezyOrderId: orderId,
    },
  })
}

/**
 * Handle subscription updates (status changes)
 */
async function handleSubscriptionUpdated(data: any) {
  const subscriptionId = data.id?.toString()
  const status = data.attributes?.status

  if (!subscriptionId || !status) {
    return
  }

  const ourStatus = normalizeLsStatus(status) || "inactive"

  await prisma.subscription.updateMany({
    where: {
      lemonsqueezySubscriptionId: subscriptionId,
    },
    data: {
      status: ourStatus,
      updatedAt: new Date(),
    },
  })
}

/**
 * Handle successful payment (renewal)
 */
async function handlePaymentSuccess(data: any, eventId?: string) {
  const subscriptionId = data.attributes?.subscription_id?.toString() || data.id?.toString()
  const invoiceId = data.attributes?.invoice_id?.toString()
  const customerId = data.attributes?.customer_id?.toString()
  const orderId = data.attributes?.order_id?.toString()
  const variantId = data.attributes?.variant_id?.toString()
  const variantName = data.attributes?.variant_name
  const userEmail = (data.attributes?.user_email || data.attributes?.email || "").toString().toLowerCase()
  const renewsAt = data.attributes?.renews_at ? new Date(data.attributes.renews_at) : null

  if (!subscriptionId) {
    return
  }

  // Idempotency key: invoice_id is the best (stable), fallback to eventId.
  const externalId = invoiceId ? `ls_invoice_${invoiceId}` : `ls_event_${eventId || subscriptionId}`

  // Idempotency check
  const existingLedger = await prisma.creditLedger.findUnique({
    where: { externalId },
  })

  if (!existingLedger) {
    // Ensure we can map this payment to a user.
    const user = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null
    if (!user) {
      console.error(`User not found for payment_success email: ${userEmail || "(missing)"}`)
      return
    }

    // Ensure subscription exists/updated.
    const inferredPlan = mapLemonSqueezyPlanToPlanType(variantId, variantName)
    const plan = inferredPlan || "starter"

    await prisma.subscription.upsert({
      where: { lemonsqueezySubscriptionId: subscriptionId },
      update: {
        userId: user.id,
        status: "active",
        plan,
        currentPeriodEnd: renewsAt,
        lemonsqueezyCustomerId: customerId,
        lemonsqueezyOrderId: orderId,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        status: "active",
        plan,
        currentPeriodEnd: renewsAt,
        lemonsqueezySubscriptionId: subscriptionId,
        lemonsqueezyCustomerId: customerId,
        lemonsqueezyOrderId: orderId,
      },
    })

    const credits = getCreditsForPlan(plan as PlanType)
    const newBalance = user.creditsBalance + credits

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { creditsBalance: newBalance },
      }),
      prisma.creditLedger.create({
        data: {
          userId: user.id,
          type: "subscription_credit",
          amount: credits,
          balanceAfter: newBalance,
          description: `Subscription credits (${plan})`,
          externalId,
          metadata: {
            subscriptionId,
            invoiceId,
            eventId,
            customerId,
            orderId,
            userEmail,
          },
        },
      }),
    ])
  }
}

/**
 * Handle payment failure
 */
async function handlePaymentFailed(data: any) {
  const subscriptionId = data.attributes?.subscription_id?.toString() || data.id?.toString()

  if (!subscriptionId) {
    return
  }

  await prisma.subscription.updateMany({
    where: {
      lemonsqueezySubscriptionId: subscriptionId,
    },
    data: {
      status: "payment_failed",
      updatedAt: new Date(),
    },
  })
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(data: any) {
  const subscriptionId = data.id?.toString()

  if (!subscriptionId) {
    return
  }

  await prisma.subscription.updateMany({
    where: {
      lemonsqueezySubscriptionId: subscriptionId,
    },
    data: {
      status: "cancelled",
      updatedAt: new Date(),
    },
  })
}

function normalizeLsStatus(status: string | null | undefined): string | null {
  const s = (status || "").toString().toLowerCase()
  if (!s) return null
  if (s === "active") return "active"
  if (s === "cancelled" || s === "expired") return "cancelled"
  if (s === "past_due" || s === "unpaid") return "unpaid"
  if (s === "payment_failed") return "payment_failed"
  return "inactive"
}
