// src/app/api/paddle/cancel/route.ts
//
// Cancels the current user's subscription at the end of the billing period.
// Backs the "Cancel subscription" action on the dashboard.
//
// NOTE: the Paddle API cancellation is best-effort and requires PADDLE_API_KEY.
// The local record is always marked cancelAtPeriodEnd so the UI reflects it.

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

    // Ask Paddle to cancel at the end of the current period. Only attempt when
    // the stored id is a Paddle subscription id (sub_…); never fail the request
    // if the upstream call errors — we still mark the local record.
    if (sub.stripeSubscriptionId?.startsWith('sub_')) {
      try {
        await paddleRequest(`/subscriptions/${sub.stripeSubscriptionId}/cancel`, 'POST', {
          effective_from: 'next_billing_period',
        })
      } catch (e) {
        console.error('Paddle cancel API error (marking locally anyway):', e)
      }
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: true },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Paddle cancel error:', error)
    const status = error?.message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: error?.message || 'Failed to cancel' }, { status })
  }
}
