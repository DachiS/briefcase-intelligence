// src/app/api/flitt/create-token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createFlittToken } from '@/lib/flitt'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const PLANS = {
  monthly: { amount: 1999, label: 'Field Agent Monthly' },
  annual:  { amount: 9999, label: 'Station Chief Annual' },
}

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { plan, googleEmail } = await req.json()

    let user = await getCurrentUser()

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

    const selectedPlan = PLANS[plan as keyof typeof PLANS] || PLANS.monthly
    const orderId = `order_${user.id}_${Date.now()}`
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.briefcase.agency'
    const isLocalhost = baseUrl.includes('localhost')

    // Use env var for currency, default USD for production
    const currency = process.env.FLITT_CURRENCY || 'USD'

    const tokenParams: Record<string, string | number> = {
      order_id: orderId,
      amount: selectedPlan.amount,
      currency,
      order_desc: `Briefcase Intelligence ${selectedPlan.label}`,
      response_url: isLocalhost ? 'https://pay.flitt.com' : `${baseUrl}/dashboard?subscribed=true`,
      merchant_data: JSON.stringify({ userId: user.id, plan }),
    }

    if (!isLocalhost) {
      tokenParams.server_callback_url = `${baseUrl}/api/flitt/webhook`
    }

    const { token } = await createFlittToken(tokenParams)
    return NextResponse.json({ token, userId: user.id, plan })
  } catch (error: any) {
    console.error('Flitt token error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
