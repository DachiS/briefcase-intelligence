'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import { PRICING, fmt, amountStr } from '@/lib/pricing'

function SubscribePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const sdkRef = useRef(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) { setIsLoggedIn(true); setEmail(d.user.email || '') }
        else if (status === 'authenticated' && session?.user) { setIsLoggedIn(true); setEmail(session.user.email || '') }
        else if (status !== 'loading') setIsLoggedIn(false)
      })
      .catch(() => { if (status === 'authenticated') setIsLoggedIn(true); else setIsLoggedIn(false) })
      .finally(() => setLoading(false))
  }, [status, session])

  // Load Paddle.js. Paddle is our Merchant of Record; checkout activates once
  // the public client token (NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) is configured.
  useEffect(() => {
    if (sdkRef.current) return
    sdkRef.current = true
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    if (!token) return
    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.async = true
    script.onload = () => {
      const Paddle = (window as any).Paddle
      if (!Paddle) return
      if (process.env.NEXT_PUBLIC_PADDLE_ENV === 'sandbox') Paddle.Environment.set('sandbox')
      Paddle.Initialize({ token })
    }
    document.head.appendChild(script)
  }, [])

  const handleCheckout = (plan: 'monthly' | 'annual') => {
    if (!isLoggedIn) { router.push(`/login?redirect=/subscribe?plan=${plan}`); return }
    setError('')
    const Paddle = (window as any).Paddle
    const priceId = plan === 'annual' ? PRICING.stationChief.paddlePriceId : PRICING.fieldAgent.paddlePriceId
    if (!Paddle || !priceId) {
      setError('Secure checkout is being finalized. Please try again shortly or contact support@briefcase.agency.')
      return
    }
    setCheckoutLoading(true)
    const buyerEmail = email || session?.user?.email || undefined
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      ...(buyerEmail ? { customer: { email: buyerEmail } } : {}),
      customData: { plan, email: buyerEmail || '' },
      settings: {
        displayMode: 'overlay',
        successUrl: `${baseUrl}/dashboard?subscribed=true&plan=${plan}`,
      },
    })
    setCheckoutLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <section className="bg-radial-noir" style={{ padding: 'clamp(48px, 8vw, 72px) 24px 56px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span style={{ width: 28, height: 1, background: 'var(--red)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.4em', color: 'var(--red)' }}>// CLEARANCE</span>
          <span style={{ width: 28, height: 1, background: 'var(--red)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 8vw, 4rem)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 0.92, margin: 0, marginBottom: 16 }}>Choose Your Tier</h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--paper-2)', maxWidth: 480, margin: '0 auto 10px', fontStyle: 'italic' }}>
          "Information is the most valuable currency."
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--paper-dim)', maxWidth: 460, margin: '0 auto' }}>
          Each issue arrives sealed, declassified, and delivered to your secure terminal. Cancel any time, no questions logged.
        </p>
      </section>

        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: 'clamp(32px, 6vw, 56px) clamp(16px, 4vw, 40px)' }}>
          {/* Tier cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24, marginBottom: 48 }}>
            {/* Analyst (free) */}
            <div style={{ position: 'relative' }}>
              <div className="card-base" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 52, opacity: 0.15 }} preserveAspectRatio="none" viewBox="0 0 100 30">
                  <polygon points="0,0 50,28 100,0" fill="none" stroke="var(--paper-mute)" strokeWidth="0.8" />
                </svg>
                <div style={{ position: 'absolute', top: 22, right: 18, transform: 'rotate(-6deg)' }}>
                  <div className="stamp-round" style={{ width: 58, height: 58, fontSize: '0.42rem', color: 'var(--paper-dim)', opacity: 0.85 }}>
                    <div>ANA</div><div>LYST</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.32em', color: 'var(--paper-dim)', marginBottom: 10 }}>TIER · 00</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>ANALYST</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--paper-dim)', marginBottom: 22, lineHeight: 1.5 }}>Free tier. Sample one declassified issue per quarter.</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 22 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--paper-dim)' }}>$</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: 'var(--paper)', lineHeight: 0.9 }}>{amountStr(PRICING.analyst.amount)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>/ forever</span>
                </div>
                <div style={{ height: 1, background: 'repeating-linear-gradient(90deg, var(--paper-mute) 0 4px, transparent 4px 8px)', marginBottom: 18 }} />
                {[{ label: '1 sample issue per quarter' }, { label: 'Read in browser only' }, { label: 'Public archive index' }, { label: 'PDF download', locked: true }, { label: 'Full archive access', locked: true }].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ color: f.locked ? 'var(--paper-mute)' : 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', paddingTop: 2 }}>{f.locked ? '×' : '◆'}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: f.locked ? 'var(--paper-mute)' : 'var(--paper-2)', textDecoration: f.locked ? 'line-through' : 'none' }}>{f.label}</span>
                  </div>
                ))}
                <div style={{ marginTop: 24 }}>
                  <a href="/register" className="btn-outline" style={{ display: 'block', textAlign: 'center' }}>Create Account</a>
                </div>
              </div>
            </div>

            {/* Field Agent */}
            <div style={{ position: 'relative', paddingTop: 24 }}>
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
                <span className="stamp red">MOST RECRUITED</span>
              </div>
              <div className="card-base red-edge" style={{ padding: 28, paddingTop: 36, position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #1a0a0a 0%, var(--bg-card) 100%)' }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 52, opacity: 0.18 }} preserveAspectRatio="none" viewBox="0 0 100 30">
                  <polygon points="0,0 50,28 100,0" fill="none" stroke="var(--red)" strokeWidth="0.8" />
                </svg>
                <div style={{ position: 'absolute', top: 22, right: 18, transform: 'rotate(-6deg)' }}>
                  <div className="stamp-round" style={{ width: 58, height: 58, fontSize: '0.42rem', color: 'var(--red)', opacity: 0.85 }}>
                    <div>FIELD</div><div>AGT</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.32em', color: 'var(--red)', marginBottom: 10 }}>TIER · 01</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>FIELD AGENT</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--paper-dim)', marginBottom: 22, lineHeight: 1.5 }}>Full active access. New issue every month, on the day it drops.</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 22 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--paper-dim)' }}>$</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: 'var(--paper)', lineHeight: 0.9 }}>{amountStr(PRICING.fieldAgent.amount)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>/ month</span>
                </div>
                <div style={{ height: 1, background: 'repeating-linear-gradient(90deg, var(--paper-mute) 0 4px, transparent 4px 8px)', marginBottom: 18 }} />
                {[{ label: 'New issue every month' }, { label: 'Full archive · 12 months' }, { label: 'PDF download · offline reading' }, { label: 'Encrypted reader' }, { label: 'Cancel anytime' }].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', paddingTop: 2 }}>◆</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--paper-2)' }}>{f.label}</span>
                  </div>
                ))}
                <div style={{ marginTop: 24 }}>
                  <button onClick={() => handleCheckout('monthly')} disabled={loading || checkoutLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? 'LOADING...' : checkoutLoading ? 'INITIALIZING...' : !isLoggedIn ? 'LOGIN TO SUBSCRIBE' : `Receive Brief — ${fmt(PRICING.fieldAgent.amount)}/mo`}
                  </button>
                </div>
              </div>
            </div>

            {/* Station Chief */}
            <div style={{ position: 'relative' }}>
              <div className="card-base" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 52, opacity: 0.15 }} preserveAspectRatio="none" viewBox="0 0 100 30">
                  <polygon points="0,0 50,28 100,0" fill="none" stroke="var(--gold)" strokeWidth="0.8" />
                </svg>
                <div style={{ position: 'absolute', top: 22, right: 18, transform: 'rotate(-6deg)' }}>
                  <div className="stamp-round" style={{ width: 58, height: 58, fontSize: '0.42rem', color: 'var(--gold)', opacity: 0.85 }}>
                    <div>STN</div><div>CHIEF</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.32em', color: 'var(--paper-dim)', marginBottom: 10 }}>TIER · 02</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>STATION CHIEF</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--paper-dim)', marginBottom: 22, lineHeight: 1.5 }}>Lifetime archive. All declassified issues, plus locked Chief-only briefs.</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 22 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--paper-dim)' }}>$</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: 'var(--paper)', lineHeight: 0.9 }}>{amountStr(PRICING.stationChief.amount)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>/ year</span>
                </div>
                <div style={{ height: 1, background: 'repeating-linear-gradient(90deg, var(--paper-mute) 0 4px, transparent 4px 8px)', marginBottom: 18 }} />
                {[{ label: 'Everything in Field Agent' }, { label: 'Complete archive · all issues' }, { label: 'Chief-only locked briefs' }, { label: 'Priority intelligence inbox' }, { label: 'Save 25% vs monthly · 2 mo free' }].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', paddingTop: 2 }}>◆</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--paper-2)' }}>{f.label}</span>
                  </div>
                ))}
                <div style={{ marginTop: 24 }}>
                  <button onClick={() => handleCheckout('annual')} disabled={loading || checkoutLoading} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? 'LOADING...' : checkoutLoading ? 'INITIALIZING...' : !isLoggedIn ? 'LOGIN TO SUBSCRIBE' : `Select Tier — ${fmt(PRICING.stationChief.amount)}/yr`}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)', border: '1px solid var(--border-red)', padding: '12px 16px', marginBottom: 24, letterSpacing: '0.08em' }}>⚠ {error}</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '12px 24px', border: '1px dashed var(--paper-mute)', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.24em', color: 'var(--paper-dim)' }}>
              <span style={{ color: 'var(--green)' }}>● SECURE</span>
              <span>PAYMENTS BY PADDLE · VISA · MASTERCARD</span>
              <span style={{ color: 'var(--gold)' }}>◆ NO LOG</span>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--paper-dim)', lineHeight: 1.6, marginTop: '20px' }}>
            Payments are securely processed by our reseller and Merchant of Record, Paddle.com. By continuing, you agree to Paddle&apos;s Buyer Terms.
          </p>

          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--paper-dim)', lineHeight: 1.6, marginTop: '12px' }}>
            By subscribing you agree to our{' '}
            <a href="/terms" style={{ color: 'var(--paper)', textDecoration: 'underline' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/refund" style={{ color: 'var(--paper)', textDecoration: 'underline' }}>Refund Policy</a>.
          </p>
        </div>
    </main>
  )
}

export default function SubscribePageWrapper() {
  return <Suspense fallback={<div />}><SubscribePage /></Suspense>
}
