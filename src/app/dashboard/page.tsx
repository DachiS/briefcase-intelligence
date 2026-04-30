'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'

interface User {
  id: string; name: string; email: string; role: string; hasSubscription: boolean
  subscription: { plan: string; status: string; currentPeriodEnd: string; cancelAtPeriodEnd: boolean } | null
}

function operativeId(id: string) {
  return '0x' + id.slice(0, 3).toUpperCase() + '-' + id.slice(-3).toUpperCase()
}

function clearanceLabel(user: User) {
  if (user.role === 'ADMIN') return 'DIRECTOR'
  return user.hasSubscription ? 'FIELD AGT' : 'ANALYST'
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data?.user) { setUser(data.user); setLoading(false) }
        else if (status === 'authenticated' && session?.user) {
          setUser({ id: (session.user as any).id || '', name: session.user.name || '', email: session.user.email || '', role: (session.user as any).role || 'SUBSCRIBER', hasSubscription: (session.user as any).hasSubscription || false, subscription: null })
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
    if (res.ok) { const data = await fetch('/api/auth/me').then(r => r.json()); setUser(data.user) }
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
  const callSign = user.name.split(' ')[0].toUpperCase()
  const opId = operativeId(user.id)
  const clearance = clearanceLabel(user)
  const clearanceLevel = user.role === 'ADMIN' ? 4 : user.hasSubscription ? 2 : 1

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, padding: 'clamp(32px, 5vw, 56px) clamp(16px, 4vw, 40px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 32 }}>

          {/* LEFT: ID Card */}
          <div>
            <div className="card-base red-edge" style={{ overflow: 'hidden' }}>
              {/* Card header */}
              <div style={{ background: 'var(--red)', padding: '7px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.32em', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                <span>OPERATIVE ID</span><span>{opId}</span>
              </div>

              {/* Photo + details */}
              <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '100px 1fr', gap: 16 }}>
                <div style={{ width: 100, height: 120, background: 'var(--bg-deep)', border: '1px solid var(--border-2)', display: 'grid', placeItems: 'center', position: 'relative' }}>
                  <svg width="72" height="90" viewBox="0 0 80 100">
                    <circle cx="40" cy="32" r="20" fill="none" stroke="var(--paper-mute)" strokeWidth="1.5" />
                    <path d="M10 100 Q10 60 40 60 Q70 60 70 100" fill="none" stroke="var(--paper-mute)" strokeWidth="1.5" />
                    <line x1="0" y1="50" x2="80" y2="50" stroke="var(--red)" strokeWidth="0.5" strokeDasharray="2 3" />
                    <line x1="40" y1="0" x2="40" y2="100" stroke="var(--red)" strokeWidth="0.5" strokeDasharray="2 3" />
                  </svg>
                  <span style={{ position: 'absolute', bottom: 4, left: 4, fontFamily: 'var(--font-mono)', fontSize: '0.45rem', color: 'var(--paper-mute)', letterSpacing: '0.2em' }}>SUBJECT</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--paper-dim)', marginBottom: 4 }}>CALL SIGN</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 0.92, marginBottom: 12 }}>{callSign}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--paper-dim)', marginBottom: 4 }}>OPERATIVE</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', marginBottom: 12 }}>{user.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--paper-dim)', marginBottom: 4 }}>EMAIL</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper)', letterSpacing: '0.05em', wordBreak: 'break-all' }}>{user.email}</div>
                </div>
              </div>

              {/* Clearance gauge */}
              <div style={{ padding: '0 20px 20px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--paper-dim)', marginBottom: 8 }}>CLEARANCE</div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  {['CIVILIAN', 'ANALYST', 'FIELD AGT', 'STN CHIEF', 'DIRECTOR'].map((t, i) => (
                    <div key={t} style={{ flex: 1, height: 22, background: i <= clearanceLevel ? 'var(--red)' : 'var(--bg-light)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.4rem', letterSpacing: '0.1em', color: i <= clearanceLevel ? '#fff' : 'var(--paper-mute)' }}>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--paper-dim)', letterSpacing: '0.18em' }}>
                  {clearance} · {user.hasSubscription ? 'SUBSCRIBE TO UPGRADE →' : 'ACTIVE'}
                </div>
              </div>

              {/* Signature + stamp */}
              <div style={{ padding: 20, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.28em', color: 'var(--paper-dim)' }}>SIGNATURE</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--paper)', marginTop: 2, fontStyle: 'italic' }}>~{user.name.split(' ').map(n => n[0]).join('.')}~</div>
                </div>
                <div className="stamp-round" style={{ width: 58, height: 58, fontSize: '0.4rem', color: 'var(--red)', transform: 'rotate(-6deg)' }}>
                  VERIFIED<br />ACTIVE
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="card-base" style={{ marginTop: 16, padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--paper-dim)', marginBottom: 14 }}>QUICK ACTIONS</div>
              {([
                user.hasSubscription ? ['→', 'Browse current issues', '/issues'] : null,
                !user.hasSubscription ? ['◆', 'Upgrade clearance', '/clearance'] : null,
                ['→', 'Subscribe / manage plan', '/clearance'],
              ].filter((x): x is string[] => x !== null)).map(([k, l, href], i, arr) => (
                <Link key={l} href={href} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', textDecoration: 'none', color: 'inherit' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: '0.85rem', width: 16 }}>{k}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--paper-2)' }}>{l}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT: Welcome + stats + subscription */}
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.32em', color: 'var(--red)', marginBottom: 10 }}>// WELCOME BACK</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 0.92, margin: 0 }}>Good evening, {callSign}</h1>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', marginTop: 10, fontSize: '0.88rem', lineHeight: 1.6 }}>
                Your operative file is active. {user.hasSubscription ? 'All issues are accessible from the archive.' : 'Subscribe to unlock full archive access.'}
              </p>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 36 }}>
              {[
                { l: 'CLEARANCE', v: clearance, sub: `Level ${clearanceLevel + 1} of 5`, accent: 'var(--red)' },
                { l: 'PLAN', v: sub ? (sub.plan.includes('ANNUAL') ? 'STN CHIEF' : 'FIELD AGT') : 'ANALYST', sub: sub ? 'Active' : 'No subscription', accent: 'var(--gold)' },
                { l: 'STATUS', v: sub?.status || 'FREE', sub: sub?.cancelAtPeriodEnd ? 'Cancels at end' : 'Ongoing', accent: 'var(--green)' },
              ].map(s => (
                <div key={s.l} className="card-base" style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.3em', color: 'var(--paper-dim)' }}>{s.l}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 8, color: s.accent }}>{s.v}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--paper-mute)', letterSpacing: '0.2em', marginTop: 4 }}>{s.sub}</div>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 3, height: '100%', background: s.accent, opacity: 0.6 }} />
                </div>
              ))}
            </div>

            {/* Subscription card */}
            <div className="card-base tab-folder" style={{ padding: 24, marginTop: 28 }}>
              <div className="tab">SUBSCRIPTION</div>

              {sub ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{sub.plan.includes('ANNUAL') ? 'Station Chief · Annual' : 'Field Agent · Monthly'}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--paper-dim)', letterSpacing: '0.2em', marginTop: 4 }}>
                        {sub.cancelAtPeriodEnd ? 'CANCELS' : 'RENEWS'} · {new Date(sub.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </div>
                    </div>
                    <span className="stamp paper">{sub.status}</span>
                  </div>

                  {[
                    ['Plan', sub.plan.toLowerCase()],
                    ['Status', sub.status],
                    ['Renews', new Date(sub.currentPeriodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', letterSpacing: '0.24em', textTransform: 'uppercase' }}>{k}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{v}</span>
                    </div>
                  ))}

                  {sub.cancelAtPeriodEnd && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--red)', opacity: 0.7, marginTop: 10, letterSpacing: '0.1em' }}>Cancels at period end. Access retained until renewal date.</p>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    {!sub.cancelAtPeriodEnd && (
                      <button onClick={handleCancel} disabled={canceling} style={{ background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', cursor: 'pointer', letterSpacing: '0.15em', padding: 0, textTransform: 'uppercase' }}>
                        {canceling ? 'Processing...' : '× Cancel subscription'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ paddingTop: 8 }}>
                  <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.6 }}>No active subscription. Subscribe to access all declassified issues.</p>
                  <Link href="/clearance" className="btn-primary">Begin Clearance</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
