// src/app/issues/[id]/page.tsx
'use client'
import dynamic from 'next/dynamic'

// react-pdf / pdf.js reference browser-only globals (DOMMatrix, etc.) at import
// time, which throw during server-side rendering. Load the reader client-only.
const ReaderView = dynamic(() => import('./ReaderView'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>DECRYPTING DOCUMENT…</p>
    </div>
  ),
})

export default function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  return <ReaderView params={params} />
}
