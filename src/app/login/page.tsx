'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Navbar from '@/components/Navbar'

function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified')
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.toLowerCase(), password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error)
      else { router.push(redirectTo); router.refresh() }
    } catch { setError('Something went wrong. Try again.') }
    finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: redirectTo })
  }

  return (
    <div style={{ width: '100%', maxWidth: 480, padding: 'clamp(32px, 6vw, 56px) clamp(24px, 5vw, 40px)', background: 'var(--bg-card)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      {/* grid texture */}
      <div className="tex-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Wordmark */}
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--paper)', lineHeight: 0.9 }}>
            BRIEF<span style={{ color: 'var(--red)' }}>C</span>ASE
          </div>
        </Link>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.4em', color: 'var(--red)', marginBottom: 12 }}>// OPERATIVE ACCESS</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 6vw, 3rem)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 0.92, margin: 0, marginBottom: 32 }}>
          Authenticate<span className="cursor" />
        </h1>

        {/* Terminal output */}
        <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', padding: '14px 16px', marginBottom: 28, fontFamily: 'var(--font-mono)', fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--paper-dim)' }}>
          <div><span style={{ color: 'var(--green)' }}>$</span> establishing secure channel...</div>
          <div><span style={{ color: 'var(--green)' }}>$</span> handshake · TLS 1.3 · <span style={{ color: 'var(--green)' }}>OK</span></div>
          <div><span style={{ color: 'var(--green)' }}>$</span> awaiting credentials<span className="cursor" /></div>
        </div>

        {verified && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--green)', border: '1px solid rgba(74,222,128,0.3)', padding: '12px 16px', marginBottom: 24, letterSpacing: '0.1em' }}>
            ✓ Identity verified. You may now authenticate.
          </div>
        )}

        {/* Operative ID field */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.28em', color: 'var(--paper-dim)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>Operative ID</span>
            <span style={{ color: 'var(--red)' }}>● REQ</span>
          </div>
          <div className="term-field-prefix">
            <span className="pre">ID/</span>
            <input type="email" required placeholder="agent@station.local" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>

        {/* Cipher Key field */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.28em', color: 'var(--paper-dim)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>Cipher Key</span>
            <span style={{ color: 'var(--red)' }}>● REQ</span>
          </div>
          <div className="term-field-prefix">
            <span className="pre">*</span>
            <input type="password" required placeholder="••••••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
        </div>

        {/* Remember + forgot */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--paper-dim)', textTransform: 'uppercase', cursor: 'pointer' }}>
            <span style={{ width: 14, height: 14, border: '1px solid var(--border-2)', display: 'grid', placeItems: 'center', background: 'var(--bg-deep)', flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, background: 'var(--red)' }} />
            </span>
            Trust this terminal · 30 days
          </label>
          <Link href="/forgot-password" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--red)', textDecoration: 'none', textTransform: 'uppercase' }}>
            FORGOT KEY?
          </Link>
        </div>

        {error && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)', border: '1px solid var(--border-red)', padding: '12px 16px', marginBottom: 20, letterSpacing: '0.08em' }}>⚠ {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.85rem' }}>
            {loading ? 'AUTHENTICATING...' : '► Authenticate'}
          </button>
        </form>

        {/* Divider */}
        <div className="div-mono div-dashed" style={{ margin: '28px 0' }}><span>OR</span></div>

        {/* Google */}
        <button onClick={handleGoogle} disabled={googleLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'transparent', border: '1px solid var(--border-red)', color: 'var(--paper)', padding: '12px 20px', fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.2s', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--red-dim)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', fontSize: '0.85rem', textAlign: 'center', marginTop: 28 }}>
          New operative?{' '}
          <Link href="/register" style={{ color: 'var(--paper)', borderBottom: '1px solid var(--red)', paddingBottom: 1, textDecoration: 'none' }}>Begin recruitment →</Link>
        </p>

        {/* Footer security */}
        <div style={{ marginTop: 36, padding: '12px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.24em', color: 'var(--paper-mute)' }}>
          <span>● TLS 1.3 · ChaCha20</span>
          <span>SESS 0xA47-F19</span>
          <span>BC-INTEL</span>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="bg-noir tex-grain" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px, 6vw, 64px) 20px' }}>
        <Suspense fallback={<div />}><LoginForm /></Suspense>
      </div>
    </main>
  )
}
