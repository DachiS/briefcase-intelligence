// src/app/issues/[id]/page.tsx
'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Document, Page, pdfjs } from 'react-pdf'

// Serve the pdf.js worker from /public at a fixed path (the bundler-resolved URL
// is unreliable in the App Router). Must match the pdfjs-dist version.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

interface IssueInfo { id: string; title: string; issueNumber: number; publishedAt: string }

// Two-page spread on wide screens (desktop/laptop), single page below.
const SPREAD_MIN_WIDTH = 1024

// One row of the continuous scroll: a single page, or a two-page spread. The
// page(s) mount only when the row nears the viewport (and stay mounted), so a
// long magazine doesn't rasterize every page up front. Rendering happens once —
// after that, native scrolling is smooth (no per-turn re-rasterization).
function ReaderRow({
  index, pages, width, dpr, gap, register,
}: {
  index: number; pages: number[]; width: number; dpr: number; gap: number
  register: (i: number, el: HTMLDivElement | null) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(index < 2) // first spreads render eagerly
  useEffect(() => {
    register(index, ref.current)
    if (show) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect() } },
      { rootMargin: '1400px 0px' },
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [index, show, register])

  const estH = Math.round(width * 1.414) // A4-ish placeholder before render
  return (
    <div ref={ref} data-row-index={index} style={{ display: 'flex', gap, justifyContent: 'center', width: '100%' }}>
      {pages.map(p => (
        <div key={p} style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.55)', border: '1px solid var(--border)', background: '#0a0e14', width, minHeight: show ? undefined : estH }}>
          {show && (
            <Page
              pageNumber={p}
              width={width}
              devicePixelRatio={dpr}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={<div style={{ width, height: estH }} />}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const [issueId, setIssueId] = useState<string | null>(null)
  const [issue, setIssue] = useState<IssueInfo | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1)
  const [spread, setSpread] = useState(false)
  const [pageWidth, setPageWidth] = useState(700)
  const [fullscreen, setFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentRow, setCurrentRow] = useState(0)
  const router = useRouter()
  const bodyRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

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

  // Responsive: spread vs single, and page width.
  useEffect(() => {
    const update = () => {
      const w = bodyRef.current?.clientWidth ?? window.innerWidth
      const useSpread = w >= SPREAD_MIN_WIDTH
      setSpread(useSpread)
      setPageWidth(useSpread
        ? Math.min(Math.floor((w - 48 - 24) / 2), 620)
        : Math.min(Math.max(w - 48, 280), 900))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [loading, fullscreen])

  // Group pages into rows (spread = pairs, single = one page each).
  const rows = useMemo(() => {
    const out: number[][] = []
    const per = spread ? 2 : 1
    for (let p = 1; p <= numPages; p += per) {
      out.push(per === 2 && p + 1 <= numPages ? [p, p + 1] : [p])
    }
    return out
  }, [numPages, spread])

  const register = useCallback((i: number, el: HTMLDivElement | null) => { rowRefs.current[i] = el }, [])

  // Update the page indicator from whichever row is most in view.
  useEffect(() => {
    const root = bodyRef.current
    if (!root || rows.length === 0) return
    const io = new IntersectionObserver((entries) => {
      let best = -1, bestRatio = 0
      entries.forEach(e => {
        if (e.intersectionRatio > bestRatio) { bestRatio = e.intersectionRatio; best = Number((e.target as HTMLElement).dataset.rowIndex) }
      })
      if (best >= 0 && bestRatio > 0.25) setCurrentRow(best)
    }, { root, threshold: [0.25, 0.5, 0.75] })
    rowRefs.current.slice(0, rows.length).forEach(el => el && io.observe(el))
    return () => io.disconnect()
  }, [rows])

  const scrollToRow = useCallback((idx: number) => {
    rowRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const go = useCallback((dir: number) => {
    setCurrentRow(c => {
      const n = Math.min(Math.max(0, c + dir), Math.max(0, rows.length - 1))
      scrollToRow(n)
      return n
    })
  }, [rows.length, scrollToRow])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(1) }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const num = issue ? String(issue.issueNumber).padStart(3, '0') : '---'
  const title = issue?.title || 'CLASSIFIED'
  const pdfUrl = issueId ? `/api/issues/${issueId}/pdf` : null
  const file = useMemo(() => (pdfUrl ? { url: pdfUrl } : null), [pdfUrl])
  const pdfOptions = useMemo(() => ({ disableStream: true, disableRange: true }), [])
  const dpr = useMemo(() => (typeof window !== 'undefined' ? Math.min(1.5, window.devicePixelRatio || 1) : 1), [])
  const onDocLoad = useCallback(({ numPages }: { numPages: number }) => setNumPages(numPages), [])
  const onDocError = useCallback(() => setError('This issue could not be rendered.'), [])

  const curPages = rows[currentRow] || []
  const first = curPages[0], last = curPages[curPages.length - 1]
  const atStart = currentRow <= 0
  const atEnd = currentRow >= rows.length - 1

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

      {/* Reader body — continuous vertical scroll */}
      <div ref={bodyRef} style={{
        flex: 1, position: 'relative', overflow: 'auto',
        background: 'linear-gradient(180deg, #050810 0%, #0a0e14 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: (loading || error) ? 'center' : 'flex-start',
        gap: 16, padding: '24px 0 88px', scrollBehavior: 'smooth',
      }}>
        {loading && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>DECRYPTING DOCUMENT…</p>}

        {error && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)', marginBottom: 16 }}>⚠ {error}</p>
            <Link href="/issues" className="btn-outline">Back to Archive</Link>
          </div>
        )}

        {!loading && !error && file && (
          <Document
            file={file}
            options={pdfOptions}
            onLoadSuccess={onDocLoad}
            onLoadError={onDocError}
            loading={<p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>DECRYPTING DOCUMENT…</p>}
            error={<p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)' }}>⚠ Failed to render this issue.</p>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
              {rows.map((row, i) => (
                <ReaderRow key={i} index={i} pages={row} width={pageWidth * scale} dpr={dpr} gap={spread ? 2 : 0} register={register} />
              ))}
            </div>
          </Document>
        )}
      </div>

      {/* Page navigation bar (jumps the scroll to the prev/next spread) */}
      {!loading && !error && numPages > 0 && (
        <div style={{
          position: 'sticky', bottom: 0, background: 'var(--bg-deep)', borderTop: '1px solid var(--border)',
          padding: '10px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20,
        }}>
          <button style={{ ...ctrlBtn, opacity: atStart ? 0.4 : 1 }} disabled={atStart} onClick={() => go(-1)}>◀ Prev</button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--paper)' }}>
            {first && last && last !== first ? `PAGES ${first}–${last}` : `PAGE ${first || 1}`} / {numPages}
          </span>
          <button style={{ ...ctrlBtn, opacity: atEnd ? 0.4 : 1 }} disabled={atEnd} onClick={() => go(1)}>Next ▶</button>
        </div>
      )}
    </main>
  )
}
