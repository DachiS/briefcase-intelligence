'use client'
import Navbar from '@/components/Navbar'

const LAST_UPDATED = 'May 18, 2026'

const sections = [
  {
    id: '01',
    title: 'Digital Product Policy',
    content: `Briefcase Intelligence delivers digital content (issues, archive access, PDF downloads) that is made immediately available upon subscription activation. As such, all sales are generally final. We do not offer refunds for digital content that has already been accessed or downloaded.`
  },
  {
    id: '02',
    title: 'Eligibility for Refund',
    content: `You may be eligible for a refund in the following circumstances:\n\n◆ You were charged but did not receive access to the Service due to a technical failure on our end.\n\n◆ You were charged twice for the same billing period due to a payment processing error.\n\n◆ You request a refund within 48 hours of your initial subscription charge and have not accessed any paid content.\n\nRequests outside these conditions are evaluated on a case-by-case basis at our discretion.`
  },
  {
    id: '03',
    title: 'Monthly Subscriptions',
    content: `Monthly Field Agent subscriptions ($19.99/month) are billed at the start of each billing cycle. We do not provide prorated refunds for cancellations made mid-cycle. Upon cancellation, your access continues until the end of the current paid period, after which your account reverts to the free Analyst tier.`
  },
  {
    id: '04',
    title: 'Annual Subscriptions',
    content: `Annual Station Chief subscriptions ($99.99/year) may be eligible for a prorated refund within 14 days of the billing date, provided fewer than 2 monthly issues have been released since your charge. After 14 days, or after 2 or more issues have been released in your billing period, no refund will be issued. The prorated amount is calculated based on unused full months remaining.`
  },
  {
    id: '05',
    title: 'How to Request a Refund',
    content: `To request a refund, contact us at support@briefcase.agency with the subject line "REFUND REQUEST" and include:\n\n◆ The email address associated with your account.\n◆ The date of the charge.\n◆ A brief description of the reason for your request.\n\nWe will respond within 3 business days. Approved refunds are processed back to your original payment method and may take 5–10 business days to appear depending on your bank or card provider.`
  },
  {
    id: '06',
    title: 'Chargebacks',
    content: `If you initiate a chargeback with your bank or card provider without first contacting us, we reserve the right to permanently suspend your account. We encourage you to reach out to us directly — most issues can be resolved quickly and without escalation.`
  },
  {
    id: '07',
    title: 'Free Tier',
    content: `The Analyst (free) tier requires no payment and is therefore not subject to refund considerations. No credit card is required to maintain a free account.`
  },
  {
    id: '08',
    title: 'Changes to This Policy',
    content: `We reserve the right to modify this Refund Policy at any time. Material changes will be communicated via email or a notice on the Service. The updated policy applies to charges made after the effective date of the change.`
  },
  {
    id: '09',
    title: 'Contact',
    content: `For refund requests or billing questions:\n\nBriefcase Intelligence\nwww.briefcase.agency\nsupport@briefcase.agency\n\nOperating hours: Monday – Friday, 09:00 – 18:00 GMT+4`
  },
]

export default function RefundPage() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <section className="bg-radial-noir" style={{ padding: 'clamp(48px, 8vw, 72px) 24px 56px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span style={{ width: 28, height: 1, background: 'var(--red)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.4em', color: 'var(--red)' }}>// BILLING · PROTOCOL</span>
          <span style={{ width: 28, height: 1, background: 'var(--red)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 8vw, 4rem)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 0.92, margin: 0, marginBottom: 16 }}>Refund Policy</h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--paper-2)', maxWidth: 480, margin: '0 auto 10px', fontStyle: 'italic' }}>
          "Every mission has an exit. So does every subscription."
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
            DOC REF: BI-LEGAL-RFND-2026
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--green)' }}>CANCEL ANY TIME</span>
          </div>
        </div>

        {/* Quick summary box */}
        <div style={{ padding: '20px 24px', border: '1px solid var(--border-red)', marginBottom: 32, background: 'rgba(180,20,20,0.05)', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.3em', color: 'var(--red)', marginBottom: 10 }}>// QUICK SUMMARY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Monthly plan', value: 'Cancel anytime · access until period ends · no proration' },
              { label: 'Annual plan', value: 'Refund eligible within 14 days if fewer than 2 issues released' },
              { label: 'Technical errors', value: 'Full refund · always' },
              { label: 'Double charge', value: 'Full refund of duplicate · always' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', paddingTop: 1 }}>◆</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--paper-2)', letterSpacing: '0.08em' }}>
                  <span style={{ color: 'var(--paper)' }}>{row.label}:</span> {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sections.map((section) => (
            <div key={section.id} className="card-base" style={{ padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'var(--paper-mute)', opacity: 0.6 }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.32em', color: 'var(--paper-dim)', minWidth: 24 }}>§{section.id}</span>
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
            <span style={{ color: 'var(--green)' }}>● FAIR POLICY</span>
            <span>·</span>
            <span>BRIEFCASE INTELLIGENCE</span>
            <span>·</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
