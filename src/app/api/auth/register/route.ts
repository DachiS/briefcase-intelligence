export const dynamic = 'force-dynamic'
// src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'

import { sendVerificationEmail, sendAccountExistsEmail } from '@/lib/email'

import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    const normalizedEmail = email.toLowerCase()

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Anti-enumeration: respond identically whether or not the email is already
    // registered. If it exists, we notify the real owner out-of-band instead of
    // telling the requester the account exists.
    const genericResponse = NextResponse.json({
      message: 'Account created. Please check your email to verify your account.',
    })

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      try {
        await sendAccountExistsEmail(normalizedEmail)
      } catch (e) {
        console.error('Account-exists email failed (non-fatal):', e)
      }
      return genericResponse
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const verificationToken = crypto.randomBytes(32).toString('hex')

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        verificationToken,
        emailVerified: false,
      },
    })

    await sendVerificationEmail(normalizedEmail, verificationToken)

    return genericResponse
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
