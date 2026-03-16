// src/app/issues/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Issue {
  id: string
  title: string
  description: string
  coverImage: string
  issueNumber: number
  publishedAt: string
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSubscription, setHasSubscription] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/issues')
      .then((r) => {
        if (r.status === 401) {
          router.push('/login?redirect=/issues')
          return null
        }
        return r.json()
      })
      .then((data) => {
        if (data) {
          setIssues(data.issues)
          setHasSubscription(data.hasSubscription)
          setLoading(false)
        }
      })
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
      <div style={{ flex: 1, padding: 'clamp(48px, 8vw, 96px) 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'clamp(40px, 8vw, 64px)', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', textTransform: 'uppercase', marginBottom: '12px' }}>
                Classified Archive
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>All Issues</h1>
            </div>
            {!hasSubscription && (
              <Link href="/subscribe" className="btn-primary">Subscribe to Read</Link>
            )}
          </div>

          {issues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>NO ISSUES PUBLISHED YET</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
              gap: 'clamp(16px, 3vw, 24px)',
            }}>
              {issues.map((issue) => (
                <div key={issue.id} className="card" style={{ overflow: 'hidden' }}>
                  {/* Cover Image */}
                  <div style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--bg-light)', overflow: 'hidden' }}>
                    {issue.coverImage ? (
                      <img
                        src={issue.coverImage}
                        alt={issue.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(232,230,225,0.2)', marginBottom: '8px' }}>ISSUE</p>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'rgba(232,230,225,0.1)' }}>
                            {String(issue.issueNumber).padStart(2, '0')}
                          </p>
                        </div>
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,17,23,0.9) 0%, transparent 50%)' }} />
                    <div style={{ position: 'absolute', bottom: '16px', left: '16px' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--red)', letterSpacing: '0.15em' }}>
                        ISSUE {String(issue.issueNumber).padStart(2, '0')}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: 'clamp(16px, 4vw, 20px)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '8px' }}>{issue.title}</h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--paper-dim)', lineHeight: 1.6, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {issue.description}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(232,230,225,0.2)', marginBottom: '16px' }}>
                      {new Date(issue.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    {hasSubscription ? (
                      <Link href={`/issues/${issue.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem' }}>
                        Read Issue
                      </Link>
                    ) : (
                      <Link href="/subscribe" className="btn-outline" style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem' }}>
                        Subscribe to Read
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
