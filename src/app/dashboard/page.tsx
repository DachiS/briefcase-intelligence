// src/app/dashboard/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'

interface User {
  id: string
  name: string
  email: string
  role: string
  hasSubscription: boolean
  subscription: {
    plan: string
    status: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  } | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
          setLoading(false)
        } else if (status === 'authenticated' && session?.user) {
          setUser({
            id: (session.user as any).id || '',
            name: session.user.name || '',
            email: session.user.email || '',
            role: (session.user as any).role || 'SUBSCRIBER',
            hasSubscription: (session.user as any).hasSubscription || false,
            subscription: null,
          })
          setLoading(false)
        } else if (status === 'unauthenticated') {
          router.push('/login?redirect=/dashboard')
        }
      })
      .catch(() => router.push('/login'))
  }, [router, session, status])

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? You keep access until the end of the billing period.')) return
    setCanceling(true)
    const res = await fetch('/api/paddle/cancel', { method: 'POST' })
    if (res.ok) {
      const data = await fetch('/api/auth/me').then((r) => r.json())
      setUser(data.user)
    }
    setCanceling(false)
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>AUTHENTICATING...</p>
        </div>
      </main>
    )
  }

  if (!user) return null

  const sub = user.subscription

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, padding: 'clamp(48px, 8vw, 96px) 20px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Operative File
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', marginBottom: 'clamp(40px, 8vw, 64px)' }}>
            Welcome, {user.name.split(' ')[0]}
          </h1>

          {/* Account Info */}
          <div className="card" style={{ padding: 'clamp(20px, 5vw, 32px)', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', textTransform: 'uppercase', marginBottom: '24px' }}>
              Account Details
            </h2>
            <div>
              {[
                { label: 'Name', value: user.name },
                { label: 'Email', value: user.email },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(232,230,225,0.05)', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--paper-dim)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', wordBreak: 'break-all' }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--paper-dim)' }}>Access Level</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#c8a96e', letterSpacing: '0.1em' }}>
                  {user.role === 'ADMIN' ? 'Director' : user.hasSubscription ? 'Field Agent' : 'Civilian'}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="card" style={{ padding: 'clamp(20px, 5vw, 32px)', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', textTransform: 'uppercase', marginBottom: '24px' }}>
              Subscription Status
            </h2>

            {sub ? (
              <div>
                {[
                  { label: 'Plan', value: sub.plan.toLowerCase(), capitalize: true },
                  { label: 'Status', value: sub.status, mono: true, green: sub.status === 'ACTIVE' },
                  { label: 'Renews / Expires', value: new Date(sub.currentPeriodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                ].map(({ label, value, capitalize, mono, green }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(232,230,225,0.05)', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--paper-dim)' }}>{label}</span>
                    <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)', fontSize: mono ? '0.65rem' : '0.85rem', textTransform: capitalize ? 'capitalize' : 'none', color: green !== undefined ? (green ? '#4ade80' : 'var(--red)') : 'inherit' }}>{value}</span>
                  </div>
                ))}
                {sub.cancelAtPeriodEnd && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--red)', opacity: 0.7, marginTop: '8px' }}>
                    Cancels at period end. You keep access until the date above.
                  </p>
                )}
                {!sub.cancelAtPeriodEnd && (
                  <div style={{ paddingTop: '8px' }}>
                    <button onClick={handleCancel} disabled={canceling} style={{ background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', cursor: 'pointer', letterSpacing: '0.1em' }}>
                      {canceling ? 'Processing...' : 'Cancel subscription'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', marginBottom: '24px', fontSize: '0.9rem' }}>You don&apos;t have an active subscription.</p>
                <Link href="/subscribe" className="btn-primary">Subscribe Now</Link>
              </div>
            )}
          </div>

          {user.hasSubscription && (
            <div style={{ textAlign: 'center' }}>
              <Link href="/issues" className="btn-primary">Browse All Issues →</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
