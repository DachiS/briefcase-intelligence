// src/app/api/auth/forgot-password/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

import { sendPasswordResetEmail } from '@/lib/email'
export const dynamic = 'force-dynamic'

import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Always return success even if user not found (security best practice)
    if (!user) {
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: `reset_${resetToken}_${resetExpiry.getTime()}`,
      },
    })

    await sendPasswordResetEmail(normalizedEmail, resetToken)

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
