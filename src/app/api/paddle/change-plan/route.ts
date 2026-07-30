// src/app/api/paddle/change-plan/route.ts
//
// Switches the current user's subscription between the monthly and annual
// plans by changing the Paddle subscription's price. Upgrades/downgrades are
// prorated immediately by Paddle. The local record is updated optimistically;
// the subscription.updated webhook confirms/syncs it.

import { NextRequest, NextResponse } from 'next/server'
import { paddleRequest } from '@/lib/paddle'
import { PRICING } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { plan } = await req.json()
    if (plan !== 'monthly' && plan !== 'annual') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const sub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    })
    if (!sub) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
    }

    const targetPlanEnum = plan === 'annual' ? 'ANNUAL' : 'MONTHLY'
    if (sub.plan === targetPlanEnum) {
      return NextResponse.json({ error: 'You are already on this plan' }, { status: 400 })
    }

    // Only Paddle-backed subscriptions (sub_…) can be changed via the API.
    if (!sub.stripeSubscriptionId?.startsWith('sub_')) {
      return NextResponse.json({ error: 'This subscription cannot be changed automatically' }, { status: 400 })
    }

    const targetPriceId =
      plan === 'annual' ? PRICING.stationChief.paddlePriceId : PRICING.fieldAgent.paddlePriceId

    // Ask Paddle to swap the price. Proration is applied immediately so an
    // upgrade charges the difference now (and a downgrade credits it).
    const updated = await paddleRequest(`/subscriptions/${sub.stripeSubscriptionId}`, 'PATCH', {
      items: [{ price_id: targetPriceId, quantity: 1 }],
      proration_billing_mode: 'prorated_immediately',
    })

    // Optimistically reflect the change; the webhook will reconcile.
    const d = updated?.data || {}
    const periodStart = d.current_billing_period?.starts_at
      ? new Date(d.current_billing_period.starts_at)
      : sub.currentPeriodStart
    const periodEnd = d.current_billing_period?.ends_at
      ? new Date(d.current_billing_period.ends_at)
      : sub.currentPeriodEnd

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        plan: targetPlanEnum,
        stripePriceId: targetPriceId,
        cancelAtPeriodEnd: false,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Change plan error:', error)
    const status = error?.message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: error?.message || 'Failed to change plan' }, { status })
  }
}
