'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Auth-aware call-to-action for a homepage pricing tier. The homepage is a
// static server component, so this small client island decides the right CTA
// per visitor: guest vs. logged-in vs. already-subscribed (and which plan).
export type CtaTier = 'analyst' | 'field' | 'station'

interface Me {
  hasSubscription: boolean
  plan: string | null // 'MONTHLY' | 'ANNUAL' | null
}

export default function TierCta({ tier, highlight }: { tier: CtaTier; highlight: boolean }) {
  // undefined = still loading; null = logged out; object = logged in
  const [me, setMe] = useState<Me | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (cancelled) return
        setMe(d.user ? { hasSubscription: !!d.user.hasSubscription, plan: d.user.subscription?.plan ?? null } : null)
      })
      .catch(() => { if (!cancelled) setMe(null) })
    return () => { cancelled = true }
  }, [])

  const cls = highlight ? 'btn-primary' : 'btn-outline'
  const base = { display: 'block', textAlign: 'center' as const }
  const disabled = { ...base, opacity: 0.55, pointerEvents: 'none' as const }

  const link = (href: string, label: string) => <Link href={href} className={cls} style={base}>{label}</Link>
  const current = (label: string) => <span className={cls} style={disabled}>{label}</span>

  // Loading: neutral placeholder so we never flash the wrong CTA.
  if (me === undefined) return <span className={cls} style={disabled}>…</span>

  const loggedIn = me !== null
  const subscribed = !!me?.hasSubscription
  const plan = me?.plan

  if (tier === 'analyst') {
    return loggedIn ? link('/dashboard', 'Go to Dashboard') : link('/register', 'Create Account')
  }

  if (tier === 'field') {
    if (subscribed && plan === 'MONTHLY') return current('Current Plan')
    if (subscribed && plan === 'ANNUAL') return link('/dashboard', 'Manage Plan')
    return link(loggedIn ? '/subscribe' : '/clearance', 'Receive Brief')
  }

  // station (annual)
  if (subscribed && plan === 'ANNUAL') return current('Current Plan')
  if (subscribed && plan === 'MONTHLY') return link('/dashboard', 'Manage Plan')
  return link(loggedIn ? '/subscribe' : '/clearance?plan=annual', 'Select Tier')
}
