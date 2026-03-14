// src/app/api/paddle/cancel/route.ts
import { NextResponse } from 'next/server'
import { paddleRequest } from '@/lib/paddle'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
    })

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
    }

    // Cancel at period end via Paddle API
    await paddleRequest(`/subscriptions/${subscription.stripeSubscriptionId}`, 'PATCH', {
      scheduled_change: {
        action: 'cancel',
        effective_at: 'next_billing_period',
      },
    })

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
    })

    return NextResponse.json({ message: 'Subscription will cancel at period end' })
  } catch (error) {
    console.error('Cancel error:', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
