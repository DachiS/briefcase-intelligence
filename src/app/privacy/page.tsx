'use client'
import Navbar from '@/components/Navbar'

const LAST_UPDATED = 'May 18, 2026'

const sections = [
  {
    id: '01',
    title: 'Information We Collect',
    content: `We collect information you provide directly to us, including:\n\n◆ Account information — name, email address, and password when you register.\n\n◆ Payment information — processed securely by our payment provider (Paddle). We do not store card numbers or full payment details on our servers.\n\n◆ Usage data — pages visited, issues read, features used, and time spent on the Service.\n\n◆ Device information — browser type, operating system, IP address, and referring URLs.\n\n◆ Communications — messages you send us via email or support channels.`
  },
  {
    id: '02',
    title: 'How We Use Your Information',
    content: `We use the information we collect to:\n\n◆ Provide, maintain, and improve the Service.\n◆ Process subscriptions and send billing confirmations.\n◆ Send issue release notifications and Service updates.\n◆ Respond to your comments and support requests.\n◆ Monitor and analyze usage patterns to improve the Service.\n◆ Detect and prevent fraudulent or unauthorized activity.\n◆ Comply with legal obligations.`
  },
  {
    id: '03',
    title: 'Information Sharing',
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information with:\n\n◆ Payment processors (Paddle) — to process subscription payments securely.\n◆ Authentication providers (Google OAuth) — if you sign in via Google.\n◆ Analytics providers — in anonymized or aggregated form only.\n◆ Law enforcement — only when required by law or to protect our legal rights.\n\nAll third-party providers are contractually obligated to keep your data confidential and use it only for the purposes we specify.`
  },
  {
    id: '04',
    title: 'Cookies & Tracking',
    content: `We use cookies and similar technologies to maintain your session, remember your preferences, and analyze Service usage. You may disable cookies through your browser settings, though some features of the Service may not function properly without them. We do not use third-party advertising cookies.`
  },
  {
    id: '05',
    title: 'Data Retention',
    content: `We retain your account information for as long as your account is active or as needed to provide you the Service. If you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law or for legitimate business purposes such as fraud prevention.`
  },
  {
    id: '06',
    title: 'Data Security',
    content: `We implement industry-standard security measures including HTTPS encryption, hashed passwords, and access controls to protect your information. However, no method of transmission over the internet is completely secure. We cannot guarantee absolute security, and you use the Service at your own risk.`
  },
  {
    id: '07',
    title: 'Your Rights',
    content: `You have the right to:\n\n◆ Access the personal data we hold about you.\n◆ Request correction of inaccurate data.\n◆ Request deletion of your account and associated data.\n◆ Opt out of non-essential communications at any time.\n◆ Export your data in a portable format.\n\nTo exercise these rights, contact us at support@briefcase.agency.`
  },
  {
    id: '08',
    title: 'Children\'s Privacy',
    content: `The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal information, we will delete it promptly.`
  },
  {
    id: '09',
    title: 'International Transfers',
    content: `Briefcase Intelligence operates from Georgia (country). If you are accessing the Service from outside Georgia, your information may be transferred to and processed in Georgia or other countries where our service providers operate. By using the Service, you consent to such transfers.`
  },
  {
    id: '10',
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy periodically. We will notify you of significant changes via email or a prominent notice on the Service. The date at the top of this page indicates when the policy was last revised. Continued use of the Service after changes constitutes acceptance.`
  },
  {
    id: '11',
    title: 'Contact',
    content: `For privacy inquiries or data requests, contact:\n\nBriefcase Intelligence\nwww.briefcase.agency\nsupport@briefcase.agency`
  },
]

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <section className="bg-radial-noir" style={{ padding: 'clamp(48px, 8vw, 72px) 24px 56px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span style={{ width: 28, height: 1, background: 'var(--red)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.4em', color: 'var(--red)' }}>// CONFIDENTIAL · DATA</span>
          <span style={{ width: 28, height: 1, background: 'var(--red)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 8vw, 4rem)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 0.92, margin: 0, marginBottom: 16 }}>Privacy Policy</h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--paper-2)', maxWidth: 480, margin: '0 auto 10px', fontStyle: 'italic' }}>
          "Your data is your cover. We protect both."
        </p>
        <div style={{ display: 'inline-flex', gap: 32, marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.24em', color: 'var(--paper-dim)' }}>
          <span>LAST UPDATED: {LAST_UPDATED}</span>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(32px, 6vw, 56px) clamp(16px, 4vw, 40px)' }}>

        {/* Dossier header */}
        <div className="card-base" style={{ padding: '16px 24px', marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--paper-dim)' }}>
            DOC REF: BI-LEGAL-PRIV-2026
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--gold)' }}>NO DATA SOLD · EVER</span>
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sections.map((section) => (
            <div key={section.id} className="card-base" style={{ padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'var(--gold)', opacity: 0.4 }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.32em', color: 'var(--gold)', minWidth: 24 }}>§{section.id}</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0, color: 'var(--paper)' }}>{section.title}</h2>
              </div>
              <div style={{ height: 1, background: 'repeating-linear-gradient(90deg, var(--paper-mute) 0 4px, transparent 4px 8px)', marginBottom: 16, marginLeft: 38 }} />
              {section.content.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--paper-2)', lineHeight: 1.75, margin: 0, marginBottom: i < section.content.split('\n\n').length - 1 ? 12 : 0, marginLeft: 38 }}>{para}</p>
              ))}
            </div>
          ))}
        </div>

        {/* Footer stamp */}
        <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '12px 24px', border: '1px dashed var(--paper-mute)', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.24em', color: 'var(--paper-dim)' }}>
            <span style={{ color: 'var(--gold)' }}>◆ BRIEFCASE INTELLIGENCE</span>
            <span>·</span>
            <span>YOUR DATA IS SAFE</span>
            <span>·</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
