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

    console.log(`Processing Lemon Squeezy webhook: ${eventName}`)

    // Handle different event types
    switch (eventName) {
      case "subscription_created":
      case "subscription.created": {
        await handleSubscriptionCreated(data, event.meta?.event_id)
        break
      }

      case "subscription_updated":
      case "subscription.updated": {
        await handleSubscriptionUpdated(data)
        break
      }

      case "subscription_payment_success":
      case "subscription.payment_success": {
        await handlePaymentSuccess(data, event.meta?.event_id)
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
async function handleSubscriptionCreated(data: any, eventId?: string) {
  const subscriptionId = data.id?.toString()
  const customerId = data.attributes?.customer_id?.toString()
  const orderId = data.attributes?.order_id?.toString()
  const variantId = data.attributes?.variant_id?.toString()
  const variantName = data.attributes?.variant_name

  if (!subscriptionId || !customerId) {
    console.error("Missing subscription or customer ID")
    return
  }

  // Find user by Lemon Squeezy customer ID (stored in user metadata or separate lookup)
  // For now, we'll need to store customer_id -> user_id mapping
  // You may need to adjust this based on how you link customers
  const user = await prisma.user.findFirst({
    where: {
      subscriptions: {
        some: {
          lemonsqueezyCustomerId: customerId,
        },
      },
    },
    include: {
      subscriptions: true,
    },
  })

  if (!user) {
    console.error(`User not found for customer ID: ${customerId}`)
    return
  }

  const planType = mapLemonSqueezyPlanToPlanType(variantId, variantName)
  if (!planType) {
    console.error(`Could not map plan for variant: ${variantId}`)
    return
  }

  const credits = getCreditsForPlan(planType)
  const currentPeriodEnd = data.attributes?.renews_at
    ? new Date(data.attributes.renews_at)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days

  // Create or update subscription
  const subscription = await prisma.subscription.upsert({
    where: {
      lemonsqueezySubscriptionId: subscriptionId,
    },
    update: {
      status: "active",
      plan: planType,
      currentPeriodEnd,
      lemonsqueezyCustomerId: customerId,
      lemonsqueezyOrderId: orderId,
      updatedAt: new Date(),
    },
    create: {
      userId: user.id,
      status: "active",
      plan: planType,
      currentPeriodEnd,
      lemonsqueezySubscriptionId: subscriptionId,
      lemonsqueezyCustomerId: customerId,
      lemonsqueezyOrderId: orderId,
    },
  })

  // Add credits with idempotency check
  const externalId = `subscription_created_${subscriptionId}_${eventId || Date.now()}`
  const existingLedger = await prisma.creditLedger.findUnique({
    where: { externalId },
  })

  if (!existingLedger) {
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
          description: `Monthly credits for ${planType} plan`,
          externalId,
          metadata: {
            subscriptionId,
            orderId,
            eventId,
          },
        },
      }),
    ])
  }
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

  // Map Lemon Squeezy status to our status
  let ourStatus: string
  if (status === "active") {
    ourStatus = "active"
  } else if (status === "cancelled" || status === "expired") {
    ourStatus = "cancelled"
  } else if (status === "past_due" || status === "unpaid") {
    ourStatus = "unpaid"
  } else {
    ourStatus = "inactive"
  }

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

  if (!subscriptionId) {
    return
  }

  const subscription = await prisma.subscription.findUnique({
    where: {
      lemonsqueezySubscriptionId: subscriptionId,
    },
    include: {
      user: true,
    },
  })

  if (!subscription || subscription.status !== "active") {
    return
  }

  const credits = getCreditsForPlan(subscription.plan as PlanType)
  const externalId = `payment_success_${subscriptionId}_${invoiceId || eventId || Date.now()}`

  // Idempotency check
  const existingLedger = await prisma.creditLedger.findUnique({
    where: { externalId },
  })

  if (!existingLedger) {
    const newBalance = subscription.user.creditsBalance + credits

    await prisma.$transaction([
      prisma.user.update({
        where: { id: subscription.userId },
        data: { creditsBalance: newBalance },
      }),
      prisma.creditLedger.create({
        data: {
          userId: subscription.userId,
          type: "subscription_credit",
          amount: credits,
          balanceAfter: newBalance,
          description: `Monthly credits renewal for ${subscription.plan} plan`,
          externalId,
          metadata: {
            subscriptionId,
            invoiceId,
            eventId,
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
