'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Issue {
  id: string; title: string; description: string; coverImage: string; issueNumber: number; publishedAt: string
}

const CATS = ['OPS', 'HISTORY', 'TRADECRAFT', 'COUNTERINTEL']
const TINTS = [
  'linear-gradient(160deg, #1a0a0a 0%, #0a0e14 100%)',
  'linear-gradient(160deg, #0a1628 0%, #0a0e14 100%)',
  'linear-gradient(160deg, #1a1408 0%, #0a0e14 100%)',
  'linear-gradient(160deg, #14201a 0%, #0a0e14 100%)',
  'linear-gradient(160deg, #20141a 0%, #0a0e14 100%)',
  'linear-gradient(160deg, #0a0e14 0%, #1a0a0a 100%)',
]

function FileCover({ issue, hasSubscription, isFirst }: { issue: Issue; hasSubscription: boolean; isFirst: boolean }) {
  const num = String(issue.issueNumber).padStart(3, '0')
  const cat = CATS[issue.issueNumber % CATS.length]
  const tint = TINTS[issue.issueNumber % TINTS.length]

  return (
    <div style={{ position: 'relative' }}>
      {/* Folder tab */}
      <div style={{
        position: 'absolute', top: -16, left: 24,
        background: isFirst ? 'var(--red)' : 'var(--bg-light)',
        padding: '4px 14px 6px',
        fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.28em', textTransform: 'uppercase',
        color: isFirst ? '#fff' : 'var(--paper-dim)',
        clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 100%, 0 100%)',
      }}>{cat}</div>

      <div style={{ background: tint, border: '1px solid var(--border)', aspectRatio: '3/4', padding: 16, position: 'relative', overflow: 'hidden' }}>
        {/* Cover image if available */}
        {issue.coverImage && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <img src={issue.coverImage} alt={issue.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
            <div style={{ position: 'absolute', inset: 0, background: tint, opacity: 0.7 }} />
          </div>
        )}

        {/* Corner classification */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.25em', color: 'var(--paper-dim)', position: 'relative', zIndex: 1 }}>
          <span>SECRET</span>
          <span>{new Date(issue.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}</span>
        </div>

        {/* Bottom content */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--red)', marginBottom: 6 }}>FILE №{num}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 0.92, color: 'var(--paper)', marginBottom: 12 }}>{issue.title}</div>
          {/* Barcode */}
          <div style={{ display: 'flex', gap: 1 }}>
            {Array.from({ length: 26 }).map((_, i) => (
              <span key={i} style={{ width: 1.5, height: 12, background: i % 4 === 0 ? 'var(--paper)' : 'var(--paper-mute)' }} />
            ))}
          </div>
        </div>

        {/* Big № ghost */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--font-display)', fontSize: 110, fontWeight: 800, color: 'var(--paper)', opacity: 0.04, letterSpacing: '-0.05em', pointerEvents: 'none', zIndex: 0 }}>{num}</div>

        {/* Current tag */}
        {isFirst && (
          <div style={{ position: 'absolute', top: 14, right: -6, transform: 'rotate(8deg)', zIndex: 2 }}>
            <span className="stamp red tilted">NEW</span>
          </div>
        )}

        {/* Locked overlay */}
        {!hasSubscription && !isFirst && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,12,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <div className="stamp-round" style={{ width: 72, height: 72, fontSize: '0.45rem', color: 'var(--gold)' }}>
              STN<br />CHIEF<br />ONLY
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ marginTop: 12 }}>
        {hasSubscription ? (
          <Link href={`/issues/${issue.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', fontSize: '0.7rem', padding: '9px 16px' }}>Read Issue</Link>
        ) : isFirst ? (
          <Link href={`/issues/${issue.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', fontSize: '0.7rem', padding: '9px 16px' }}>Read Issue</Link>
        ) : (
          <Link href="/clearance" className="btn-outline" style={{ display: 'block', textAlign: 'center', fontSize: '0.7rem', padding: '8px 16px' }}>Subscribe to Read</Link>
        )}
      </div>
    </div>
  )
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/issues')
      .then(r => { if (r.status === 401) { router.push('/login?redirect=/issues'); return null } return r.json() })
      .then(data => { if (data) { setIssues(data.issues); setHasSubscription(data.hasSubscription); setLoading(false) } })
      .catch(() => router.push('/login'))
  }, [router])

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>RETRIEVING FILES...</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, padding: 'clamp(40px, 6vw, 72px) clamp(16px, 4vw, 40px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.32em', color: 'var(--red)', marginBottom: 12 }}>// CLASSIFIED ARCHIVE</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 0.92, margin: 0 }}>The Vault</h1>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', marginTop: 10, fontSize: '0.88rem', maxWidth: 520, lineHeight: 1.6 }}>
                All declassified issues, indexed by file number.{hasSubscription ? ' Field Agent clearance — full archive accessible.' : ' Subscribe to unlock the full archive.'}
              </p>
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>FILTER ·</span>
              {['ALL', 'OPS', 'HISTORY', 'TRADECRAFT'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.55rem', padding: '4px 10px', background: 'transparent', cursor: 'pointer',
                  border: '1px solid ' + (filter === f ? 'var(--red)' : 'var(--border)'),
                  color: filter === f ? 'var(--paper)' : 'var(--paper-dim)',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                }}>{f}</button>
              ))}
            </div>
          </div>

          {issues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>NO ISSUES PUBLISHED YET</p>
            </div>
          ) : (
            <>
              {/* Index header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--border-red)', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--paper-dim)', textTransform: 'uppercase', marginBottom: 48 }}>
                <span>FILE</span><span>SUBJECT</span><span>DATE</span><span>STATUS</span>
              </div>

              {/* Case-file grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))', columnGap: 28, rowGap: 52 }}>
                {issues.map((issue, idx) => (
                  <FileCover key={issue.id} issue={issue} hasSubscription={hasSubscription} isFirst={idx === 0} />
                ))}
              </div>

              {/* Index table */}
              <div style={{ marginTop: 64 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--red)', letterSpacing: '0.2em' }}>// 02</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.32em', color: 'var(--paper-dim)', textTransform: 'uppercase' }}>Index</span>
                  <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                {issues.map((issue, idx) => (
                  <div key={issue.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px', gap: 16, padding: '13px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: '0.65rem', letterSpacing: '0.15em' }}>№{String(issue.issueNumber).padStart(3, '0')}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{issue.title}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>
                      {new Date(issue.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', color: (hasSubscription || idx === 0) ? 'var(--green)' : 'var(--gold)' }}>
                      {(hasSubscription || idx === 0) ? '● OPEN' : '◆ LOCKED'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
