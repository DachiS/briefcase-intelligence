// src/app/subscribe/page.tsx
'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'

const PLANS = {
  monthly: { label: 'Field Agent', price: '$19.99', period: 'per month', desc: 'Full access to all issues, monthly billing', amount: 1999 },
  annual:  { label: 'Station Chief', price: '$99.99', period: 'per year', desc: 'Full access + 2 months free, billed annually', amount: 9999 },
}

const MERCHANT_ID = 1549901

function SubscribePage() {
  const [selected, setSelected] = useState<'monthly' | 'annual'>('monthly')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const sdkRef = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam === 'annual') setSelected('annual')
  }, [searchParams])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) { setIsLoggedIn(true); setUserId(d.user.id) }
        else if (status === 'authenticated' && session?.user) {
          setIsLoggedIn(true)
          setUserId((session.user as any).id || '')
        } else if (status !== 'loading') setIsLoggedIn(false)
      })
      .catch(() => {
        if (status === 'authenticated') setIsLoggedIn(true)
        else setIsLoggedIn(false)
      })
      .finally(() => setLoading(false))
  }, [status, session])

  // Pre-load Flitt SDK on mount
  useEffect(() => {
    if (sdkRef.current) return
    sdkRef.current = true
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@flittpayments/js-sdk'
    script.async = true
    document.head.appendChild(script)
  }, [])

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/subscribe?plan=${selected}`)
      return
    }
    setCheckoutLoading(true)
    setError('')

    try {
      // Wait for $checkout global (max 5s)
      let attempts = 0
      while (!(window as any).$checkout && attempts < 50) {
        await new Promise(r => setTimeout(r, 100))
        attempts++
      }
      if (!(window as any).$checkout) throw new Error('Payment SDK failed to load — please refresh and try again')

      setCheckoutLoading(false)

      const plan = PLANS[selected]
      const orderId = `order_${userId}_${Date.now()}`
      const baseUrl = window.location.origin

      // Correct embedded checkout — pass params directly (no server token needed)
      // Use redirect checkout — most reliable with test credentials
      const googleEmail = session?.user?.email || null
      const res = await fetch('/api/flitt/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected, googleEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to initialise payment')

      // Submit form via POST to Flitt hosted checkout page
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = 'https://pay.flitt.com/api/checkout/redirect/'
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'token'
      input.value = data.token
      form.appendChild(input)
      document.body.appendChild(form)
      form.submit()

    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to load payment form')
      setShowCheckout(false)
      setCheckoutLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', textTransform: 'uppercase', marginBottom: '12px' }}>Clearance Granted</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', marginBottom: '16px' }}>Choose Your Access Level</h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', fontSize: '1rem' }}>Unlock exclusive intelligence. Cancel anytime.</p>
        </div>

        {!showCheckout && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
              {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => (
                <button key={key} onClick={() => setSelected(key)} style={{
                  background: selected === key ? 'var(--bg-light)' : 'var(--bg-card)',
                  border: selected === key ? '1px solid var(--red)' : '1px solid var(--border)',
                  padding: '28px 24px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                }}>
                  {key === 'annual' && (
                    <div style={{ position: 'absolute', top: '-1px', right: '-1px', background: 'var(--red)', padding: '3px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.2em' }}>BEST VALUE</div>
                  )}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.25em', color: 'var(--red)', marginBottom: '8px', textTransform: 'uppercase' }}>{plan.label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--paper)', marginBottom: '4px' }}>{plan.price}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', marginBottom: '12px' }}>{plan.period}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--paper-dim)' }}>{plan.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ border: '1px solid var(--border)', padding: '24px', marginBottom: '40px' }}>
              {['Access to all published issues', 'New intelligence briefings monthly', 'Exclusive operative analyses', 'Cancel anytime, no questions asked'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>◆</div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--paper-dim)' }}>{item}</span>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)', border: '1px solid var(--border-red)', padding: '12px 16px', marginBottom: '24px' }}>⚠ {error}</div>
            )}

            <button onClick={handleCheckout} disabled={loading || checkoutLoading} className="btn-primary" style={{ width: '100%', fontSize: '0.85rem', padding: '16px' }}>
              {loading ? 'LOADING...' : checkoutLoading ? 'INITIALIZING...' : !isLoggedIn ? 'LOGIN TO SUBSCRIBE' : `SUBSCRIBE — ${PLANS[selected].price}`}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--paper-dim)', letterSpacing: '0.1em' }}>SECURED BY FLITT · VISA · MASTERCARD</p>
          </>
        )}

        {showCheckout && (
          <div>
            {checkoutLoading && (
              <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>INITIALIZING SECURE PAYMENT...</div>
            )}
            <div id="flitt-checkout-container" style={{ minHeight: '400px', width: '100%' }} />
            <button onClick={() => { setShowCheckout(false); setError('') }} style={{ marginTop: '20px', background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', cursor: 'pointer', letterSpacing: '0.2em' }}>
              ← BACK TO PLANS
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default function SubscribePageWrapper() {
  return <Suspense fallback={<div />}><SubscribePage /></Suspense>
}
