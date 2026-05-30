'use client'
import Link from 'next/link'

// Registered legal entity name — fill in once the operating company is
// incorporated. {{LEGAL_ENTITY_NAME}} is a deliberate placeholder token; while
// it remains unfilled the public site shows the trading name only.
const LEGAL_ENTITY_NAME = '{{LEGAL_ENTITY_NAME}}'
const HAS_LEGAL_ENTITY = !LEGAL_ENTITY_NAME.includes('{{')

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

      <div style={{ maxWidth: '1100px', margin: '20px auto 0', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', lineHeight: 1.7, letterSpacing: '0.08em', color: 'var(--paper-mute)', margin: 0, maxWidth: '780px' }}>
          Briefcase Intelligence is an independent editorial and entertainment publication. It is not affiliated with, endorsed by, or connected to any government, intelligence agency, or military organization. All content is original work or commentary on matters of public record. References to classifications, clearances, and operations are stylistic and fictional unless explicitly sourced.
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', lineHeight: 1.7, letterSpacing: '0.1em', color: 'var(--paper-mute)', margin: '10px 0 0' }}>
          Operated by Briefcase Intelligence{HAS_LEGAL_ENTITY ? ` (${LEGAL_ENTITY_NAME})` : ''} · Country of operation: Georgia · Contact:{' '}
          <a href="mailto:support@briefcase.agency" style={{ color: 'var(--paper-dim)', textDecoration: 'underline' }}>support@briefcase.agency</a>
        </p>
      </div>
    </footer>
  )
}
