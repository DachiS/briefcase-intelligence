export const dynamic = 'force-dynamic'
// src/app/api/flitt/create-token/route.ts

import { NextRequest, NextResponse } from 'next/server'

import { createFlittToken } from '@/lib/flitt'

import { prisma } from '@/lib/prisma'

import { getCurrentUser } from '@/lib/auth'

const PLANS = {
  monthly: { amount: 1999, label: 'Field Agent Monthly' },
  annual:  { amount: 9999, label: 'Station Chief Annual' },
}

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
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const isLocalhost = baseUrl.includes('localhost')

    // Test merchant 1549901 only supports GEL
    const isTestMode = !process.env.FLITT_MERCHANT_ID || process.env.FLITT_MERCHANT_ID === '1549901'
    const currency = isTestMode ? 'GEL' : 'USD'

    // Flitt rejects localhost URLs — use a real public URL for response_url even in dev
    // After payment, Flitt redirects here; on localhost we use a public placeholder
    const responseUrl = isLocalhost
      ? `https://pay.flitt.com` // dummy — Flitt needs a valid public URL
      : `${baseUrl}/dashboard?subscribed=true`

    const tokenParams: Record<string, string | number> = {
      order_id: orderId,
      amount: String(selectedPlan.amount),
      currency,
      order_desc: `Briefcase Intelligence ${selectedPlan.label}`,
      response_url: responseUrl,
    }

    const { token } = await createFlittToken(tokenParams)

    return NextResponse.json({ token, userId: user.id, plan })
  } catch (error: any) {
    console.error('Flitt token error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
