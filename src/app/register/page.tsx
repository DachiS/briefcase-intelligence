// src/app/register/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import Navbar from '@/components/Navbar'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) setError(data.error)
      else setSuccess(true)
    } catch { setError('Something went wrong. Try again.') }
    finally { setLoading(false) }
  }

  if (success) return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '40px 24px' }}>
        <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <div style={{ border: '1px solid var(--red)', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', padding: '6px 16px', display: 'inline-block', marginBottom: '32px' }}>TRANSMISSION SENT</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>CHECK YOUR INBOX</h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', lineHeight: 1.8, marginBottom: '32px' }}>
            A verification link has been dispatched to <strong style={{ color: 'var(--paper)' }}>{form.email}</strong>. Confirm your identity to activate your account.
          </p>
          <Link href="/login" className="btn-primary">Proceed to Login</Link>
        </div>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '40px 24px' }}>
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', textTransform: 'uppercase', marginBottom: '12px' }}>New Operative</div>
          <h1 style={{ fontSize: '3rem', marginBottom: '48px' }}>CREATE ACCOUNT</h1>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--paper)',
              padding: '13px 20px', fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '24px',
              transition: 'border-color 0.2s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <label className="field-label">Full Name</label>
              <input type="text" required placeholder="Your name" className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Email Address</label>
              <input type="email" required placeholder="your@email.com" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input type="password" required placeholder="Minimum 8 characters" className="input-field" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>

            {error && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)', border: '1px solid var(--border-red)', padding: '12px 16px' }}>⚠ {error}</div>}

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: '32px', fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', fontSize: '0.85rem', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--paper)', textDecoration: 'none' }}>Log in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
