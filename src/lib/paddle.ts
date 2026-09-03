// src/lib/paddle.ts

import { PRICING } from './pricing'

// Server-side Paddle REST base. Switches to the sandbox host when
// NEXT_PUBLIC_PADDLE_ENV=sandbox so the cancel route (and any future API calls)
// hit the same environment the checkout runs in. Defaults to live.
export const PADDLE_API_URL =
  process.env.NEXT_PUBLIC_PADDLE_ENV === 'sandbox'
    ? 'https://sandbox-api.paddle.com'
    : 'https://api.paddle.com'

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

// Reject events whose timestamp is older/newer than this, to stop replay of a
// captured webhook (e.g. replaying an old `subscription.activated` to re-grant
// access after a cancellation). Paddle recommends 5 seconds; we allow 5 minutes
// to tolerate clock skew and delivery latency.
const WEBHOOK_TOLERANCE_SECONDS = 5 * 60

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

  // Freshness check — guards against replay of a previously valid payload.
  const tsSeconds = Number(ts)
  if (!Number.isFinite(tsSeconds)) return false
  const nowSeconds = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSeconds - tsSeconds) > WEBHOOK_TOLERANCE_SECONDS) return false

  const signedPayload = `${ts}:${rawBody}`
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')

  // Constant-time comparison — avoid leaking the correct HMAC via timing.
  const expectedBuf = Buffer.from(expectedSignature, 'hex')
  const receivedBuf = Buffer.from(h1, 'hex')
  if (expectedBuf.length !== receivedBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, receivedBuf)
}
