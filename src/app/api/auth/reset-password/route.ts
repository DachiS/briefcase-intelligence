export const dynamic = 'force-dynamic'
// src/app/api/auth/reset-password/route.ts

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

import bcrypt from 'bcryptjs'

import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Look the user up by the token HASH — we never store the raw token.
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const user = await prisma.user.findFirst({
      where: { resetTokenHash },
    })

    if (!user || !user.resetTokenExpiry) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    if (Date.now() > user.resetTokenExpiry.getTime()) {
      return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 })
    }

    // Update password, clear the reset token, and bump tokenVersion so every
    // JWT issued before this reset is invalidated (locks out any stolen session).
    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetTokenHash: null,
        resetTokenExpiry: null,
        tokenVersion: { increment: 1 },
      },
    })

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
