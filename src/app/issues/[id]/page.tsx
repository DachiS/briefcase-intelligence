// src/app/issues/[id]/page.tsx
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Document, Page, pdfjs } from 'react-pdf'

// Bundle the pdf.js worker (Turbopack/Next resolves this URL at build time).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface IssueInfo { id: string; title: string; issueNumber: number; publishedAt: string }

export default function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const [issueId, setIssueId] = useState<string | null>(null)
  const [issue, setIssue] = useState<IssueInfo | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [scale, setScale] = useState(1)
  const [baseWidth, setBaseWidth] = useState(820)
  const [fullscreen, setFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => { params.then(({ id }) => setIssueId(id)) }, [params])

  // Access gate + issue metadata (one request: /api/issues gates and returns meta).
  useEffect(() => {
    if (!issueId) return
    fetch('/api/issues').then(async r => {
      if (r.status === 401) { router.push('/login?redirect=/issues/' + issueId); return }
      const data = await r.json().catch(() => ({}))
      if (!data.hasSubscription) { router.push('/clearance'); return }
      const found = (data.issues || []).find((i: IssueInfo) => i.id === issueId)
      if (!found) { setError('Issue not found in the archive.'); setLoading(false); return }
      setIssue(found); setLoading(false)
    }).catch(() => { setError('Failed to load issue.'); setLoading(false) })
  }, [issueId, router])

  // Responsive page width.
  useEffect(() => {
    const update = () => {
      const w = bodyRef.current?.clientWidth ?? window.innerWidth
      setBaseWidth(Math.min(Math.max(w - 48, 280), 900))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [loading, fullscreen])

  const go = useCallback((d: number) => {
    setPageNum(p => Math.min(Math.max(1, p + d), numPages || 1))
  }, [numPages])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const num = issue ? String(issue.issueNumber).padStart(3, '0') : '---'
  const title = issue?.title || 'CLASSIFIED'
  const pdfUrl = issueId ? `/api/issues/${issueId}/pdf` : null

  const ctrlBtn: React.CSSProperties = {
    background: 'none', border: '1px solid var(--border)', color: 'var(--paper-dim)',
    cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em',
    padding: '5px 10px', textTransform: 'uppercase',
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div className="classified-stripe">
        <span className="cs-dot" />{' '}
        READING · ISSUE №{num} · {title} · WATERMARK ACTIVE
        {' '}<span className="cs-dot" />
      </div>

      {!fullscreen && <Navbar />}

      {/* Reader chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px', background: 'var(--bg-deep)', borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/issues" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--paper-dim)', textDecoration: 'none' }}>← ARCHIVE</Link>
          <span style={{ width: 1, height: 16, background: 'var(--border)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.24em', color: 'var(--paper)' }}>FILE №{num} · {title}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={ctrlBtn} onClick={() => setScale(s => Math.max(0.6, +(s - 0.15).toFixed(2)))} aria-label="Zoom out">−</button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--paper-dim)', width: 38, textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
          <button style={ctrlBtn} onClick={() => setScale(s => Math.min(2.5, +(s + 0.15).toFixed(2)))} aria-label="Zoom in">+</button>
          <span style={{ width: 1, height: 16, background: 'var(--border)' }} />
          {pdfUrl && <a href={`${pdfUrl}?download=1`} style={{ ...ctrlBtn, textDecoration: 'none' }}>↓ Download</a>}
          <button style={ctrlBtn} onClick={() => setFullscreen(f => !f)}>⊕ {fullscreen ? 'Exit' : 'Full'}</button>
        </div>
      </div>

      {/* Reader body */}
      <div ref={bodyRef} style={{
        flex: 1, position: 'relative', overflow: 'auto',
        background: 'linear-gradient(180deg, #050810 0%, #0a0e14 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: (loading || error) ? 'center' : 'flex-start',
        padding: '24px 0 88px',
      }}>
        {loading && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>DECRYPTING DOCUMENT…</p>}

        {error && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)', marginBottom: 16 }}>⚠ {error}</p>
            <Link href="/issues" className="btn-outline">Back to Archive</Link>
          </div>
        )}

        {!loading && !error && pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={() => setError('This issue could not be rendered.')}
            loading={<p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>DECRYPTING DOCUMENT…</p>}
            error={<p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)' }}>⚠ Failed to render this issue.</p>}
          >
            <div style={{ boxShadow: '0 12px 48px rgba(0,0,0,0.6)', border: '1px solid var(--border)' }}>
              <Page
                pageNumber={pageNum}
                width={baseWidth * scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          </Document>
        )}
      </div>

      {/* Page navigation bar */}
      {!loading && !error && numPages > 0 && (
        <div style={{
          position: 'sticky', bottom: 0, background: 'var(--bg-deep)', borderTop: '1px solid var(--border)',
          padding: '10px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20,
        }}>
          <button style={{ ...ctrlBtn, opacity: pageNum <= 1 ? 0.4 : 1 }} disabled={pageNum <= 1} onClick={() => go(-1)}>◀ Prev</button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--paper)' }}>
            PAGE {pageNum} / {numPages}
          </span>
          <button style={{ ...ctrlBtn, opacity: pageNum >= numPages ? 0.4 : 1 }} disabled={pageNum >= numPages} onClick={() => go(1)}>Next ▶</button>
        </div>
      )}
    </main>
  )
}
