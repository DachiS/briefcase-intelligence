// src/lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const PLANS = {
  monthly: {
    name: 'Monthly',
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    price: 9.99,
    interval: 'month' as const,
    description: 'Access to all issues, billed monthly',
    features: [
      'Full access to all PDF issues',
      'New issue every month',
      'Download for offline reading',
      'Cancel anytime',
    ],
  },
  annual: {
    name: 'Annual',
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID!,
    price: 89.99,
    interval: 'year' as const,
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
