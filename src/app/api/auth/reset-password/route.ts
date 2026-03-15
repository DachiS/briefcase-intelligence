// src/app/api/auth/reset-password/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Find user with this reset token
    const users = await prisma.user.findMany({
      where: {
        verificationToken: {
          startsWith: `reset_${token}_`,
        },
      },
    })

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    const user = users[0]

    // Check expiry
    const tokenParts = user.verificationToken!.split('_')
    const expiry = parseInt(tokenParts[tokenParts.length - 1])

    if (Date.now() > expiry) {
      return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 })
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationToken: null,
      },
    })

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
