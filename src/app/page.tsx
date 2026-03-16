// src/app/page.tsx
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const articles = [
  { num: '01', category: 'Latest News', title: 'Missing Russian Businessman', desc: 'The mysterious disappearance of prominent oligarch Dmitri Volkov raises questions that reach far beyond a missing persons case.' },
  { num: '02', category: 'History of Intelligence', title: 'Born of Spies', desc: 'From informants to agencies — the evolution of state intelligence from ancient Persia to Cold War Vienna.' },
  { num: '03', category: 'Operations', title: "Mossad's Christmas Heist", desc: "Five missile boats, a French arms embargo, and the Cherbourg Operation — one of Mossad's most audacious missions." },
  { num: '04', category: 'Exclusive Tricks', title: 'How to Tell a Lie', desc: 'Cover stories, legend-building, microexpression control, and the art of the convincing half-truth.' },
  { num: '05', category: 'Tradecraft', title: "What's What", desc: "Dead drops, brush passes, cut-outs, honey traps — a practical glossary every intelligence professional lives by." },
]

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(48px, 8vw, 80px) 24px clamp(60px, 10vw, 100px)',
        background: 'linear-gradient(160deg, #0a1628 0%, #0d1117 50%, #1a0a0a 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(232,230,225,1) 1px, transparent 1px), linear-gradient(90deg, rgba(232,230,225,1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '40%', height: '3px',
          background: 'linear-gradient(to left, var(--red), transparent)',
        }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="exclusive-badge anim-fade-in" style={{ marginBottom: '32px' }}>
            Exclusive Intelligence Insights
          </div>

          <h1 className="anim-fade-up delay-1" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.5rem, 14vw, 7rem)',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            lineHeight: 0.9,
            marginBottom: '8px',
          }}>
            BRIEF<span style={{ color: 'var(--red)' }}>C</span>ASE
          </h1>
          <h2 className="anim-fade-up delay-2" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.7rem, 2.5vw, 1rem)',
            letterSpacing: '0.5em',
            color: 'var(--paper-dim)',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}>
            Intelligence
          </h2>

          <p className="anim-fade-up delay-3" style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            color: 'var(--paper-dim)',
            maxWidth: '520px',
            lineHeight: 1.8,
            marginBottom: '40px',
          }}>
            The premier journal of the intelligence world. Declassified operations,
            insider tradecraft, and the stories that never made the headlines.
          </p>

          <div className="anim-fade-up delay-4" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/clearance" className="btn-primary">Subscribe Now</Link>
            <Link href="/register" className="btn-outline">Create Account</Link>
          </div>
        </div>
      </section>

      {/* CURRENT ISSUE */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div className="section-divider">
          <span>Current Issue</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(32px, 6vw, 64px)',
          alignItems: 'start',
        }}>
          {/* Cover mock */}
          <div style={{
            background: 'linear-gradient(160deg, #0a1628 0%, #1a0a0a 100%)',
            border: '1px solid var(--border-red)',
            aspectRatio: '3/4',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            maxWidth: '360px',
            width: '100%',
            margin: '0 auto',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 40%, rgba(26,10,10,0.3) 0%, transparent 70%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ background: 'var(--red)', padding: '4px 12px', display: 'inline-block', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Issue 001 — 2026</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '0.08em', lineHeight: 0.9 }}>
                BRIEF<span style={{ color: 'var(--red)' }}>C</span>ASE
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.4em', color: 'var(--paper-dim)', marginTop: '4px' }}>INTELLIGENCE</div>
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              {articles.slice(0, 3).map(a => (
                <div key={a.num} style={{ marginBottom: '16px' }}>
                  <div style={{ color: 'var(--red)', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{a.title}</div>
                  <div style={{ color: 'var(--paper-dim)', fontFamily: 'var(--font-body)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{a.category}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Article list */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', letterSpacing: '0.08em', marginBottom: '8px' }}>
              INSIDE THIS ISSUE
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--paper-dim)', marginBottom: '32px' }}>
              FEBRUARY 2026 — VOLUME 1
            </p>

            {articles.map(a => (
              <div key={a.num} className="article-row">
                <span className="article-num">{a.num}</span>
                <div>
                  <div className="article-category">{a.category}</div>
                  <div className="article-title">{a.title}</div>
                  <div className="article-desc">{a.desc}</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '40px' }}>
              <Link href="/clearance" className="btn-primary">Read Full Issue →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="section-divider"><span>Clearance Levels</span></div>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '48px' }}>CHOOSE YOUR ACCESS</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            alignItems: 'stretch',
          }}>
            {/* Monthly */}
            <div className="card" style={{ padding: 'clamp(24px, 5vw, 40px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', marginBottom: '8px' }}>FIELD AGENT</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>$9<span style={{ fontSize: '1.5rem' }}>.99</span></div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', marginBottom: '32px' }}>PER MONTH</div>
              </div>
              <div style={{ flex: 1 }}>
                {['Full access to all PDF issues', 'New issue every month', 'Download for offline reading', 'Cancel anytime', ' '].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--paper-dim)' }}>
                    <span style={{ color: 'var(--red)', fontWeight: 700, opacity: f === ' ' ? 0 : 1 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/clearance" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '32px' }}>Monthly Plan</Link>
            </div>

            {/* Annual */}
            <div className="card" style={{ padding: 'clamp(24px, 5vw, 40px)', borderColor: 'var(--border-red)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '24px', background: 'var(--red)', padding: '4px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em' }}>BEST VALUE — SAVE 25%</div>
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', marginBottom: '8px' }}>STATION CHIEF</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>$89<span style={{ fontSize: '1.5rem' }}>.99</span></div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', marginBottom: '32px' }}>PER YEAR</div>
              </div>
              <div style={{ flex: 1 }}>
                {['Full access to all PDF issues', 'New issue every month', 'Download for offline reading', 'Complete archive access', 'Priority support'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--paper-dim)' }}>
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/clearance" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '32px' }}>Annual Plan</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.08em' }}>
              BRIEF<span style={{ color: 'var(--red)' }}>C</span>ASE INTELLIGENCE
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--paper-dim)', marginTop: '4px' }}>
              © {new Date().getFullYear()} · ALL CONTENT CLASSIFIED
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/login" className="nav-link">Login</Link>
            <Link href="/clearance" className="nav-link">Subscribe</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
