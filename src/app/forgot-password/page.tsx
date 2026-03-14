// src/app/forgot-password/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error)
      else setSent(true)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '40px 24px' }}>
        <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <div style={{ border: '1px solid var(--red)', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', padding: '6px 16px', display: 'inline-block', marginBottom: '32px' }}>TRANSMISSION SENT</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>CHECK YOUR INBOX</h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', lineHeight: 1.8, marginBottom: '32px' }}>
            If that email is registered, a password reset link has been sent. Check your inbox and spam folder.
          </p>
          <Link href="/login" className="btn-primary">Back to Login</Link>
        </div>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '40px 24px' }}>
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', textTransform: 'uppercase', marginBottom: '12px' }}>Access Recovery</div>
          <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>FORGOT PASSWORD</h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', marginBottom: '48px', lineHeight: 1.7 }}>
            Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <label className="field-label">Email Address</label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)', border: '1px solid var(--border-red)', padding: '12px 16px' }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p style={{ marginTop: '32px', fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', fontSize: '0.85rem', textAlign: 'center' }}>
            Remembered it?{' '}
            <Link href="/login" style={{ color: 'var(--paper)', textDecoration: 'none' }}>Back to login</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
