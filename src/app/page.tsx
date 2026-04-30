// src/app/page.tsx
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import SpyGlobe from '@/components/SpyGlobe'

const articles = [
  { num: '01', category: 'Latest News',            title: 'Missing Russian Businessman',  desc: 'The mysterious disappearance of prominent oligarch Dmitri Volkov raises questions that reach far beyond a missing persons case.' },
  { num: '02', category: 'History of Intelligence', title: 'Born of Spies',                desc: 'From informants to agencies — the evolution of state intelligence from ancient Persia to Cold War Vienna.' },
  { num: '03', category: 'Operations',              title: "Mossad's Christmas Heist",     desc: 'Five missile boats, a French arms embargo, and the Cherbourg Operation.' },
  { num: '04', category: 'Exclusive Tricks',        title: 'How to Tell a Lie',            desc: 'Cover stories, legend-building, microexpression control, and the art of the convincing half-truth.' },
  { num: '05', category: 'Tradecraft',              title: "What's What",                  desc: "Dead drops, brush passes, cut-outs, honey traps — a practical glossary." },
]

const marqueeItems = ['Tradecraft Updated', 'New Drop · Issue 002 in Production', 'Cipher Key Verified', 'Watchlist · 17 New Entries', 'Clearance Granted', 'Vienna Station Online']

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO */}
      <section className="bg-radial-noir tex-grid" style={{ position: 'relative', padding: 'clamp(56px, 8vw, 80px) clamp(16px, 4vw, 40px) clamp(56px, 8vw, 80px)', overflow: 'hidden' }}>

        {/* Globe background */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(900px, 100vw)', height: 'min(900px, 100vw)', pointerEvents: 'none', opacity: 0.85, mixBlendMode: 'screen', zIndex: 0 }}>
          <SpyGlobe width={900} height={900} />
        </div>

        {/* Vignette over globe */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(10,14,20,0.15) 0%, rgba(10,14,20,0.55) 55%, rgba(10,14,20,0.88) 100%)', pointerEvents: 'none', zIndex: 1 }} />

        {/* Top-right coordinates */}
        <div style={{ position: 'absolute', top: 24, right: 40, fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.2em', color: 'var(--paper-mute)', textAlign: 'right', zIndex: 2, display: 'none' }} className="coords-panel">
          <div style={{ color: 'var(--red)' }}>◆ LIVE FEED</div>
          <div style={{ marginTop: 4 }}>LAT 48.2082° N</div>
          <div>LON 16.3738° E</div>
          <div style={{ marginTop: 4, color: 'var(--gold)' }}>VIENNA · 04:26</div>
        </div>

        {/* Crosshair */}
        <svg width="100" height="100" style={{ position: 'absolute', bottom: 32, right: 48, opacity: 0.22, zIndex: 2 }}>
          <circle cx="50" cy="50" r="48" fill="none" stroke="var(--red)" strokeWidth="1" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="var(--red)" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="var(--red)" strokeWidth="0.5" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="var(--red)" strokeWidth="0.5" />
        </svg>

        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(32px, 5vw, 56px)', alignItems: 'center', position: 'relative', zIndex: 2 }}>

          {/* LEFT: Hero text */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span className="stamp red">DECLASSIFIED · 02/2026</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>VOL.1 · ISS.001</span>
            </div>

            <h1 className="anim-fade-up delay-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 12vw, 6rem)', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 0.88, margin: 0, marginBottom: 6 }}>
              BRIEF<span style={{ color: 'var(--red)' }}>C</span>ASE
            </h1>
            <div className="anim-fade-up delay-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.6em', color: 'var(--paper-dim)', textTransform: 'uppercase', marginBottom: 24 }}>
              — Intelligence —
            </div>

            <p className="anim-fade-up delay-3" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--paper-2)', maxWidth: 460, lineHeight: 1.55, margin: 0, marginBottom: 10, fontStyle: 'italic' }}>
              "The premier journal of the intelligence world."
            </p>
            <p className="anim-fade-up delay-3" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: 'var(--paper-dim)', maxWidth: 460, lineHeight: 1.7, marginBottom: 32 }}>
              Declassified operations, insider tradecraft, and the stories that never made the headlines. Read it before they redact it.
            </p>

            <div className="anim-fade-up delay-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/clearance" className="btn-primary">► Begin Clearance</Link>
              <Link href="/login" className="btn-outline">View Current Issue</Link>
            </div>

            {/* Trust strip */}
            <div className="anim-fade-up delay-5" style={{ display: 'flex', gap: 'clamp(16px, 4vw, 32px)', marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
              {[['12,400+', 'Active operatives'], ['72', 'Declassified ops'], ['$9.99', 'Per month']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 800, color: 'var(--paper)' }}>{n}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: 'var(--paper-dim)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Cover mock */}
          <div style={{ position: 'relative', transform: 'rotate(2.5deg)', maxWidth: 320, margin: '0 auto' }}>
            <div style={{ background: 'linear-gradient(170deg, #14202e 0%, #0a0e14 60%, #1a0a0a 100%)', border: '1px solid var(--border-red)', aspectRatio: '3/4', padding: 20, position: 'relative', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(204,26,46,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div style={{ background: 'var(--red)', padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.28em', color: '#fff' }}>ISSUE 001</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.25em', color: 'var(--paper-dim)', textAlign: 'right', lineHeight: 1.4 }}>FEB<br />2026</div>
              </div>

              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--paper)', lineHeight: 0.9 }}>BRIEF<span style={{ color: 'var(--red)' }}>C</span>ASE</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.45rem', letterSpacing: '0.4em', color: 'var(--paper-dim)', marginTop: 4, marginBottom: 20 }}>INTELLIGENCE</div>

              {[['Missing', 'Russian Businessman'], ["Mossad's", 'Christmas Heist'], ['How to', 'Tell a Lie']].map(([k, h], i) => (
                <div key={i} style={{ marginBottom: 14, paddingLeft: 10, borderLeft: '2px solid var(--red)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>{k.toUpperCase()}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--red)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</div>
                </div>
              ))}

              {/* Barcode */}
              <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: 1 }}>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <span key={i} style={{ width: 1.5, height: 18, background: i % 3 === 0 ? 'var(--paper)' : 'var(--paper-dim)' }} />
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.45rem', color: 'var(--paper-dim)' }}>9.99 USD</div>
              </div>

              {/* Big № behind */}
              <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--font-display)', fontSize: 120, fontWeight: 800, color: 'var(--paper)', opacity: 0.035, letterSpacing: '-0.05em', pointerEvents: 'none' }}>001</div>
            </div>

            {/* EYES ONLY stamp */}
            <div style={{ position: 'absolute', top: -16, right: -24, transform: 'rotate(12deg)', color: 'var(--red)' }}>
              <div className="stamp-round" style={{ width: 72, height: 72, fontSize: '0.45rem', color: 'var(--red)' }}>
                EYES<br />ONLY<br />•
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((t, i) => <span key={i}>◆ {t}</span>)}
        </div>
      </div>

      {/* CURRENT ISSUE — table of contents */}
      <section style={{ padding: 'clamp(48px, 8vw, 72px) clamp(16px, 4vw, 40px)', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--red)', letterSpacing: '0.2em' }}>// 02</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.32em', color: 'var(--paper-dim)', textTransform: 'uppercase' }}>Inside this issue · February 2026</span>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'clamp(32px, 5vw, 48px)' }}>

          {/* Featured article */}
          <article className="card-base" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, #1a0a0a 0%, #0a1628 100%)', position: 'relative', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--paper-mute)', fontSize: '0.62rem', letterSpacing: '0.3em' }}>[SURVEILLANCE PHOTO 01]</span>
              <div style={{ position: 'absolute', top: 10, left: 10 }}>
                <span className="stamp red">FEATURED</span>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', marginBottom: 8 }}>FILE 01 · LATEST NEWS</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 0.92, margin: 0, marginBottom: 10 }}>Missing Russian Businessman</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--paper-dim)', lineHeight: 1.6, margin: 0 }}>
              The mysterious disappearance of prominent oligarch <span className="redact" style={{ width: 110 }}>Dmitri Volkov</span> raises
              questions that reach far beyond a missing persons case.
            </p>
          </article>

          {/* Article list */}
          <div>
            {articles.slice(1).map(a => (
              <div key={a.num} style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--border)', alignItems: 'start' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)', paddingTop: 4 }}>// {a.num}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--paper-dim)', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 4 }}>{a.category}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 0.92, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--paper-dim)', lineHeight: 1.6 }}>{a.desc}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--paper-mute)', paddingTop: 6, letterSpacing: '0.2em', whiteSpace: 'nowrap' }}>14 MIN</span>
              </div>
            ))}

            <div style={{ marginTop: 32 }}>
              <Link href="/clearance" className="btn-primary">Read Full Issue →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING — clearance tiers */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 40px)' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ width: 28, height: 1, background: 'var(--red)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.4em', color: 'var(--red)' }}>// CLEARANCE</span>
              <span style={{ width: 28, height: 1, background: 'var(--red)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 0.92, marginBottom: 16 }}>Choose Your Tier</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', maxWidth: 480, margin: '0 auto', fontSize: '0.9rem' }}>
              Three levels of access. Each issue arrives sealed, declassified, and delivered to your secure terminal.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
            {/* Analyst (free) */}
            <TierCard tier="ANALYST" price="0" period="forever" desc="Sample one declassified issue per quarter." highlight={false}
              features={[{ label: '1 sample issue per quarter' }, { label: 'Read in browser only' }, { label: 'Public archive index' }, { label: 'PDF download', locked: true }, { label: 'Full archive access', locked: true }]}
              ctaLabel="Create Account" ctaHref="/register" sealColor="var(--paper-dim)" />

            {/* Field Agent */}
            <TierCard tier="FIELD AGENT" price="9.99" period="month" desc="Full active access. New issue every month, on the day it drops." highlight badge="MOST RECRUITED"
              features={[{ label: 'New issue every month' }, { label: 'Full archive · 12 months' }, { label: 'PDF download · offline' }, { label: 'Encrypted reader' }, { label: 'Cancel anytime' }]}
              ctaLabel="Receive Brief" ctaHref="/clearance" sealColor="var(--red)" />

            {/* Station Chief */}
            <TierCard tier="STATION CHIEF" price="89.99" period="year" desc="Lifetime archive. All declassified issues, plus locked Chief-only briefs." highlight={false}
              features={[{ label: 'Everything in Field Agent' }, { label: 'Complete archive · all issues' }, { label: 'Chief-only locked briefs' }, { label: 'Priority intelligence inbox' }, { label: 'Save 25% vs monthly' }]}
              ctaLabel="Select Tier" ctaHref="/clearance?plan=annual" sealColor="var(--gold)" />
          </div>

          <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '12px 24px', border: '1px dashed var(--paper-mute)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.24em', color: 'var(--paper-dim)' }}>
              <span style={{ color: 'var(--green)' }}>● SECURE</span>
              <span>SECURED BY FLITT · VISA · MASTERCARD</span>
              <span style={{ color: 'var(--gold)' }}>◆ NO LOG</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.08em' }}>
              BRIEF<span style={{ color: 'var(--red)' }}>C</span>ASE INTELLIGENCE
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.2em', color: 'var(--paper-dim)', marginTop: 4 }}>
              © {new Date().getFullYear()} · ALL CONTENT CLASSIFIED
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/login" className="nav-link">Login</Link>
            <Link href="/clearance" className="nav-link">Subscribe</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @media (min-width: 900px) { .coords-panel { display: block !important; } }
      `}</style>
    </main>
  )
}

function TierCard({ tier, price, period, desc, features, highlight = false, badge, ctaLabel, ctaHref, sealColor }: {
  tier: string; price: string; period: string; desc: string;
  features: { label: string; locked?: boolean }[];
  highlight?: boolean; badge?: string; ctaLabel: string; ctaHref: string; sealColor: string;
}) {
  return (
    <div style={{ position: 'relative', paddingTop: badge ? 24 : 0 }}>
      {badge && (
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <span className="stamp red">{badge}</span>
        </div>
      )}
      <div className={'card-base' + (highlight ? ' red-edge' : '')} style={{ padding: 28, paddingTop: badge ? 36 : 28, position: 'relative', overflow: 'hidden', background: highlight ? 'linear-gradient(180deg, #1a0a0a 0%, var(--bg-card) 100%)' : 'var(--bg-card)' }}>
        {/* Envelope flap */}
        <svg style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', height: 56, opacity: 0.16 }} preserveAspectRatio="none" viewBox="0 0 100 30">
          <polygon points="0,0 50,28 100,0" fill="none" stroke={sealColor} strokeWidth="0.8" />
        </svg>

        {/* Wax seal */}
        <div style={{ position: 'absolute', top: 24, right: 18, transform: 'rotate(-6deg)', color: sealColor }}>
          <div className="stamp-round" style={{ width: 60, height: 60, fontSize: '0.42rem', color: sealColor, opacity: 0.85 }}>
            {tier.split(' ').map((w, i) => <div key={i}>{w}</div>)}
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.32em', color: highlight ? 'var(--red)' : 'var(--paper-dim)', marginBottom: 10 }}>
          TIER · {tier === 'FIELD AGENT' ? '01' : tier === 'STATION CHIEF' ? '02' : '03'}
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>{tier}</h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--paper-dim)', marginBottom: 22, lineHeight: 1.5 }}>{desc}</p>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 22 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--paper-dim)' }}>$</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.2rem)', fontWeight: 800, color: 'var(--paper)', lineHeight: 0.9 }}>{price}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>/ {period}</span>
        </div>

        <div style={{ height: 1, background: 'repeating-linear-gradient(90deg, var(--paper-mute) 0 4px, transparent 4px 8px)', marginBottom: 18 }} />

        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
            <span style={{ color: f.locked ? 'var(--paper-mute)' : 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', paddingTop: 2 }}>{f.locked ? '×' : '◆'}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: f.locked ? 'var(--paper-mute)' : 'var(--paper-2)', textDecoration: f.locked ? 'line-through' : 'none' }}>{f.label}</span>
          </div>
        ))}

        <div style={{ marginTop: 24 }}>
          <Link href={ctaHref} className={highlight ? 'btn-primary' : 'btn-outline'} style={{ display: 'block', textAlign: 'center' }}>{ctaLabel}</Link>
        </div>

        <div style={{ position: 'absolute', bottom: 10, right: 14, fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--paper-mute)', letterSpacing: '0.2em' }}>
          REF · BC-T-{tier === 'FIELD AGENT' ? '01' : tier === 'STATION CHIEF' ? '02' : '03'}
        </div>
      </div>
    </div>
  )
}
