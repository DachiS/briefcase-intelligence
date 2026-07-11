// src/lib/auth.ts
import jwt from 'jsonwebtoken'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  userId: string
  email: string
  role: string
  // Snapshot of the user's tokenVersion at sign time. When the user resets
  // their password we bump the DB value, so any older token no longer matches
  // and is rejected in getCurrentUser().
  tokenVersion?: number
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// Wrapped in React cache() so repeated calls within a single request (multiple
// guards, a layout + page, an API route calling both requireAuth and
// requireSubscription) share one result instead of re-running the DB/session
// lookups. Freshness is unaffected — the cache is per-request only (#16).
export const getCurrentUser = cache(async () => {
  // First try JWT cookie
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          subscriptions: {
            where: { status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      })
      // Reject tokens issued before the user's last password reset. Tokens
      // predating this feature carry no tokenVersion; treat that as 0 so
      // existing sessions of users who never reset stay valid.
      if (user && (payload.tokenVersion ?? 0) === user.tokenVersion) return user
    }
  }

  // Fall back to NextAuth session (Google login)
  const session = await getServerSession()
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })
    if (user) return user
  }

  return null
})

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function requireSubscription() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  const hasActiveSub = user.subscriptions.length > 0
  if (!hasActiveSub) throw new Error('Subscription required')
  return user
}
