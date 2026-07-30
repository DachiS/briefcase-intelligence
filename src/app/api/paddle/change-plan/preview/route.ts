// src/app/api/paddle/change-plan/preview/route.ts
//
// Returns the exact amount Paddle would charge *now* for a plan change, so the
// UI can show it before the user confirms. Uses Paddle's subscription preview
// (PATCH …/preview), which nets any account credit — the returned amount is
// what the customer actually pays. Read-only: it does not change anything.

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
    if (!sub || !sub.stripeSubscriptionId?.startsWith('sub_')) {
      return NextResponse.json({ error: 'No changeable subscription' }, { status: 404 })
    }

    const targetPriceId =
      plan === 'annual' ? PRICING.stationChief.paddlePriceId : PRICING.fieldAgent.paddlePriceId

    const preview = await paddleRequest(`/subscriptions/${sub.stripeSubscriptionId}/preview`, 'PATCH', {
      items: [{ price_id: targetPriceId, quantity: 1 }],
      proration_billing_mode: 'prorated_immediately',
    })

    const totals = preview?.data?.immediate_transaction?.details?.totals || {}
    // Paddle amounts are strings in the currency's minor unit (e.g. "8001" = $80.01).
    const amountMinor = Number(totals.grand_total ?? 0)
    const currency = totals.currency_code || PRICING.fieldAgent.currency

    return NextResponse.json({ amountMinor, currency })
  } catch (error: any) {
    console.error('Change plan preview error:', error)
    const status = error?.message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: error?.message || 'Failed to preview plan change' }, { status })
  }
}
