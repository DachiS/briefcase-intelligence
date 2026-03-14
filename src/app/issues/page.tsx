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
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-xs text-paper/30 tracking-widest animate-pulse">
            RETRIEVING FILES...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="font-mono text-xs tracking-widest text-paper/30 uppercase mb-4">
                Classified Archive
              </p>
              <h1 className="font-display text-5xl">All Issues</h1>
            </div>
            {!hasSubscription && (
              <Link href="/subscribe" className="btn-primary">
                Subscribe to Read
              </Link>
            )}
          </div>

          {issues.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-mono text-xs text-paper/30">NO ISSUES PUBLISHED YET</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <div key={issue.id} className="card group">
                  {/* Cover Image */}
                  <div className="relative aspect-[3/4] bg-ink-50 overflow-hidden">
                    {issue.coverImage ? (
                      <img
                        src={issue.coverImage}
                        alt={issue.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <p className="font-mono text-xs text-paper/20 mb-2">ISSUE</p>
                          <p className="font-display text-6xl text-paper/10">
                            {String(issue.issueNumber).padStart(2, '0')}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <p className="font-mono text-xs text-red-spy">
                        ISSUE {String(issue.issueNumber).padStart(2, '0')}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-display text-lg mb-2">{issue.title}</h3>
                    <p className="font-body text-sm text-paper/50 leading-relaxed mb-4 line-clamp-2">
                      {issue.description}
                    </p>
                    <p className="font-mono text-xs text-paper/20 mb-4">
                      {new Date(issue.publishedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>

                    {hasSubscription ? (
                      <Link
                        href={`/issues/${issue.id}`}
                        className="btn-primary w-full text-center block text-xs"
                      >
                        Read Issue
                      </Link>
                    ) : (
                      <Link
                        href="/subscribe"
                        className="btn-secondary w-full text-center block text-xs"
                      >
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
