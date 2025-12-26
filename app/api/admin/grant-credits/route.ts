import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import crypto from "crypto"

export const runtime = "nodejs"

/**
 * One-time admin endpoint to grant credits to ALL users.
 *
 * Auth:
 * - Set env var ADMIN_CREDITS_SECRET
 * - Call with header: x-admin-secret: <ADMIN_CREDITS_SECRET>
 *
 * Body:
 * { amount?: number, runId?: string }
 *
 * Idempotency:
 * - Uses CreditLedger.externalId = `admin_grant_${runId}_${userId}`
 * - Re-running with the same runId will NOT double-add.
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
    // allow empty body
    body = {}
  }

  const amount = Number.isFinite(body?.amount) ? Number(body.amount) : 5
  if (!Number.isInteger(amount) || amount <= 0 || amount > 1000) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  const runId = typeof body?.runId === "string" && body.runId.trim() ? body.runId.trim() : "20251226_grant5"

  // Fetch all users (id + current balance)
  const users = await prisma.user.findMany({
    select: { id: true, creditsBalance: true },
  })

  let granted = 0
  let skipped = 0

  for (const u of users) {
    const externalId = `admin_grant_${runId}_${u.id}`

    const existing = await prisma.creditLedger.findUnique({
      where: { externalId },
      select: { id: true },
    })

    if (existing) {
      skipped++
      continue
    }

    const newBalance = (u.creditsBalance ?? 0) + amount

    await prisma.$transaction([
      prisma.user.update({
        where: { id: u.id },
        data: { creditsBalance: newBalance },
      }),
      prisma.creditLedger.create({
        data: {
          id: crypto.randomUUID(),
          userId: u.id,
          type: "manual_adjustment",
          amount,
          balanceAfter: newBalance,
          description: `Admin grant: +${amount} credits`,
          externalId,
          metadata: {
            reason: "admin_grant",
            runId,
            amount,
          },
        },
      }),
    ])

    granted++
  }

  return NextResponse.json({
    ok: true,
    amount,
    runId,
    usersTotal: users.length,
    granted,
    skipped,
  })
}

