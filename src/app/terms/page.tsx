'use client'
import Navbar from '@/components/Navbar'
import { FIELD_AGENT_MONTHLY, STATION_CHIEF_ANNUAL } from '@/lib/pricing'

const LAST_UPDATED = 'May 18, 2026'
const EFFECTIVE_DATE = 'May 18, 2026'

const sections = [
  {
    id: '01',
    title: 'Acceptance of Terms',
    content: `By accessing or using Briefcase Intelligence ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service. These terms apply to all visitors, subscribers, and users of the Service.`
  },
  {
    id: '02',
    title: 'Description of Service',
    content: `Briefcase Intelligence is a digital subscription publication delivering intelligence-themed editorial content. The Service provides access to monthly digital issues, an archive, and associated content through a web-based reader and downloadable PDF formats, depending on your subscription tier.`
  },
  {
    id: '03',
    title: 'Subscription Tiers & Billing',
    content: `The Service offers the following access tiers:\n\n◆ ANALYST — Free tier. One sample issue per quarter, browser access only.\n\n◆ FIELD AGENT — ${FIELD_AGENT_MONTHLY}/month. Full monthly issue access, 12-month archive, PDF download, and encrypted reader.\n\n◆ STATION CHIEF — ${STATION_CHIEF_ANNUAL}/year. All Field Agent benefits plus complete archive, Chief-only briefs, and priority inbox.\n\nSubscriptions are billed in advance on a recurring basis (monthly or annually). You authorize us to charge your payment method automatically at the start of each billing cycle. All fees are non-refundable except as described in our Refund Policy.`
  },
  {
    id: '04',
    title: 'Account Registration',
    content: `To access paid features, you must create an account and provide accurate, complete information. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. You must be at least 18 years of age to create an account. You agree to notify us immediately of any unauthorized use of your account.`
  },
  {
    id: '05',
    title: 'Cancellation',
    content: `You may cancel your subscription at any time from your account settings. Upon cancellation, your access continues until the end of the current billing period. No partial refunds are issued for unused portions of a billing period. Following cancellation, your account reverts to the Analyst (free) tier.`
  },
  {
    id: '06',
    title: 'Intellectual Property',
    content: `All content published by Briefcase Intelligence — including articles, design, graphics, layouts, and editorial material — is the exclusive property of Briefcase Intelligence and protected by applicable copyright laws. Subscribers are granted a limited, non-transferable, non-exclusive license to access and read content for personal, non-commercial use only. Reproduction, redistribution, or resale of any content is strictly prohibited without prior written consent.`
  },
  {
    id: '07',
    title: 'Prohibited Conduct',
    content: `You agree not to: share account credentials or subscription access with others; scrape, crawl, or systematically download content; reverse-engineer, decompile, or attempt to extract source code; use the Service for any unlawful purpose; impersonate any person or entity; or interfere with the security or integrity of the Service. Violations may result in immediate account termination without refund.`
  },
  {
    id: '08',
    title: 'Limitation of Liability',
    content: `To the fullest extent permitted by law, Briefcase Intelligence shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability to you for any claim shall not exceed the amount you paid us in the twelve months preceding the claim.`
  },
  {
    id: '09',
    title: 'Modifications to Service',
    content: `We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time. We will provide reasonable notice of material changes where possible. Continued use of the Service after changes constitutes acceptance of the updated terms.`
  },
  {
    id: '10',
    title: 'Governing Law',
    content: `These Terms are governed by and construed in accordance with the laws of Georgia (country). Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Georgia.`
  },
  {
    id: '11',
    title: 'Contact',
    content: `For questions regarding these Terms, contact us at:\n\nBriefcase Intelligence\nwww.briefcase.agency\nsupport@briefcase.agency`
  },
]

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <section className="bg-radial-noir" style={{ padding: 'clamp(48px, 8vw, 72px) 24px 56px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span style={{ width: 28, height: 1, background: 'var(--red)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.4em', color: 'var(--red)' }}>// LEGAL · CLASSIFIED</span>
          <span style={{ width: 28, height: 1, background: 'var(--red)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 8vw, 4rem)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 0.92, margin: 0, marginBottom: 16 }}>Terms of Service</h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--paper-2)', maxWidth: 480, margin: '0 auto 10px', fontStyle: 'italic' }}>
          "Every operative agrees to the rules before entering the field."
        </p>
        <div style={{ display: 'inline-flex', gap: 32, marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.24em', color: 'var(--paper-dim)' }}>
          <span>EFFECTIVE: {EFFECTIVE_DATE}</span>
          <span style={{ color: 'var(--paper-mute)' }}>·</span>
          <span>LAST UPDATED: {LAST_UPDATED}</span>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(32px, 6vw, 56px) clamp(16px, 4vw, 40px)' }}>

        {/* Dossier header stamp */}
        <div className="card-base" style={{ padding: '16px 24px', marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--paper-dim)' }}>
            DOC REF: BI-LEGAL-TOS-2026
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--red)' }}>BINDING AGREEMENT</span>
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sections.map((section) => (
            <div key={section.id} className="card-base" style={{ padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
              {/* Section number accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'var(--red)', opacity: 0.4 }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.32em', color: 'var(--red)', minWidth: 24 }}>§{section.id}</span>
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
            <span style={{ color: 'var(--red)' }}>◆ BRIEFCASE INTELLIGENCE</span>
            <span>·</span>
            <span>ALL RIGHTS RESERVED</span>
            <span>·</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
