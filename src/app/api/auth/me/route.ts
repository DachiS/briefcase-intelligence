export const dynamic = 'force-dynamic'
// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // First try JWT cookie
    const user = await getCurrentUser()
    if (user) {
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasSubscription: user.subscriptions.length > 0,
          subscription: user.subscriptions[0] || null,
        },
      })
    }

    // Fall back to NextAuth session (Google login)
    const session = await getServerSession()
    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email.toLowerCase() },
        include: {
          subscriptions: {
            // Must match getCurrentUser's gate exactly (status AND unexpired
            // period). A row can be ACTIVE but past its paid period — counting
            // that as subscribed here would show a Google user as a member while
            // the content routes (gated by getCurrentUser) still block them.
            where: { status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      })
      if (dbUser) {
        return NextResponse.json({
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            hasSubscription: dbUser.subscriptions.length > 0,
            subscription: dbUser.subscriptions[0] || null,
          },
        })
      }
    }

    return NextResponse.json({ user: null })
  } catch {
    return NextResponse.json({ user: null })
  }
}
