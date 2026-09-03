export const dynamic = 'force-dynamic'
// src/app/api/auth/forgot-password/route.ts

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

import { sendPasswordResetEmail } from '@/lib/email'

import { checkRateLimit, clientIp } from '@/lib/rate-limit'

import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase()

    // Cap reset emails so the endpoint can't be used to spam a victim's inbox or
    // burn our sending reputation, per IP and per targeted address.
    const ip = clientIp(req)
    const byIp = checkRateLimit(`forgot:ip:${ip}`, 5, 15 * 60_000)
    const byEmail = checkRateLimit(`forgot:email:${normalizedEmail}`, 3, 60 * 60_000)
    if (!byIp.success || !byEmail.success) {
      // Return the same generic success to preserve anti-enumeration behaviour.
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Always return success even if user not found (security best practice)
    if (!user) {
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store only the hash — the raw token lives solely in the emailed link, so a
    // database leak cannot be turned into working reset links. Reset now has its
    // own columns and no longer overloads verificationToken.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash,
        resetTokenExpiry: resetExpiry,
      },
    })

    await sendPasswordResetEmail(normalizedEmail, resetToken)

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
