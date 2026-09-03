'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Me {
  hasSubscription: boolean
}

// Auth-aware links for the homepage footer. The homepage is a static server
// component, so this small client island mirrors the Navbar: guests get
// Login/Subscribe, signed-in readers get their dossier (and the archive once
// they hold a live subscription). Same `/api/auth/me` source of truth as the
// Navbar and TierCta, and the same sessionStorage cache so a client-side
// navigation renders the right links instantly instead of flashing "Login".
export default function FooterLinks() {
  // undefined = still loading; null = logged out; object = logged in
  const [me, setMe] = useState<Me | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    try {
      const cached = sessionStorage.getItem('bc_user')
      if (cached) setMe({ hasSubscription: !!JSON.parse(cached).hasSubscription })
    } catch {}

    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (cancelled) return
        setMe(d.user ? { hasSubscription: !!d.user.hasSubscription } : null)
      })
      .catch(() => { if (!cancelled) setMe(null) })
    return () => { cancelled = true }
  }, [])

  // Loading: reserve the row but show nothing, so we never flash the wrong links.
  if (me === undefined) return <div style={{ display: 'flex', gap: '24px' }} />

  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      {me === null ? (
        <>
          <Link href="/login" className="nav-link">Login</Link>
          <Link href="/clearance" className="nav-link">Subscribe</Link>
        </>
      ) : (
        <>
          {me.hasSubscription && <Link href="/issues" className="nav-link">Issues</Link>}
          <Link href="/dashboard" className="nav-link">Dossier</Link>
        </>
      )}
    </div>
  )
}
