// src/app/issues/[id]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [issueId, setIssueId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    params.then(({ id }) => setIssueId(id))
  }, [params])

  useEffect(() => {
    if (!issueId) return

    fetch(`/api/issues/${issueId}/read`)
      .then((r) => {
        if (r.status === 401) { router.push('/login?redirect=/issues/' + issueId); return null }
        if (r.status === 403) { router.push('/subscribe'); return null }
        if (!r.ok) throw new Error('Failed to load issue')
        return r.json()
      })
      .then((data) => {
        if (data) { setPdfUrl(data.url); setLoading(false) }
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [issueId, router])

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/issues" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', textDecoration: 'none' }}>
          ← Back to Issues
        </Link>
        {pdfUrl && (
          <a href={pdfUrl} download style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', textDecoration: 'none' }}>
            ↓ Download PDF
          </a>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em', animation: 'pulse 2s infinite' }}>
            DECRYPTING DOCUMENT...
          </p>
        )}
        {error && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)', marginBottom: '16px' }}>⚠ {error}</p>
            <Link href="/issues" className="btn-outline">Back to Issues</Link>
          </div>
        )}
        {pdfUrl && (
          <iframe
            src={pdfUrl + '#toolbar=1&navpanes=0&scrollbar=1'}
            style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none' }}
            title="Issue PDF"
          />
        )}
      </div>
    </main>
  )
}