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
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setUser(d.user)
          setLoading(false)
        } else if (status === 'authenticated' && session?.user) {
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
    await fetch('/api/auth/logout', { method: 'POST' })
    await signOut({ redirect: false })
    setUser(null)
    setMenuOpen(false)
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
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className="logo-text">
              BRIEF<span className="case-c" style={{ color: 'var(--red)' }}>C</span>ASE
            </div>
            <div className="logo-sub">Intelligence</div>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-nav">
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'none' }}
            aria-label="Toggle menu"
          >
            <div style={{ width: '22px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ display: 'block', height: '2px', background: menuOpen ? 'var(--red)' : 'var(--paper)', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
              <span style={{ display: 'block', height: '2px', background: 'var(--paper)', transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: 'block', height: '2px', background: menuOpen ? 'var(--red)' : 'var(--paper)', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            borderTop: '1px solid var(--border)',
            padding: '16px 0 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            {!loading && (
              <>
                {user?.hasSubscription && (
                  <Link href="/issues" className="nav-link" style={{ padding: '12px 0', display: 'block' }} onClick={() => setMenuOpen(false)}>Issues</Link>
                )}
                {user ? (
                  <>
                    <Link href="/dashboard" className="nav-link" style={{ padding: '12px 0', display: 'block' }} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className="nav-link" style={{ padding: '12px 0', display: 'block', color: 'var(--red)' }} onClick={() => setMenuOpen(false)}>Admin</Link>
                    )}
                    <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px 0', textAlign: 'left' }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="nav-link" style={{ padding: '12px 0', display: 'block' }} onClick={() => setMenuOpen(false)}>Login</Link>
                    <Link href="/clearance" className="btn-primary" style={{ marginTop: '8px', display: 'block', textAlign: 'center' }} onClick={() => setMenuOpen(false)}>Subscribe</Link>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 641px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  )
}
