export const dynamic = 'force-dynamic'
// src/app/api/paddle/webhook/route.ts
//
// Paddle (Merchant of Record) webhook. Activates a subscription record when a
// purchase completes. Signature is verified with the Paddle webhook secret.
//
// NOTE: requires PADDLE_WEBHOOK_SECRET to be set and the webhook destination to
// be registered in the Paddle dashboard. Needs end-to-end testing against a
// live/sandbox Paddle account before going to production.

import { NextRequest, NextResponse } from 'next/server'
import { verifyPaddleWebhook } from '@/lib/paddle'
import { PRICING } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'

// Map a Paddle price ID back to one of our plan keys.
function planFromPriceId(priceId?: string): 'monthly' | 'annual' | null {
  if (!priceId) return null
  if (priceId === PRICING.fieldAgent.paddlePriceId) return 'monthly'
  if (priceId === PRICING.stationChief.paddlePriceId) return 'annual'
  return null
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('paddle-signature') || ''
    const secret = process.env.PADDLE_WEBHOOK_SECRET || ''

    if (!secret || !verifyPaddleWebhook(rawBody, signature, secret)) {
      console.error('Invalid Paddle signature')
      return new NextResponse('FORBIDDEN', { status: 403 })
    }

    const event = JSON.parse(rawBody)
    const type: string = event.event_type || ''
    const data = event.data || {}

    // Only activate on subscription/transaction completion events.
    if (!['subscription.created', 'subscription.activated', 'transaction.completed'].includes(type)) {
      return new NextResponse('OK')
    }

    const custom = data.custom_data || {}

    // Resolve the plan: prefer custom_data, fall back to the purchased price ID.
    const priceId: string | undefined =
      data.items?.[0]?.price?.id || data.items?.[0]?.price_id || data.details?.line_items?.[0]?.price_id
    const plan: 'monthly' | 'annual' =
      custom.plan === 'annual' || custom.plan === 'monthly'
        ? custom.plan
        : planFromPriceId(priceId) || 'monthly'

    // Resolve the user by id, then by the account email passed in custom_data.
    let userId: string | undefined = custom.userId
    if (!userId) {
      const email: string | undefined = custom.email || data.customer?.email
      if (email) {
        const u = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } })
        userId = u?.id
      }
    }
    if (!userId) {
      console.error('Paddle webhook: could not resolve user from event', { custom })
      return new NextResponse('OK')
    }

    // Subscription id + billing period.
    const paddleSubId: string = data.id || data.subscription_id || `paddle_${Date.now()}`
    const startsAt = data.current_billing_period?.starts_at
      ? new Date(data.current_billing_period.starts_at)
      : new Date()
    let endsAt: Date
    if (data.current_billing_period?.ends_at) {
      endsAt = new Date(data.current_billing_period.ends_at)
    } else {
      endsAt = new Date(startsAt)
      if (plan === 'annual') endsAt.setFullYear(endsAt.getFullYear() + 1)
      else endsAt.setMonth(endsAt.getMonth() + 1)
    }

    const existing = await prisma.subscription.findFirst({ where: { userId } })

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          stripeSubscriptionId: paddleSubId,
          stripePriceId: priceId || plan,
          plan: plan === 'annual' ? 'ANNUAL' : 'MONTHLY',
          status: 'ACTIVE',
          currentPeriodStart: startsAt,
          currentPeriodEnd: endsAt,
        },
      })
    } else {
      await prisma.subscription.create({
        data: {
          userId,
          stripeSubscriptionId: paddleSubId,
          stripePriceId: priceId || plan,
          plan: plan === 'annual' ? 'ANNUAL' : 'MONTHLY',
          status: 'ACTIVE',
          currentPeriodStart: startsAt,
          currentPeriodEnd: endsAt,
        },
      })
    }

    console.log(`Paddle subscription activated for user ${userId}, plan: ${plan}`)
    return new NextResponse('OK')
  } catch (error) {
    console.error('Paddle webhook error:', error)
    return new NextResponse('OK')
  }
}
