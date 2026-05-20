import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '32px 24px',
      marginTop: 'auto',
      background: 'var(--bg)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--paper-dim)', textTransform: 'uppercase' }}>
          © {new Date().getFullYear()} Briefcase Intelligence · All rights reserved
        </span>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {[
            { href: '/privacy', label: 'Privacy Policy' },
            { href: '/terms',   label: 'Terms of Service' },
            { href: '/refund',  label: 'Refund Policy' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                letterSpacing: '0.24em',
                color: 'var(--paper-dim)',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--paper)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--paper-dim)')}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
