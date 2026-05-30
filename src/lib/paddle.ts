// src/lib/paddle.ts

import { PRICING } from './pricing'

export const PADDLE_API_URL = 'https://api.paddle.com' // Change to https://api.paddle.com for live

// Plan metadata for the Paddle integration. Price + Paddle price ID are sourced
// from the single pricing source of truth (`src/lib/pricing.ts`) so amounts can
// never drift between the checkout config and what the site renders.
export const PLANS = {
  monthly: {
    name: PRICING.fieldAgent.name,
    priceId: PRICING.fieldAgent.paddlePriceId,
    price: PRICING.fieldAgent.amount,
    interval: PRICING.fieldAgent.interval,
    description: 'Access to all issues, billed monthly',
    features: [
      'Full access to all PDF issues',
      'New issue every month',
      'Download for offline reading',
      'Cancel anytime',
    ],
  },
  annual: {
    name: PRICING.stationChief.name,
    priceId: PRICING.stationChief.paddlePriceId,
    price: PRICING.stationChief.amount,
    interval: PRICING.stationChief.interval,
    description: 'Best value — save 25%, billed annually',
    features: [
      'Full access to all PDF issues',
      'New issue every month',
      'Download for offline reading',
      'Priority support',
      'Access to archive (all past issues)',
    ],
  },
}

export async function paddleRequest(endpoint: string, method = 'GET', body?: object) {
  const res = await fetch(`${PADDLE_API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(JSON.stringify(error))
  }

  return res.json()
}

export function verifyPaddleWebhook(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto')
  const parts = signature.split(';')
  const tsPart = parts.find((p: string) => p.startsWith('ts='))
  const h1Part = parts.find((p: string) => p.startsWith('h1='))

  if (!tsPart || !h1Part) return false

  const ts = tsPart.split('=')[1]
  const h1 = h1Part.split('=')[1]

  const signedPayload = `${ts}:${rawBody}`
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')

  return expectedSignature === h1
}
