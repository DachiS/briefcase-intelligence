export const dynamic = 'force-dynamic'
// src/app/api/auth/verify-email/route.ts

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid-token', req.url))
  }

  // The verificationToken column is currently overloaded for password resets
  // (stored as `reset_<token>_<expiry>`). Never let a password-reset token be
  // consumed as an email verification. (See fix guide: give resets their own
  // columns to remove this overloading entirely.)
  if (token.startsWith('reset_')) {
    return NextResponse.redirect(new URL('/login?error=invalid-token', req.url))
  }

  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  })

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=invalid-token', req.url))
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
    },
  })

  return NextResponse.redirect(new URL('/login?verified=true', req.url))
}
