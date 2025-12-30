import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPaddleSignature, getCreditsForPlan, mapPaddlePriceToPlanType } from "@/lib/paddle"
import type { PlanType } from "@/lib/constants"

export const runtime = "nodejs"

/**
 * Paddle Webhook Handler
 * 
 * Handles webhook events from Paddle:
 * - transaction.completed (payment successful - grant credits)
 * - subscription.created
 * - subscription.updated
 * - subscription.canceled
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
    const signature = req.headers.get("paddle-signature") || req.headers.get("Paddle-Signature") || ""

    // Verify signature
    if (!verifyPaddleSignature(body, signature, secret)) {
      console.error("Invalid Paddle webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    // Paddle webhook format: { event_type: "transaction.completed", data: {...} }
    const eventType = event.event_type || event.type

    console.log(`Processing Paddle webhook: ${eventType}`)

    // Handle different event types
    switch (eventType) {
      case "transaction.completed": {
        await handleTransactionCompleted(event.data)
        break
      }

      case "subscription.created": {
        await handleSubscriptionCreated(event.data)
        break
      }

      case "subscription.updated": {
        await handleSubscriptionUpdated(event.data)
        break
      }

      case "subscription.canceled": {
        await handleSubscriptionCanceled(event.data)
        break
      }

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
 * This is where we grant credits
 */
async function handleTransactionCompleted(data: any) {
  // Paddle transaction.completed payload structure
  const transactionId = data.id?.toString()
  const customerId = data.customer_id?.toString()
  const subscriptionId = data.subscription_id?.toString()
  const customerEmail = data.customer_email || data.customer?.email || ""
  
  // Get price/product info from items array or direct fields
  const firstItem = Array.isArray(data.items) && data.items.length > 0 ? data.items[0] : null
  const priceId = firstItem?.price_id?.toString() || data.price_id?.toString()
  const productName = firstItem?.product_name || data.product_name || ""

  if (!transactionId) {
    console.error("Missing transaction ID")
    return
  }

  if (!customerEmail) {
    console.error("Missing customer email in transaction")
    return
  }

  // Map Paddle price to our plan type
  const planType = mapPaddlePriceToPlanType(priceId, productName)
  if (!planType) {
    console.error(`Could not map Paddle price to plan: priceId=${priceId}, productName=${productName}`)
    return
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: customerEmail.toLowerCase() },
  })

  if (!user) {
    console.error(`User not found for transaction: ${customerEmail}`)
    return
  }

  // Idempotency: Check if we already processed this transaction
  const externalId = `paddle_transaction_${transactionId}`
  const existingLedger = await prisma.creditLedger.findUnique({
    where: { externalId },
  })

  if (existingLedger) {
    console.log(`Transaction ${transactionId} already processed, skipping`)
    return
  }

  // Get credits for this plan
  const credits = getCreditsForPlan(planType)
  const newBalance = user.creditsBalance + credits

  // Grant credits via ledger (idempotent)
  await prisma.$transaction(async (tx) => {
    // Double-check idempotency inside transaction
    const doubleCheck = await tx.creditLedger.findUnique({
      where: { externalId },
    })
    if (doubleCheck) {
      return // Already processed
    }

    // Update user balance
    await tx.user.update({
      where: { id: user.id },
      data: { creditsBalance: newBalance },
    })

    // Create ledger entry
    await tx.creditLedger.create({
      data: {
        userId: user.id,
        type: "subscription_credit",
        amount: credits,
        balanceAfter: newBalance,
        description: `Subscription credits (${planType} plan)`,
        externalId,
        metadata: {
          transactionId,
          subscriptionId,
          customerId,
          priceId,
          planType,
          customerEmail,
        },
      },
    })

    // Create or update subscription record
    if (subscriptionId) {
      await tx.subscription.upsert({
        where: {
          paddleSubscriptionId: subscriptionId,
        },
        update: {
          status: "active",
          plan: planType,
          paddleCustomerId: customerId,
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          status: "active",
          plan: planType,
          paddleSubscriptionId: subscriptionId,
          paddleCustomerId: customerId,
        },
      })
    }
  })

  console.log(`Granted ${credits} credits to user ${user.email} for ${planType} plan`)
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(data: any) {
  const subscriptionId = data.id?.toString()
  const customerId = data.customer_id?.toString()
  const customerEmail = data.customer?.email || data.email || ""
  const priceId = data.items?.[0]?.price_id?.toString() || data.price_id?.toString()
  const productName = data.items?.[0]?.product_name || data.product_name

  if (!subscriptionId || !customerEmail) {
    return
  }

  const user = await prisma.user.findUnique({
    where: { email: customerEmail.toLowerCase() },
  })

  if (!user) {
    console.error(`User not found for subscription: ${customerEmail}`)
    return
  }

  const planType = mapPaddlePriceToPlanType(priceId, productName) || "starter"
  const currentPeriodEnd = data.current_billing_period?.ends_at
    ? new Date(data.current_billing_period.ends_at)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await prisma.subscription.upsert({
    where: {
      paddleSubscriptionId: subscriptionId,
    },
    update: {
      status: "active",
      plan: planType,
      currentPeriodEnd,
      paddleCustomerId: customerId,
      updatedAt: new Date(),
    },
    create: {
      userId: user.id,
      status: "active",
      plan: planType,
      currentPeriodEnd,
      paddleSubscriptionId: subscriptionId,
      paddleCustomerId: customerId,
    },
  })
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(data: any) {
  const subscriptionId = data.id?.toString()
  const status = data.status

  if (!subscriptionId || !status) {
    return
  }

  let ourStatus: string
  if (status === "active") {
    ourStatus = "active"
  } else if (status === "canceled" || status === "cancelled") {
    ourStatus = "cancelled"
  } else if (status === "past_due" || status === "unpaid") {
    ourStatus = "unpaid"
  } else {
    ourStatus = "inactive"
  }

  await prisma.subscription.updateMany({
    where: {
      paddleSubscriptionId: subscriptionId,
    },
    data: {
      status: ourStatus,
      updatedAt: new Date(),
    },
  })
}

/**
 * Handle subscription canceled
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
