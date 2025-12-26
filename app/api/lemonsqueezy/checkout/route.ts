import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const runtime = "nodejs"

type Plan = "starter" | "pro" | "plus"

function getBaseUrl(req: NextRequest) {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL
  if (explicit) return explicit.replace(/\/$/, "")
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host")
  const proto = req.headers.get("x-forwarded-proto") || "https"
  if (host) return `${proto}://${host}`.replace(/\/$/, "")
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "")
  return "http://localhost:3000"
}

function variantIdForPlan(plan: Plan) {
  const map: Record<Plan, string | undefined> = {
    starter: process.env.LEMONSQUEEZY_VARIANT_STARTER_ID,
    pro: process.env.LEMONSQUEEZY_VARIANT_PRO_ID,
    plus: process.env.LEMONSQUEEZY_VARIANT_PLUS_ID,
  }
  return map[plan]
}

/**
 * POST /api/lemonsqueezy/checkout
 * Body: { plan: "starter" | "pro" | "plus" }
 *
 * Creates a Lemon Squeezy checkout via API so we can set a real redirect_url.
 * This is the recommended way to get Stripe-like success redirects.
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY
    const storeId = process.env.LEMONSQUEEZY_STORE_ID
    if (!apiKey || !storeId) {
      return NextResponse.json(
        { error: "Lemon Squeezy API not configured", missing: ["LEMONSQUEEZY_API_KEY", "LEMONSQUEEZY_STORE_ID"] },
        { status: 500 }
      )
    }

    const session = await getServerSession(authOptions)
    const email = session?.user?.email
    const userId = session?.user?.id
    if (!userId || !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const plan = (body?.plan || "") as Plan
    if (!plan || !["starter", "pro", "plus"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const variantId = variantIdForPlan(plan)
    if (!variantId) {
      return NextResponse.json(
        { error: "Variant ID not configured for plan", plan },
        { status: 500 }
      )
    }

    const baseUrl = getBaseUrl(req)
    const redirectUrl = `${baseUrl}/account?payment=success`

    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          product_options: {
            redirect_url: redirectUrl,
            receipt_link_url: redirectUrl,
          },
          checkout_data: {
            email,
            custom: {
              user_id: userId,
              plan,
            },
          },
        },
        relationships: {
          store: { data: { type: "stores", id: String(storeId) } },
          variant: { data: { type: "variants", id: String(variantId) } },
        },
      },
    }

    const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const json = await res.json().catch(() => null)
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to create checkout", detail: json },
        { status: res.status }
      )
    }

    const checkoutUrl =
      json?.data?.attributes?.url ||
      json?.data?.attributes?.checkout_url ||
      json?.data?.attributes?.redirect_url ||
      null

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Checkout created but URL missing", detail: json },
        { status: 500 }
      )
    }

    return NextResponse.json({ checkoutUrl })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create checkout" }, { status: 500 })
  }
}

