import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import crypto from "crypto"

export const runtime = "nodejs"

/**
 * Admin endpoint to grant credits to a SPECIFIC user by email.
 *
 * Auth:
 * - Set env var ADMIN_CREDITS_SECRET
 * - Call with header: x-admin-secret: <ADMIN_CREDITS_SECRET>
 *
 * Body:
 * { email: string, amount?: number }
 */
export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_CREDITS_SECRET
  const provided = req.headers.get("x-admin-secret")

  if (!secret || !provided || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const amount = Number.isFinite(body?.amount) ? Number(body.amount) : 5
  if (!Number.isInteger(amount) || amount <= 0 || amount > 1000) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, creditsBalance: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const runId = `grant_${Date.now()}_${user.id}`
  const externalId = `admin_grant_${runId}`

  // Check if already granted (idempotency)
  const existing = await prisma.creditLedger.findUnique({
    where: { externalId },
    select: { id: true },
  })

  if (existing) {
    return NextResponse.json({
      ok: true,
      message: "Credits already granted to this user",
      user: {
        email: user.email,
        name: user.name,
        currentBalance: user.creditsBalance,
      },
      amount,
    })
  }

  const newBalance = (user.creditsBalance ?? 0) + amount

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { creditsBalance: newBalance },
    }),
    prisma.creditLedger.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        type: "manual_adjustment",
        amount,
        balanceAfter: newBalance,
        description: `Admin grant: +${amount} credits`,
        externalId,
        metadata: {
          reason: "admin_grant_single_user",
          email,
          amount,
        },
      },
    }),
  ])

  return NextResponse.json({
    ok: true,
    message: `Successfully granted ${amount} credits`,
    user: {
      email: user.email,
      name: user.name,
      previousBalance: user.creditsBalance,
      newBalance,
    },
    amount,
  })
}
