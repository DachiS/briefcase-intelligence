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
    if (!confirm('Cancel your subscription? You keep access until the end of the billing period.'))
      return

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
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-xs text-paper/30 tracking-widest animate-pulse">
            AUTHENTICATING...
          </p>
        </div>
      </main>
    )
  }

  if (!user) return null

  const sub = user.subscription

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-paper/30 uppercase mb-4">
            Operative File
          </p>
          <h1 className="font-display text-5xl mb-16">Welcome, {user.name.split(' ')[0]}</h1>

          {/* Account Info */}
          <div className="card p-8 mb-6">
            <h2 className="font-mono text-xs tracking-widest text-paper/30 uppercase mb-6">
              Account Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-paper/5 pb-4">
                <span className="font-body text-paper/50 text-sm">Name</span>
                <span className="font-body text-sm">{user.name}</span>
              </div>
              <div className="flex justify-between border-b border-paper/5 pb-4">
                <span className="font-body text-paper/50 text-sm">Email</span>
                <span className="font-body text-sm">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body text-paper/50 text-sm">Access Level</span>
                <span className="font-mono text-xs text-gold-light">
                  {user.role === 'ADMIN' ? 'Director' : user.hasSubscription ? 'Field Agent' : 'Civilian'}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="card p-8 mb-6">
            <h2 className="font-mono text-xs tracking-widest text-paper/30 uppercase mb-6">
              Subscription Status
            </h2>

            {sub ? (
              <div className="space-y-4">
                <div className="flex justify-between border-b border-paper/5 pb-4">
                  <span className="font-body text-paper/50 text-sm">Plan</span>
                  <span className="font-body text-sm capitalize">{sub.plan.toLowerCase()}</span>
                </div>
                <div className="flex justify-between border-b border-paper/5 pb-4">
                  <span className="font-body text-paper/50 text-sm">Status</span>
                  <span
                    className={`font-mono text-xs ${
                      sub.status === 'ACTIVE' ? 'text-green-400' : 'text-red-spy'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
                <div className="flex justify-between border-b border-paper/5 pb-4">
                  <span className="font-body text-paper/50 text-sm">Renews / Expires</span>
                  <span className="font-body text-sm">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {sub.cancelAtPeriodEnd && (
                  <p className="font-mono text-xs text-red-spy/70">
                    Cancels at period end. You keep access until the date above.
                  </p>
                )}
                {!sub.cancelAtPeriodEnd && (
                  <div className="pt-2">
                    <button
                      onClick={handleCancel}
                      disabled={canceling}
                      className="font-mono text-xs text-paper/30 hover:text-red-spy transition-colors"
                    >
                      {canceling ? 'Processing...' : 'Cancel subscription'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="font-body text-paper/50 mb-6">You don&apos;t have an active subscription.</p>
                <Link href="/subscribe" className="btn-primary">
                  Subscribe Now
                </Link>
              </div>
            )}
          </div>

          {/* Quick Links */}
          {user.hasSubscription && (
            <div className="text-center">
              <Link href="/issues" className="btn-primary">
                Browse All Issues →
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
