export const dynamic = 'force-dynamic'
// src/app/api/paddle/webhook/route.ts
//
// Paddle (Merchant of Record) webhook. Keeps the local Subscription record in
// sync with the full Paddle lifecycle:
//   • activation  — subscription.created / activated, transaction.completed
//   • changes     — subscription.updated (status + scheduled cancel + period)
//   • loss/cancel — subscription.canceled, subscription.past_due, paused
// Signature is verified with the Paddle webhook secret.
//
// NOTE: requires PADDLE_WEBHOOK_SECRET to be set and the webhook destination to
// be registered in the Paddle dashboard. Needs end-to-end testing against a
// live/sandbox Paddle account before going to production.

import { NextRequest, NextResponse } from 'next/server'
import { verifyPaddleWebhook } from '@/lib/paddle'
import { PRICING } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'
import type { Prisma, SubscriptionStatus } from '@prisma/client'

// Map a Paddle price ID back to one of our plan keys.
function planFromPriceId(priceId?: string): 'monthly' | 'annual' | null {
  if (!priceId) return null
  if (priceId === PRICING.fieldAgent.paddlePriceId) return 'monthly'
  if (priceId === PRICING.stationChief.paddlePriceId) return 'annual'
  return null
}

// Map a Paddle subscription status string to our enum. Anything that revokes
// access (paused, canceled, past_due) maps to a non-ACTIVE state so the access
// gate (which also checks currentPeriodEnd) stops granting entry.
function statusFromPaddle(s?: string): SubscriptionStatus {
  switch (s) {
    case 'active':
      return 'ACTIVE'
    case 'trialing':
      return 'TRIALING'
    case 'past_due':
      return 'PAST_DUE'
    case 'paused':
      return 'PAST_DUE'
    case 'canceled':
      return 'CANCELED'
    default:
      return 'INCOMPLETE'
  }
}

// Resolve the Subscription record this event refers to: first by the Paddle
// subscription id we stored, then by the user (custom_data / customer email).
async function resolveSubscriptionRecord(data: any) {
  const subId: string | undefined = data.id || data.subscription_id
  if (subId) {
    const bySubId = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subId },
    })
    if (bySubId) return bySubId
  }

  const userId = await resolveUserId(data)
  if (userId) {
    return prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }
  return null
}

// Resolve the owning user from custom_data, then by customer email.
async function resolveUserId(data: any): Promise<string | undefined> {
  const custom = data.custom_data || {}
  if (custom.userId) return custom.userId
  const email: string | undefined = custom.email || data.customer?.email
  if (email) {
    const u = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
    })
    return u?.id
  }
  return undefined
}

// Activation: create or update the record to ACTIVE for the purchased plan.
async function handleActivation(data: any) {
  const custom = data.custom_data || {}

  const priceId: string | undefined =
    data.items?.[0]?.price?.id || data.items?.[0]?.price_id || data.details?.line_items?.[0]?.price_id
  const plan: 'monthly' | 'annual' =
    custom.plan === 'annual' || custom.plan === 'monthly'
      ? custom.plan
      : planFromPriceId(priceId) || 'monthly'

  const userId = await resolveUserId(data)
  if (!userId) {
    console.error('Paddle webhook: could not resolve user from event', { custom })
    return
  }

  // Prefer the subscription id (sub_…). On transaction.completed, data.id is a
  // txn_… id while data.subscription_id holds the sub id we need for cancels.
  const paddleSubId: string = data.subscription_id || data.id || `paddle_${Date.now()}`
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

  const fields = {
    stripeSubscriptionId: paddleSubId,
    stripePriceId: priceId || plan,
    plan: plan === 'annual' ? ('ANNUAL' as const) : ('MONTHLY' as const),
    status: 'ACTIVE' as const,
    cancelAtPeriodEnd: false,
    currentPeriodStart: startsAt,
    currentPeriodEnd: endsAt,
  }

  if (existing) {
    await prisma.subscription.update({ where: { id: existing.id }, data: fields })
  } else {
    await prisma.subscription.create({ data: { userId, ...fields } })
  }

  console.log(`Paddle subscription activated for user ${userId}, plan: ${plan}`)
}

// Lifecycle change: update status / scheduled-cancel / period on an existing
// record. Does not create records — only an activation event should do that.
async function handleLifecycle(type: string, data: any) {
  const record = await resolveSubscriptionRecord(data)
  if (!record) {
    console.error(`Paddle webhook: no local record for ${type}`, { id: data.id })
    return
  }

  const update: Prisma.SubscriptionUpdateInput = {}

  if (type === 'subscription.canceled') {
    update.status = 'CANCELED'
  } else if (type === 'subscription.past_due') {
    update.status = 'PAST_DUE'
  } else if (type === 'subscription.paused') {
    update.status = 'PAST_DUE'
  } else if (type === 'subscription.updated') {
    if (data.status) update.status = statusFromPaddle(data.status)
    // Paddle signals a pending end-of-term cancel via scheduled_change.
    update.cancelAtPeriodEnd = data.scheduled_change?.action === 'cancel'
  }

  if (data.current_billing_period?.starts_at) {
    update.currentPeriodStart = new Date(data.current_billing_period.starts_at)
  }
  if (data.current_billing_period?.ends_at) {
    update.currentPeriodEnd = new Date(data.current_billing_period.ends_at)
  }

  await prisma.subscription.update({ where: { id: record.id }, data: update })
  console.log(`Paddle ${type} applied to subscription ${record.id}`)
}

const ACTIVATION_EVENTS = ['subscription.created', 'subscription.activated', 'transaction.completed']
const LIFECYCLE_EVENTS = [
  'subscription.updated',
  'subscription.canceled',
  'subscription.past_due',
  'subscription.paused',
]

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

    if (ACTIVATION_EVENTS.includes(type)) {
      await handleActivation(data)
    } else if (LIFECYCLE_EVENTS.includes(type)) {
      await handleLifecycle(type, data)
    }

    // Always 200 so Paddle doesn't retry events we intentionally ignore.
    return new NextResponse('OK')
  } catch (error) {
    console.error('Paddle webhook error:', error)
    return new NextResponse('OK')
  }
}
