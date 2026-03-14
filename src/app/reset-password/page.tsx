// src/app/reset-password/page.tsx
'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error)
      else setSuccess(true)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)', marginBottom: '16px' }}>⚠ Invalid reset link</p>
      <Link href="/forgot-password" className="btn-primary">Request New Link</Link>
    </div>
  )

  if (success) return (
    <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
      <div style={{ border: '1px solid var(--red)', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', padding: '6px 16px', display: 'inline-block', marginBottom: '32px' }}>SUCCESS</div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>PASSWORD UPDATED</h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', lineHeight: 1.8, marginBottom: '32px' }}>
        Your password has been updated. You can now log in with your new password.
      </p>
      <Link href="/login" className="btn-primary">Go to Login</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: '440px', width: '100%' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', textTransform: 'uppercase', marginBottom: '12px' }}>Access Recovery</div>
      <h1 style={{ fontSize: '3rem', marginBottom: '48px' }}>RESET PASSWORD</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <label className="field-label">New Password</label>
          <input
            type="password"
            required
            placeholder="Minimum 8 characters"
            className="input-field"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Confirm Password</label>
          <input
            type="password"
            required
            placeholder="Repeat your password"
            className="input-field"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        </div>

        {error && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)', border: '1px solid var(--border-red)', padding: '12px 16px' }}>
            ⚠ {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '40px 24px' }}>
        <Suspense fallback={<div />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  )
}
