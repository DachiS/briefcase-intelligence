// src/app/admin/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface Issue {
  id: string
  title: string
  issueNumber: number
  isPublished: boolean
  publishedAt: string
}

export default function AdminPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    description: '',
    issueNumber: '',
    publishedAt: '',
    isPublished: false,
  })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || data.user.role !== 'ADMIN') {
          router.push('/')
          return
        }
        return fetch('/api/admin/issues').then((r) => r.json())
      })
      .then((data) => {
        if (data?.issues) {
          setIssues(data.issues)
          setLoading(false)
        }
      })
      .catch(() => router.push('/'))
  }, [router])

  const uploadFile = async (file: File, type: 'pdf' | 'cover', issueNumber: number) => {
    const ext = file.name.split('.').pop()
    const res = await fetch('/api/admin/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, issueNumber, extension: ext }),
    })
    const { uploadUrl, key } = await res.json()

    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })

    return key
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will permanently remove the PDF from S3.`)) return

    const res = await fetch(`/api/admin/issues/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setIssues(prev => prev.filter(i => i.id !== id))
      setMessage('Issue deleted successfully.')
    } else {
      const data = await res.json()
      setMessage(`Error: ${data.error}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pdfFile) return

    setUploading(true)
    setMessage('')

    try {
      const issueNum = Number(form.issueNumber)

      // Upload PDF
      const pdfKey = await uploadFile(pdfFile, 'pdf', issueNum)

      // Upload cover if provided
      let coverImage = ''
      if (coverFile) {
        const coverKey = await uploadFile(coverFile, 'cover', issueNum)
        // Construct public URL for cover (cover images can be public)
        coverImage = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${coverKey}`
      }

      // Create issue in DB
      const res = await fetch('/api/admin/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          issueNumber: issueNum,
          publishedAt: form.publishedAt || new Date().toISOString(),
          isPublished: form.isPublished,
          pdfKey,
          coverImage,
        }),
      })

      if (res.ok) {
        setMessage('Issue created successfully!')
        setForm({ title: '', description: '', issueNumber: '', publishedAt: '', isPublished: false })
        setPdfFile(null)
        setCoverFile(null)
        // Refresh list
        const data = await fetch('/api/admin/issues').then((r) => r.json())
        setIssues(data.issues)
      } else {
        const data = await res.json()
        setMessage(`Error: ${data.error}`)
      }
    } catch (err) {
      setMessage('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-xs text-paper/30 animate-pulse">LOADING...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-gold-light uppercase mb-4">
            Director Access
          </p>
          <h1 className="font-display text-4xl mb-16">Admin Panel</h1>

          {/* Upload Form */}
          <div className="card p-8 mb-12">
            <h2 className="font-mono text-xs tracking-widest text-paper/30 uppercase mb-8">
              Publish New Issue
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="font-mono text-xs text-paper/40 uppercase tracking-widest block mb-2">
                    Issue Title
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="June 2025 Issue"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-paper/40 uppercase tracking-widest block mb-2">
                    Issue Number
                  </label>
                  <input
                    type="number"
                    required
                    className="input-field"
                    placeholder="1"
                    value={form.issueNumber}
                    onChange={(e) => setForm({ ...form, issueNumber: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-xs text-paper/40 uppercase tracking-widest block mb-2">
                  Description
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Brief description of this issue..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="font-mono text-xs text-paper/40 uppercase tracking-widest block mb-2">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.publishedAt}
                    onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                  />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-red-spy"
                      checked={form.isPublished}
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    />
                    <span className="font-mono text-xs text-paper/40 uppercase tracking-widest">
                      Publish immediately
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="font-mono text-xs text-paper/40 uppercase tracking-widest block mb-2">
                    PDF File *
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    className="font-mono text-xs text-paper/60 w-full cursor-pointer"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-paper/40 uppercase tracking-widest block mb-2">
                    Cover Image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="font-mono text-xs text-paper/60 w-full cursor-pointer"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {message && (
                <p
                  className={`font-mono text-xs px-4 py-3 border ${
                    message.startsWith('Error')
                      ? 'text-red-spy border-red-spy/30'
                      : 'text-green-400 border-green-400/30'
                  }`}
                >
                  {message}
                </p>
              )}

              <button type="submit" disabled={uploading} className="btn-primary">
                {uploading ? 'Uploading...' : 'Upload & Publish'}
              </button>
            </form>
          </div>

          {/* Issues List */}
          <div className="card p-8">
            <h2 className="font-mono text-xs tracking-widest text-paper/30 uppercase mb-8">
              All Issues ({issues.length})
            </h2>

            {issues.length === 0 ? (
              <p className="font-mono text-xs text-paper/20">No issues yet.</p>
            ) : (
              <div className="space-y-3">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px' }}
                  >
                    <div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
                        #{issue.issueNumber} — {issue.title}
                      </p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', marginTop: '4px' }}>
                        {new Date(issue.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '3px 8px', border: `1px solid ${issue.isPublished ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`, color: issue.isPublished ? '#4ade80' : 'var(--paper-dim)' }}>
                        {issue.isPublished ? 'LIVE' : 'DRAFT'}
                      </span>
                      <button
                        onClick={() => handleDelete(issue.id, issue.title)}
                        style={{ background: 'none', border: '1px solid var(--border-red)', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.15em', padding: '3px 10px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--red-dim)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
