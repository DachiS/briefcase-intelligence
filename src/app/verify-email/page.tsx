// src/app/verify-email/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      // Call the API route
      fetch(`/api/auth/verify-email?token=${token}`)
        .then(() => router.push('/login?verified=true'))
        .catch(() => router.push('/login?error=invalid-token'))
    }
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="font-mono text-xs text-paper/30 tracking-widest animate-pulse">
        VERIFYING IDENTITY...
      </p>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
