import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPaddleSignature, getCreditsForPlan, extractPlanFromPaddleData } from "@/lib/paddle"
import type { PlanType } from "@/lib/constants"

export const runtime = "nodejs"

/**
 * Paddle Webhook Handler
 * 
 * Handles webhook events from Paddle:
 * - transaction.completed (payment successful, grant credits)
 * - subscription.created (create subscription record)
 * - subscription.updated (update subscription status)
 * - subscription.canceled (mark subscription as cancelled)
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PADDLE_WEBHOOK_SECRET
    if (!secret) {
      console.error("PADDLE_WEBHOOK_SECRET not configured")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    // Get raw body for signature verification
    const body = await req.text()
    const signature = req.headers.get("paddle-signature") || ""

    // Verify signature
    if (!verifyPaddleSignature(body, signature, secret)) {
      console.error("Invalid Paddle webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    const eventType = event.event_type || event.type
    const data = event.data || {}

    console.log(`Processing Paddle webhook: ${eventType}`)

    // Handle different event types
    switch (eventType) {
      case "transaction.completed":
        await handleTransactionCompleted(data, event.event_id || event.id)
        break

      case "subscription.created":
        await handleSubscriptionCreated(data)
        break

      case "subscription.updated":
        await handleSubscriptionUpdated(data)
        break

      case "subscription.canceled":
      case "subscription.cancelled":
        await handleSubscriptionCanceled(data)
        break

      default:
        console.log(`Unhandled Paddle event type: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Paddle webhook error:", error)
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    )
  }
}

/**
 * Handle completed transaction (payment successful)
 * This is where we grant credits to the user
 */
async function handleTransactionCompleted(data: any, eventId?: string) {
  const transactionId = data.id?.toString()
  const customerId = data.customer_id?.toString()
  const subscriptionId = data.subscription_id?.toString()
  const userEmail = (data.customer_email || data.email || "").toString().toLowerCase()
  const status = (data.status || "").toString()

  if (!transactionId || status !== "completed") {
    console.log("Transaction not completed or missing ID:", { transactionId, status })
    return
  }

  // Idempotency key: use transaction ID (unique per payment)
  const externalId = `paddle_transaction_${transactionId}`

  // Check if we already processed this transaction
  const existingLedger = await prisma.creditLedger.findUnique({
    where: { externalId },
  })

  if (existingLedger) {
    console.log(`Transaction ${transactionId} already processed, skipping`)
    return
  }

  // Find user by email
  const user = userEmail
    ? await prisma.user.findUnique({ where: { email: userEmail } })
    : null

  if (!user) {
    console.error(`User not found for transaction email: ${userEmail || "(missing)"}`)
    return
  }

  // Extract plan from transaction data
  const plan = extractPlanFromPaddleData(data)
  if (!plan) {
    console.error(`Could not determine plan for transaction ${transactionId}`)
    return
  }

  const credits = getCreditsForPlan(plan)
  const newBalance = user.creditsBalance + credits

  // Update subscription if subscription_id exists
  if (subscriptionId) {
    await prisma.subscription.upsert({
      where: {
        paddleSubscriptionId: subscriptionId,
      },
      update: {
        userId: user.id,
        status: "active",
        plan: plan,
        paddleCustomerId: customerId,
        paddleTransactionId: transactionId,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        status: "active",
        plan: plan,
        paddleSubscriptionId: subscriptionId,
        paddleCustomerId: customerId,
        paddleTransactionId: transactionId,
      },
    })
  }

  // Grant credits (idempotent via externalId)
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
        description: `Subscription credits (${plan}) - Paddle transaction ${transactionId}`,
        externalId,
        metadata: {
          transactionId,
          subscriptionId,
          customerId,
          eventId,
          plan,
          userEmail,
        },
      },
    }),
  ])

  console.log(`Granted ${credits} credits to user ${user.id} for transaction ${transactionId}`)
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(data: any) {
  const subscriptionId = data.id?.toString()
  const customerId = data.customer_id?.toString()
  const userEmail = (data.customer_email || data.email || "").toString().toLowerCase()
  const status = (data.status || "").toString()

  if (!subscriptionId) {
    console.error("Missing subscription ID")
    return
  }

  const user = userEmail
    ? await prisma.user.findUnique({ where: { email: userEmail } })
    : null

  if (!user) {
    console.error(`User not found for subscription email: ${userEmail || "(missing)"}`)
    return
  }

  const plan = extractPlanFromPaddleData(data)
  if (!plan) {
    console.error(`Could not determine plan for subscription ${subscriptionId}`)
    return
  }

  await prisma.subscription.upsert({
    where: {
      paddleSubscriptionId: subscriptionId,
    },
    update: {
      userId: user.id,
      status: normalizePaddleStatus(status) || "active",
      plan: plan,
      paddleCustomerId: customerId,
      updatedAt: new Date(),
    },
    create: {
      userId: user.id,
      status: normalizePaddleStatus(status) || "active",
      plan: plan,
      paddleSubscriptionId: subscriptionId,
      paddleCustomerId: customerId,
    },
  })
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(data: any) {
  const subscriptionId = data.id?.toString()
  const status = (data.status || "").toString()

  if (!subscriptionId || !status) {
    return
  }

  await prisma.subscription.updateMany({
    where: {
      paddleSubscriptionId: subscriptionId,
    },
    data: {
      status: normalizePaddleStatus(status) || "inactive",
      updatedAt: new Date(),
    },
  })
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(data: any) {
  const subscriptionId = data.id?.toString()

  if (!subscriptionId) {
    return
  }

  await prisma.subscription.updateMany({
    where: {
      paddleSubscriptionId: subscriptionId,
    },
    data: {
      status: "cancelled",
      updatedAt: new Date(),
    },
  })
}

function normalizePaddleStatus(status: string | null | undefined): string | null {
  const s = (status || "").toString().toLowerCase()
  if (!s) return null
  if (s === "active") return "active"
  if (s === "cancelled" || s === "canceled" || s === "expired") return "cancelled"
  if (s === "past_due" || s === "unpaid") return "unpaid"
  if (s === "payment_failed") return "payment_failed"
  return "inactive"
}
