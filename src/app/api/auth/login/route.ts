export const dynamic = 'force-dynamic'
// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'

import { signToken } from '@/lib/auth'

import { checkRateLimit, peekRateLimit, resetRateLimit, clientIp } from '@/lib/rate-limit'

// A fixed bcrypt hash used to burn ~the same CPU when the account doesn't exist
// (or has no password), so response timing can't distinguish "no such email"
// from "wrong password" — closing the timing-based enumeration channel (#10).
// This is the hash of a random throwaway string; it never matches any password.
const DUMMY_HASH = '$2a$12$3XK9pHtmG5HXRodsWOZB8uQ1dYMwn.Ui2Dr504CzMnDYaFhaC/bou'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    const normalizedEmail = email.toLowerCase()

    // Throttle brute-force attempts. The per-IP limiter counts every attempt
    // (an attacker's own address absorbs the cost). The per-email limiter is
    // only PEEKED here and advanced solely on a FAILED credential check below —
    // otherwise anyone could lock a victim out of their own account just by
    // firing wrong-password requests at their email.
    const ip = clientIp(req)
    const emailKey = `login:email:${normalizedEmail}`
    const byIp = checkRateLimit(`login:ip:${ip}`, 10, 10 * 60_000)
    const byEmail = peekRateLimit(emailKey, 5)
    if (!byIp.success || !byEmail.success) {
      const retryAfter = Math.max(byIp.retryAfter, byEmail.retryAfter)
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    })

    // Always run a bcrypt comparison, even when the account is missing or is an
    // OAuth-only account with an empty password hash. This equalizes response
    // timing so an attacker can't enumerate valid emails by measuring latency.
    const valid = await bcrypt.compare(password, user?.password || DUMMY_HASH)

    if (!user || !user.password || !valid) {
      // Count this failure toward the per-email lockout (created on first fail).
      checkRateLimit(emailKey, 5, 10 * 60_000)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in' },
        { status: 403 }
      )
    }

    // Successful auth — clear the per-email throttle so a legitimate user isn't
    // locked out by their own repeated (successful) logins.
    resetRateLimit(`login:email:${normalizedEmail}`)

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasSubscription: user.subscriptions.length > 0,
      },
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
