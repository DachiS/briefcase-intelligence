// src/app/api/flitt/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyCallbackSignature } from '@/lib/flitt'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData()
    const params: Record<string, string> = {}
    body.forEach((value, key) => { params[key] = String(value) })

    console.log('Flitt webhook received:', params)

    // Verify signature
    if (!verifyCallbackSignature(params)) {
      console.error('Invalid Flitt signature')
      return new NextResponse('FORBIDDEN', { status: 403 })
    }

    const { order_status, merchant_data, order_id, payment_id } = params

    if (order_status !== 'approved') {
      console.log('Payment not approved, status:', order_status)
      return new NextResponse('OK')
    }

    // Extract userId and plan from merchant_data
    let userId: string
    let plan: string = 'monthly'
    try {
      const meta = JSON.parse(merchant_data || '{}')
      userId = meta.userId
      plan = meta.plan || 'monthly'
    } catch {
      console.error('Failed to parse merchant_data:', merchant_data)
      return new NextResponse('OK')
    }

    if (!userId) {
      console.error('No userId in merchant_data')
      return new NextResponse('OK')
    }

    // Calculate subscription end date
    const endsAt = new Date()
    if (plan === 'annual') {
      endsAt.setFullYear(endsAt.getFullYear() + 1)
    } else {
      endsAt.setMonth(endsAt.getMonth() + 1)
    }

    // Find existing subscription or create new one
    const existing = await prisma.subscription.findFirst({
      where: { userId },
    })

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          stripeSubscriptionId: payment_id || order_id,
          stripePriceId: plan,
          status: 'ACTIVE',
          currentPeriodEnd: endsAt,
        },
      })
    } else {
      await prisma.subscription.create({
        data: {
          userId,
          stripeSubscriptionId: payment_id || order_id,
          stripePriceId: plan,
          status: 'ACTIVE',
          currentPeriodEnd: endsAt,
        },
      })
    }

    console.log(`Subscription activated for user ${userId}, plan: ${plan}`)
    return new NextResponse('OK')
  } catch (error) {
    console.error('Flitt webhook error:', error)
    return new NextResponse('OK')
  }
}
