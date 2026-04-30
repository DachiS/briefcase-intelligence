'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

interface User {
  id: string; name: string; email: string; role: string; hasSubscription: boolean
}

function useUtcTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = () => new Date().toUTCString().slice(17, 22) + ' UTC'
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), 60000)
    return () => clearInterval(id)
  }, [])
  return time
}

function NavItem({ href, num, label }: { href: string; num: string; label: string }) {
  return (
    <Link href={href}
      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.24em', color: 'var(--paper-dim)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', transition: 'color 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--paper)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--paper-dim)')}>
      <span style={{ color: 'var(--red)', fontSize: '0.5rem' }}>{num}</span>{label}
    </Link>
  )
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  const utcTime = useUtcTime()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) { setUser(d.user); setLoading(false) }
        else if (status === 'authenticated' && session?.user) {
          setUser({ id: (session.user as any).id || '', name: session.user.name || '', email: session.user.email || '', role: (session.user as any).role || 'SUBSCRIBER', hasSubscription: (session.user as any).hasSubscription || false })
          setLoading(false)
        } else if (status !== 'loading') setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session, status])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'authenticated' && session?.user && !user) {
      setUser({ id: (session.user as any).id || '', name: session.user.name || '', email: session.user.email || '', role: (session.user as any).role || 'SUBSCRIBER', hasSubscription: (session.user as any).hasSubscription || false })
      setLoading(false)
    }
    if (status === 'unauthenticated' && !user) setLoading(false)
  }, [status, session])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    await signOut({ redirect: false })
    setUser(null); setMenuOpen(false)
    router.push('/'); router.refresh()
  }

  const clearance = user?.role === 'ADMIN' ? 'DIRECTOR' : user?.hasSubscription ? 'FIELD AGT' : 'CIVILIAN'

  return (
    <header>
      <div className="classified-stripe">
        <span className="cs-dot" />
        <span style={{ flex: 1 }}>TOP SECRET // NOFORN // BRIEFCASE INTELLIGENCE IN CIRCULATION</span>
        <span className="cs-dot" />
      </div>

      <div className="opsec-bar">
        <span><span className="ok">●</span>&nbsp;SECURE</span>
        <span>UPLINK · {utcTime || '--:-- UTC'}</span>
        <span>STATION HOME</span>
        <span>CLEARANCE · {clearance}</span>
        <span className="ml">SESSION 0xA47-F19</span>
      </div>

      <nav style={{ borderBottom: '1px solid var(--border)', padding: '0 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--paper)', lineHeight: 0.9 }}>
              BRIEF<span style={{ color: 'var(--red)' }}>C</span>ASE
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.42em', color: 'var(--paper-dim)', textTransform: 'uppercase', marginTop: 2 }}>Intelligence</div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-nav">
            {!loading && (
              <>
                {user?.hasSubscription && <NavItem href="/issues" num="01" label="Issues" />}
                {user ? (
                  <>
                    <NavItem href="/dashboard" num="02" label="Dossier" />
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.24em', color: 'var(--red)', textDecoration: 'none', textTransform: 'uppercase' }}>Admin</Link>
                    )}
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.24em', color: 'var(--paper-dim)', textTransform: 'uppercase', padding: 0, transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--paper)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--paper-dim)')}>Logout</button>
                  </>
                ) : (
                  <>
                    <NavItem href="/login" num="03" label="Login" />
                    <Link href="/clearance" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.7rem' }}>Subscribe</Link>
                  </>
                )}
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'none' }} aria-label="Toggle menu">
            <div style={{ width: '22px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ display: 'block', height: '2px', background: menuOpen ? 'var(--red)' : 'var(--paper)', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
              <span style={{ display: 'block', height: '2px', background: 'var(--paper)', opacity: menuOpen ? 0 : 1, transition: 'all 0.2s' }} />
              <span style={{ display: 'block', height: '2px', background: menuOpen ? 'var(--red)' : 'var(--paper)', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
            </div>
          </button>
        </div>

        {menuOpen && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '16px 0 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {!loading && (
              <>
                {user?.hasSubscription && <Link href="/issues" className="nav-link" style={{ padding: '12px 0', display: 'block' }} onClick={() => setMenuOpen(false)}>Issues</Link>}
                {user ? (
                  <>
                    <Link href="/dashboard" className="nav-link" style={{ padding: '12px 0', display: 'block' }} onClick={() => setMenuOpen(false)}>Dossier</Link>
                    {user.role === 'ADMIN' && <Link href="/admin" className="nav-link" style={{ padding: '12px 0', display: 'block', color: 'var(--red)' }} onClick={() => setMenuOpen(false)}>Admin</Link>}
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
