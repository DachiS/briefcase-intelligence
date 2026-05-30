// src/lib/pricing.ts
//
// SINGLE SOURCE OF TRUTH for subscription pricing across the entire site.
// Every price rendered anywhere (homepage, /subscribe, /clearance, /terms,
// /refund, dashboard) must resolve from this module. Do NOT hardcode amounts
// elsewhere — import from here instead.
//
// Canonical amounts resolved per Task 1 rule (a): the Paddle price config in
// `src/lib/paddle.ts` carries live Paddle price IDs (pri_…) at 9.99 / 89.99,
// corroborated by the homepage. (The decommissioned Flitt handler's 19.99 /
// 99.99 were stale and have been removed.)

export type Interval = 'free' | 'month' | 'year'

export interface PricingTier {
  name: string
  amount: number
  interval: Interval
  currency: 'USD'
  /** Paddle price ID (pri_…). Empty for the free tier. */
  paddlePriceId: string
}

export const PRICING = {
  analyst: {
    name: 'Analyst',
    amount: 0,
    interval: 'free',
    currency: 'USD',
    paddlePriceId: '',
  },
  fieldAgent: {
    name: 'Field Agent',
    amount: 9.99,
    interval: 'month',
    currency: 'USD',
    paddlePriceId: 'pri_01kj2yh67dkt5vntse04hpjkav',
  },
  stationChief: {
    name: 'Station Chief',
    amount: 89.99,
    interval: 'year',
    currency: 'USD',
    paddlePriceId: 'pri_01kj2yjnpb7yypb6rkx85zfz8a',
  },
} as const satisfies Record<string, PricingTier>

/** Format an amount as a price string, e.g. 9.99 → "$9.99", 0 → "$0". */
export const fmt = (a: number) => (a === 0 ? '$0' : `$${a.toFixed(2)}`)

/** Bare numeric string (no currency symbol), e.g. 9.99 → "9.99", 0 → "0". */
export const amountStr = (a: number) => (a === 0 ? '0' : a.toFixed(2))

// Pre-formatted convenience strings used in legal/marketing copy.
export const FIELD_AGENT_MONTHLY = fmt(PRICING.fieldAgent.amount) // "$9.99"
export const STATION_CHIEF_ANNUAL = fmt(PRICING.stationChief.amount) // "$89.99"
