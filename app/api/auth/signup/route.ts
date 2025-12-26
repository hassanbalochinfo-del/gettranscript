import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with 5 free signup credits
    const SIGNUP_BONUS_CREDITS = 5
    const signupExternalId = `signup_bonus_${email}_${Date.now()}`

    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          name: name || null,
          password: hashedPassword,
          creditsBalance: SIGNUP_BONUS_CREDITS,
        },
      })

      // Create credit ledger entry for signup bonus
      await tx.creditLedger.create({
        data: {
          userId: newUser.id,
          type: "manual_adjustment",
          amount: SIGNUP_BONUS_CREDITS,
          balanceAfter: SIGNUP_BONUS_CREDITS,
          description: "Welcome bonus - 5 free credits for signing up",
          externalId: signupExternalId,
          metadata: {
            reason: "signup_bonus",
            email,
          },
        },
      })

      return newUser
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error: any) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    )
  }
}
