// src/app/issues/[id]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface IssueInfo { id: string; title: string; issueNumber: number; publishedAt: string }

export default function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [issue, setIssue] = useState<IssueInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [issueId, setIssueId] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    params.then(({ id }) => setIssueId(id))
  }, [params])

  useEffect(() => {
    if (!issueId) return
    Promise.all([
      fetch(`/api/issues/${issueId}/read`),
      fetch('/api/issues'),
    ]).then(async ([readRes, issuesRes]) => {
      if (readRes.status === 401) { router.push('/login?redirect=/issues/' + issueId); return }
      if (readRes.status === 403) { router.push('/clearance'); return }
      if (!readRes.ok) throw new Error('Failed to load issue')
      const [readData, issuesData] = await Promise.all([readRes.json(), issuesRes.json()])
      setPdfUrl(readData.url)
      if (issuesData?.issues) {
        const found = issuesData.issues.find((i: IssueInfo) => i.id === issueId)
        if (found) setIssue(found)
      }
      setLoading(false)
    }).catch(err => { setError(err.message); setLoading(false) })
  }, [issueId, router])

  const num = issue ? String(issue.issueNumber).padStart(3, '0') : '---'
  const title = issue?.title || 'CLASSIFIED'

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Classification stripe */}
      <div className="classified-stripe">
        <span className="cs-dot" />{' '}
        READING · ISSUE №{num} · {title} · WATERMARK ACTIVE
        {' '}<span className="cs-dot" />
      </div>

      <Navbar />

      {/* Reader chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px', background: 'var(--bg-deep)', borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/issues" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--paper-dim)', textDecoration: 'none' }}>
            ← ARCHIVE
          </Link>
          <span style={{ width: 1, height: 16, background: 'var(--border)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.24em', color: 'var(--paper)' }}>
            FILE №{num} · {title}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 20, fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--paper-dim)' }}>
          {pdfUrl && (
            <a href={pdfUrl} download style={{ color: 'var(--paper-dim)', textDecoration: 'none' }}>
              ↓ DOWNLOAD
            </a>
          )}
          <button
            onClick={() => setFullscreen(f => !f)}
            style={{ background: 'none', border: 'none', color: 'var(--paper-dim)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', padding: 0 }}
          >
            ⊕ {fullscreen ? 'EXIT' : 'FULLSCREEN'}
          </button>
        </div>
      </div>

      {/* Reader body */}
      <div style={{
        flex: 1, position: 'relative',
        background: 'linear-gradient(180deg, #050810 0%, #0a0e14 100%)',
        display: 'flex', alignItems: loading || error ? 'center' : 'stretch', justifyContent: 'center',
      }}>
        {/* Watermark */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(-30deg)',
          fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 800,
          color: 'var(--paper)', opacity: 0.03, letterSpacing: '0.2em',
          whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none', zIndex: 0,
        }}>
          BRIEFCASE · CLASSIFIED
        </div>

        {loading && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em', position: 'relative', zIndex: 1 }}>
            DECRYPTING DOCUMENT...
          </p>
        )}

        {error && (
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)', marginBottom: 16 }}>⚠ {error}</p>
            <Link href="/issues" className="btn-outline">Back to Archive</Link>
          </div>
        )}

        {pdfUrl && (
          <iframe
            src={pdfUrl + '#toolbar=1&navpanes=0&scrollbar=1'}
            style={{
              position: 'relative', zIndex: 1,
              width: '100%',
              height: fullscreen ? '100vh' : 'calc(100vh - 168px)',
              border: 'none',
            }}
            title="Issue PDF"
          />
        )}
      </div>

      {/* Footer rail */}
      <div style={{
        background: 'var(--bg-deep)', borderTop: '1px solid var(--border)',
        padding: '8px 24px', display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.24em', color: 'var(--paper-mute)',
      }}>
        <span>● STREAMING FROM SECURE VAULT</span>
        <span>SIGNED URL · EXPIRES 02:00:00</span>
        <span>BRIEFCASE · TS//SCI</span>
      </div>
    </main>
  )
}
