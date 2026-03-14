// src/app/api/paddle/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PLANS, paddleRequest } from '@/lib/paddle'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { plan, googleEmail } = await req.json()

    let user = await getCurrentUser()

    // If no JWT user, try to find Google auth user by email
    if (!user && googleEmail) {
      const dbUser = await prisma.user.findUnique({
        where: { email: googleEmail.toLowerCase() },
        include: { subscriptions: { where: { status: 'ACTIVE' }, take: 1 } },
      })
      if (dbUser) user = { ...dbUser, hasSubscription: dbUser.subscriptions.length > 0 } as any
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const selectedPlan = PLANS[plan as keyof typeof PLANS]

    // Create or get Paddle customer
    let paddleCustomerId = user.stripeCustomerId // reusing this field for Paddle customer ID

    if (!paddleCustomerId) {
      const customerRes = await paddleRequest('/customers', 'POST', {
        email: user.email,
        name: user.name,
      })
      paddleCustomerId = customerRes.data.id

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: paddleCustomerId },
      })
    }

    // Create Paddle checkout transaction
    const checkoutRes = await paddleRequest('/transactions', 'POST', {
      items: [{ price_id: selectedPlan.priceId, quantity: 1 }],
      customer_id: paddleCustomerId,
      custom_data: { userId: user.id, plan },
      checkout: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      },
    })

    const checkoutUrl = checkoutRes.data.checkout?.url

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    }

    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error('Paddle checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
