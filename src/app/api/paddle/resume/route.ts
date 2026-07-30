// src/app/api/paddle/resume/route.ts
//
// Undoes a scheduled end-of-period cancellation ("resume"). Removes the
// Paddle scheduled_change so the subscription renews normally again. Unlike
// cancel, this is NOT best-effort: if Paddle rejects it we surface the error
// rather than mislead the user, because the subscription would otherwise still
// be set to cancel upstream.

import { NextResponse } from 'next/server'
import { paddleRequest } from '@/lib/paddle'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const user = await requireAuth()

    const sub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    })
    if (!sub) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
    }
    if (!sub.cancelAtPeriodEnd) {
      // Nothing scheduled — already renewing.
      return NextResponse.json({ ok: true })
    }

    if (sub.stripeSubscriptionId?.startsWith('sub_')) {
      // Clearing scheduled_change removes the pending cancellation in Paddle.
      await paddleRequest(`/subscriptions/${sub.stripeSubscriptionId}`, 'PATCH', {
        scheduled_change: null,
      })
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: false },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Resume subscription error:', error)
    const status = error?.message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: error?.message || 'Failed to resume subscription' }, { status })
  }
}
