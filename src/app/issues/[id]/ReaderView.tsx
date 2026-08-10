// src/app/issues/[id]/ReaderView.tsx
// Client-only reader (loaded via next/dynamic ssr:false from page.tsx) so
// react-pdf / pdf.js never evaluate on the server.
//
// Horizontal reader: every spread is a full-width slide in a native
// scroll-snap strip. Page turns are just scrolls (touchpad swipes work
// natively, vertical two-finger scrolls are translated to slide flips), and
// slides near the viewport stay mounted/pre-rendered so a turn never waits
// on pdf.js rasterization.
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
// Slides within this distance of the current one keep their canvases mounted,
// so the next few turns in either direction are already rasterized.
const RENDER_WINDOW = 2

export default function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const [issueId, setIssueId] = useState<string | null>(null)
  const [issue, setIssue] = useState<IssueInfo | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [idx, setIdx] = useState(0) // current slide index
  const [scale, setScale] = useState(1)
  const [spread, setSpread] = useState(false)
  const [pageWidth, setPageWidth] = useState(700)
  const [aspect, setAspect] = useState(0.7) // page width / height, refined on load
  const [fullscreen, setFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const mainRef = useRef<HTMLElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const idxRef = useRef(0)
  const wheelLock = useRef(0) // timestamp of last wheel event (gesture detection)

  useEffect(() => { params.then(({ id }) => setIssueId(id)) }, [params])

  // Access gate + issue metadata. Single-issue endpoint so we don't pull the
  // whole archive list just to read one issue's title/number.
  useEffect(() => {
    if (!issueId) return
    fetch(`/api/issues/${issueId}`).then(async r => {
      if (r.status === 401) { router.push('/login?redirect=/issues/' + issueId); return }
      const data = await r.json().catch(() => ({}))
      if (!data.hasSubscription) { router.push('/clearance'); return }
      if (r.status === 404 || !data.issue) { setError('Issue not found in the archive.'); setLoading(false); return }
      setIssue(data.issue); setLoading(false)
    }).catch(() => { setError('Failed to load issue.'); setLoading(false) })
  }, [issueId, router])

  // One slide per spread (page pairs 1-2, 3-4, …) or per page on narrow screens.
  const slides = useMemo(() => {
    const out: number[][] = []
    if (spread) for (let p = 1; p <= numPages; p += 2) out.push(p + 1 <= numPages ? [p, p + 1] : [p])
    else for (let p = 1; p <= numPages; p++) out.push([p])
    return out
  }, [numPages, spread])

  // Responsive: pick spread vs single and a page width that fits BOTH the
  // strip's width and height, so a whole spread is visible with no vertical
  // scrolling at 100% zoom.
  useEffect(() => {
    const el = stripRef.current
    const update = () => {
      const w = el?.clientWidth ?? window.innerWidth
      const h = el?.clientHeight ?? window.innerHeight
      const useSpread = w >= SPREAD_MIN_WIDTH
      setSpread(useSpread)
      const availW = w - 48
      const availH = h - 32
      const perPage = useSpread ? (availW - 4) / 2 : availW
      setPageWidth(Math.max(180, Math.floor(Math.min(perPage, availH * aspect))))
      // Keep the strip parked on the current slide after the resize reflows it.
      if (el) el.scrollLeft = idxRef.current * el.clientWidth
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [loading, fullscreen, aspect])

  // When spread mode toggles the slide list changes shape — re-derive the
  // slide index from the page we were on and snap to it without animation.
  useEffect(() => {
    const firstPage = spread ? idxRef.current + 1 : idxRef.current * 2 + 1 // best-effort inverse
    const i = Math.min(spread ? Math.floor((firstPage - 1) / 2) : firstPage - 1, Math.max(0, slides.length - 1))
    idxRef.current = i
    setIdx(i)
    const el = stripRef.current
    if (el) el.scrollLeft = i * el.clientWidth
  }, [spread]) // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToSlide = useCallback((i: number, smooth = true) => {
    const el = stripRef.current
    if (!el) return
    const clamped = Math.min(Math.max(0, i), Math.max(0, slides.length - 1))
    el.scrollTo({ left: clamped * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' })
  }, [slides.length])

  const go = useCallback((dir: number) => scrollToSlide(idxRef.current + dir), [scrollToSlide])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // True browser fullscreen. State follows the fullscreenchange event so Esc
  // (or any UA exit) also restores the normal layout.
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else mainRef.current?.requestFullscreen().catch(() => setFullscreen(f => !f)) // CSS-only fallback (iOS Safari)
  }, [])
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // Track the current slide from native scroll position (covers touchpad
  // swipes, scrollbar drags, and our own smooth scrolls alike).
  const onStripScroll = useCallback(() => {
    const el = stripRef.current
    if (!el || el.clientWidth === 0) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== idxRef.current) { idxRef.current = i; setIdx(i) }
  }, [])

  // Touchpad/wheel. Horizontal deltas scroll the strip natively (snap does the
  // paging). Vertical deltas flip a slide — unless the current slide is zoomed
  // taller than the viewport, in which case they pan it first. A flick emits a
  // long momentum tail, so only the first event of a gesture (>150ms apart)
  // flips; the rest are swallowed instead of cascading into extra turns.
  useEffect(() => {
    const el = stripRef.current
    if (!el || loading || error) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return // native horizontal scroll + snap
      if (Math.abs(e.deltaY) < 4) return
      const slide = slideRefs.current[idxRef.current]
      if (slide) {
        const canScrollDown = slide.scrollTop + slide.clientHeight < slide.scrollHeight - 2
        const canScrollUp = slide.scrollTop > 2
        if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) return // pan zoomed page
      }
      e.preventDefault()
      const now = performance.now()
      const gap = now - wheelLock.current
      wheelLock.current = now
      if (gap < 150) return // momentum tail of the same gesture
      go(e.deltaY > 0 ? 1 : -1)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [loading, error, go])

  const num = issue ? String(issue.issueNumber).padStart(3, '0') : '---'
  const title = issue?.title || 'CLASSIFIED'
  const pdfUrl = issueId ? `/api/issues/${issueId}/pdf` : null

  // Memoize what react-pdf keys on so the document loads exactly ONCE and page
  // turns/zoom don't reload or re-parse it. disableStream/disableRange make
  // pdf.js do a single full fetch (our endpoint returns the whole file).
  const file = useMemo(() => (pdfUrl ? { url: pdfUrl } : null), [pdfUrl])
  const pdfOptions = useMemo(() => ({ disableStream: true, disableRange: true }), [])
  // Cap the render resolution — retina screens rasterize at devicePixelRatio 2
  // (4× the pixels), which stalls the main thread on each page turn and makes
  // flipping feel laggy. 1.5 keeps text crisp at fit-width while ~halving cost.
  const dpr = useMemo(() => (typeof window !== 'undefined' ? Math.min(1.5, window.devicePixelRatio || 1) : 1), [])
  const onDocLoad = useCallback(({ numPages }: { numPages: number }) => setNumPages(numPages), [])
  const onDocError = useCallback(() => setError('This issue could not be rendered.'), [])
  const onFirstPageLoad = useCallback((page: { originalWidth: number; originalHeight: number }) => {
    if (page.originalHeight > 0) setAspect(page.originalWidth / page.originalHeight)
  }, [])

  const renderedW = Math.round(pageWidth * scale)
  const renderedH = Math.round(renderedW / aspect)
  const curPages = slides[idx] ?? []
  const atStart = idx <= 0
  const atEnd = idx >= slides.length - 1

  const ctrlBtn: React.CSSProperties = {
    background: 'none', border: '1px solid var(--border)', color: 'var(--paper-dim)',
    cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em',
    padding: '5px 10px', textTransform: 'uppercase',
  }
  const pageFrame: React.CSSProperties = {
    boxShadow: '0 12px 48px rgba(0,0,0,0.6)', border: '1px solid var(--border)',
    background: '#fff', width: renderedW, height: renderedH, overflow: 'hidden', flex: 'none',
  }
  // Same-size white box while a canvas rasterizes (or for far-away slides) so
  // the strip never shifts layout.
  const placeholder = <div style={{ width: renderedW, height: renderedH, background: '#fff' }} />

  // In fullscreen the two control bars float over the pages (translucent, so
  // the spread underneath gets the entire viewport height).
  const overlayBar: React.CSSProperties = fullscreen
    ? { position: 'absolute', left: 0, right: 0, zIndex: 10, background: 'rgba(5,8,16,0.82)', backdropFilter: 'blur(6px)' }
    : {}

  return (
    <main ref={mainRef} style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
      {!fullscreen && <Navbar />}

      {/* Reader chrome */}
      <div className={fullscreen ? 'reader-overlay-bar' : undefined} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px', background: 'var(--bg-deep)', borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap', gap: 8,
        ...overlayBar, ...(fullscreen ? { top: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' } : {}),
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
          <button style={ctrlBtn} onClick={toggleFullscreen}>⊕ {fullscreen ? 'Exit' : 'Full'}</button>
        </div>
      </div>

      {/* Reader body: horizontal snap strip */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', background: 'linear-gradient(180deg, #050810 0%, #0a0e14 100%)' }}>
        {loading && (
          <p style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>DECRYPTING DOCUMENT…</p>
        )}

        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
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
            loading={<p style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>DECRYPTING DOCUMENT…</p>}
            error={<p style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)' }}>⚠ Failed to render this issue.</p>}
          >
            <div
              ref={stripRef}
              onScroll={onStripScroll}
              className="reader-strip"
              style={{
                position: 'absolute', inset: 0, display: 'flex',
                overflowX: 'auto', overflowY: 'hidden',
                scrollSnapType: 'x mandatory', overscrollBehaviorX: 'contain',
              }}
            >
              {slides.map((pages, i) => {
                const near = Math.abs(i - idx) <= RENDER_WINDOW
                return (
                  <div
                    key={pages[0]}
                    ref={n => { slideRefs.current[i] = n }}
                    style={{
                      flex: 'none', width: '100%', height: '100%',
                      scrollSnapAlign: 'start', scrollSnapStop: 'always',
                      overflow: 'auto', display: 'flex',
                    }}
                  >
                    {/* margin:auto centers when the spread fits and keeps its
                        edges reachable when zoomed past the viewport */}
                    <div style={{ margin: 'auto', padding: 16, display: 'flex', gap: spread ? 2 : 0 }}>
                      {pages.map(p => (
                        <div key={p} style={pageFrame}>
                          {near ? (
                            <Page
                              pageNumber={p}
                              width={renderedW}
                              devicePixelRatio={dpr}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              loading={placeholder}
                              onLoadSuccess={p === 1 ? onFirstPageLoad : undefined}
                            />
                          ) : placeholder}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Document>
        )}
      </div>

      {/* Page navigation bar */}
      {!loading && !error && numPages > 0 && (
        <div className={fullscreen ? 'reader-overlay-bar' : undefined} style={{
          background: 'var(--bg-deep)', borderTop: '1px solid var(--border)',
          padding: '10px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20,
          ...overlayBar, ...(fullscreen ? { bottom: 0, borderTop: '1px solid rgba(255,255,255,0.08)' } : {}),
        }}>
          <button style={{ ...ctrlBtn, opacity: atStart ? 0.4 : 1 }} disabled={atStart} onClick={() => go(-1)}>◀ Prev</button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--paper)' }}>
            {curPages.length === 2 ? `PAGES ${curPages[0]}–${curPages[1]}` : `PAGE ${curPages[0] ?? 1}`} / {numPages}
          </span>
          <button style={{ ...ctrlBtn, opacity: atEnd ? 0.4 : 1 }} disabled={atEnd} onClick={() => go(1)}>Next ▶</button>
        </div>
      )}
    </main>
  )
}
