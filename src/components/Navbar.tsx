// src/components/Navbar.tsx
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

interface User {
  id: string; name: string; email: string; role: string; hasSubscription: boolean
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    // Check custom JWT auth first
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setUser(d.user)
          setLoading(false)
        } else if (status === 'authenticated' && session?.user) {
          // Fall back to Google/NextAuth session
          setUser({
            id: (session.user as any).id || '',
            name: session.user.name || '',
            email: session.user.email || '',
            role: (session.user as any).role || 'SUBSCRIBER',
            hasSubscription: (session.user as any).hasSubscription || false,
          })
          setLoading(false)
        } else if (status !== 'loading') {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [session, status])

  // Also update when NextAuth session changes
  useEffect(() => {
    if (status === 'loading') return
    if (status === 'authenticated' && session?.user && !user) {
      setUser({
        id: (session.user as any).id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        role: (session.user as any).role || 'SUBSCRIBER',
        hasSubscription: (session.user as any).hasSubscription || false,
      })
      setLoading(false)
    }
    if (status === 'unauthenticated' && !user) {
      setLoading(false)
    }
  }, [status, session])

  const handleLogout = async () => {
    // Sign out from both systems
    await fetch('/api/auth/logout', { method: 'POST' })
    await signOut({ redirect: false })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header>
      {/* Top ticker */}
      <div className="ticker-bar">
        ◆ &nbsp; Exclusive Intelligence Insights &nbsp; ◆ &nbsp; Classified Operations &nbsp; ◆ &nbsp; Tradecraft &amp; Analysis &nbsp; ◆
      </div>

      {/* Main nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className="logo-text">
              BRIEF<span className="case-c" style={{ color: 'var(--red)' }}>C</span>ASE
            </div>
            <div className="logo-sub">Intelligence</div>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {!loading && (
              <>
                {user?.hasSubscription && <Link href="/issues" className="nav-link">Issues</Link>}
                {user ? (
                  <>
                    <Link href="/dashboard" className="nav-link">Dashboard</Link>
                    {user.role === 'ADMIN' && <Link href="/admin" className="nav-link" style={{ color: 'var(--red)' }}>Admin</Link>}
                    <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="nav-link">Login</Link>
                    <Link href="/clearance" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.7rem' }}>Subscribe</Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
