// src/app/api/auth/register/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import bcrypt from 'bcryptjs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

import { sendVerificationEmail } from '@/lib/email'
export const dynamic = 'force-dynamic'

import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    const normalizedEmail = email.toLowerCase()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const verificationToken = crypto.randomBytes(32).toString('hex')

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        verificationToken,
        emailVerified: false,
      },
    })

    await sendVerificationEmail(normalizedEmail, verificationToken)

    return NextResponse.json({
      message: 'Account created. Please check your email to verify your account.',
      userId: user.id,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}