// src/app/issues/[id]/page.tsx
'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Document, Page, pdfjs } from 'react-pdf'

// Serve the pdf.js worker from /public at a fixed path. The bundler-resolved
// URL (new URL(..., import.meta.url)) is unreliable in the Next App Router and
// can leave pdf.js rendering on the main thread (freezing the tab). Must match
// the pdfjs-dist version react-pdf depends on (copied from node_modules).
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

interface IssueInfo { id: string; title: string; issueNumber: number; publishedAt: string }

// Two-page spread on wide screens (desktop/laptop), single page below this.
const SPREAD_MIN_WIDTH = 1024

export default function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const [issueId, setIssueId] = useState<string | null>(null)
  const [issue, setIssue] = useState<IssueInfo | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNum, setPageNum] = useState(1) // in spread mode this is the LEFT page
  const [scale, setScale] = useState(1)
  const [spread, setSpread] = useState(false)
  const [pageWidth, setPageWidth] = useState(700)
  const [fullscreen, setFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const bodyRef = useRef<HTMLDivElement>(null)
  const wheelLock = useRef(0) // timestamp of last wheel event (gesture detection)

  useEffect(() => { params.then(({ id }) => setIssueId(id)) }, [params])

  // Access gate + issue metadata.
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

  // Responsive: choose orientation (spread vs single) and page width by width.
  useEffect(() => {
    const update = () => {
      const w = bodyRef.current?.clientWidth ?? window.innerWidth
      const useSpread = w >= SPREAD_MIN_WIDTH
      setSpread(useSpread)
      if (useSpread) {
        // Two pages side by side (24px gap, 48px padding), capped so they don't balloon.
        setPageWidth(Math.min(Math.floor((w - 48 - 24) / 2), 620))
        // Left page of a spread is always odd (pages 1-2, 3-4, …).
        setPageNum(p => (p % 2 === 0 ? p - 1 : p))
      } else {
        setPageWidth(Math.min(Math.max(w - 48, 280), 900))
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [loading, fullscreen])

  const go = useCallback((dir: number) => {
    setPageNum(p => Math.min(Math.max(1, p + dir * (spread ? 2 : 1)), numPages || 1))
  }, [spread, numPages])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // Touchpad / wheel turns pages. If the page is taller than the viewport
  // (zoomed in), scrolling pans it first and only flips at the top/bottom edge;
  // when the page fits, a scroll flips. Crucially, it flips ONCE per deliberate
  // gesture: a touchpad flick emits a long stream of momentum events, so we only
  // act on the first event of a gesture (events >150ms apart) and ignore the
  // momentum tail — otherwise one swipe cascades into many flips (the lag).
  useEffect(() => {
    const el = bodyRef.current
    if (!el || loading || error) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 4) return
      const canScrollDown = el.scrollTop + el.clientHeight < el.scrollHeight - 2
      const canScrollUp = el.scrollTop > 2
      const flipping = (e.deltaY > 0 && !canScrollDown) || (e.deltaY < 0 && !canScrollUp)
      const now = performance.now()
      const gap = now - wheelLock.current
      wheelLock.current = now
      if (!flipping) return // let native scroll pan a tall page
      e.preventDefault()
      if (gap < 150) return // momentum tail of the same gesture — ignore
      const isEnd = spread ? pageNum + 1 >= numPages : pageNum >= numPages
      const isStart = pageNum <= 1
      if (e.deltaY > 0 && !isEnd) { go(1); el.scrollTop = 0 }
      else if (e.deltaY < 0 && !isStart) { go(-1); el.scrollTop = 0 }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [loading, error, pageNum, numPages, spread, go])

  const num = issue ? String(issue.issueNumber).padStart(3, '0') : '---'
  const title = issue?.title || 'CLASSIFIED'
  const pdfUrl = issueId ? `/api/issues/${issueId}/pdf` : null

  // Memoize what react-pdf keys on so the document loads exactly ONCE and page
  // turns/zoom don't reload or re-parse it. disableStream/disableRange make
  // pdf.js do a single full fetch (our endpoint returns the whole file).
  const file = useMemo(() => (pdfUrl ? { url: pdfUrl } : null), [pdfUrl])
  const pdfOptions = useMemo(() => ({ disableStream: true, disableRange: true }), [])
  const onDocLoad = useCallback(({ numPages }: { numPages: number }) => setNumPages(numPages), [])
  const onDocError = useCallback(() => setError('This issue could not be rendered.'), [])

  const rightPage = pageNum + 1 <= numPages ? pageNum + 1 : null
  const atStart = pageNum <= 1
  const atEnd = spread ? pageNum + 1 >= numPages : pageNum >= numPages

  const ctrlBtn: React.CSSProperties = {
    background: 'none', border: '1px solid var(--border)', color: 'var(--paper-dim)',
    cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em',
    padding: '5px 10px', textTransform: 'uppercase',
  }
  const pageFrame: React.CSSProperties = { boxShadow: '0 12px 48px rgba(0,0,0,0.6)', border: '1px solid var(--border)', background: '#fff' }

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
            file={file}
            options={pdfOptions}
            onLoadSuccess={onDocLoad}
            onLoadError={onDocError}
            loading={<p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>DECRYPTING DOCUMENT…</p>}
            error={<p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)' }}>⚠ Failed to render this issue.</p>}
          >
            <div style={{ display: 'flex', flexDirection: 'row', gap: spread ? 2 : 0, alignItems: 'flex-start' }}>
              <div style={pageFrame}>
                <Page pageNumber={pageNum} width={pageWidth * scale} renderTextLayer={false} renderAnnotationLayer={false} />
              </div>
              {spread && rightPage && (
                <div style={pageFrame}>
                  <Page pageNumber={rightPage} width={pageWidth * scale} renderTextLayer={false} renderAnnotationLayer={false} />
                </div>
              )}
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
          <button style={{ ...ctrlBtn, opacity: atStart ? 0.4 : 1 }} disabled={atStart} onClick={() => go(-1)}>◀ Prev</button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--paper)' }}>
            {spread && rightPage ? `PAGES ${pageNum}–${rightPage}` : `PAGE ${pageNum}`} / {numPages}
          </span>
          <button style={{ ...ctrlBtn, opacity: atEnd ? 0.4 : 1 }} disabled={atEnd} onClick={() => go(1)}>Next ▶</button>
        </div>
      )}
    </main>
  )
}
