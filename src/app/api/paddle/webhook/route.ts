// src/app/api/paddle/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyPaddleWebhook } from '@/lib/paddle'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('paddle-signature') || ''

  // Verify webhook signature
  const isValid = verifyPaddleWebhook(
    rawBody,
    signature,
    process.env.PADDLE_WEBHOOK_SECRET!
  )

  if (!isValid) {
    console.error('Invalid Paddle webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(rawBody)
  console.log('Paddle webhook event:', event.event_type)

  try {
    switch (event.event_type) {
      case 'subscription.created': {
        await handleSubscriptionCreated(event.data)
        break
      }
      case 'subscription.updated': {
        await handleSubscriptionUpdated(event.data)
        break
      }
      case 'subscription.canceled': {
        await handleSubscriptionCanceled(event.data)
        break
      }
      case 'transaction.completed': {
        await handleTransactionCompleted(event.data)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Paddle webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleSubscriptionCreated(data: any) {
  const userId = data.custom_data?.userId
  const plan = data.custom_data?.plan as 'monthly' | 'annual'

  if (!userId) return

  await prisma.subscription.create({
    data: {
      userId,
      stripeSubscriptionId: data.id, // reusing field for Paddle subscription ID
      stripePriceId: data.items?.[0]?.price?.id || '',
      status: 'ACTIVE',
      plan: plan === 'annual' ? 'ANNUAL' : 'MONTHLY',
      currentPeriodStart: new Date(data.current_billing_period?.starts_at || Date.now()),
      currentPeriodEnd: new Date(data.current_billing_period?.ends_at || Date.now()),
      cancelAtPeriodEnd: false,
    },
  })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user) {
    await sendWelcomeEmail(user.email, user.name, plan)
  }
}

async function handleSubscriptionUpdated(data: any) {
  const status = mapPaddleStatus(data.status)

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: data.id },
    data: {
      status,
      currentPeriodStart: new Date(data.current_billing_period?.starts_at || Date.now()),
      currentPeriodEnd: new Date(data.current_billing_period?.ends_at || Date.now()),
      cancelAtPeriodEnd: data.scheduled_change?.action === 'cancel',
    },
  })
}

async function handleSubscriptionCanceled(data: any) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: data.id },
    data: { status: 'CANCELED' },
  })
}

async function handleTransactionCompleted(data: any) {
  // For one-time transactions or renewals — update subscription if exists
  if (data.subscription_id) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: data.subscription_id },
      data: { status: 'ACTIVE' },
    })
  }
}

function mapPaddleStatus(status: string): string {
  const map: Record<string, string> = {
    active: 'ACTIVE',
    canceled: 'CANCELED',
    past_due: 'PAST_DUE',
    paused: 'CANCELED',
    trialing: 'TRIALING',
  }
  return map[status] || 'INCOMPLETE'
}
