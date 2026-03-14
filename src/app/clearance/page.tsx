'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const CARD_ITEMS = [
  { id: 1, emoji: '🕵️', label: 'OPERATIVE' },
  { id: 2, emoji: '📁', label: 'DOSSIER' },
  { id: 3, emoji: '🔐', label: 'VAULT' },
  { id: 4, emoji: '📡', label: 'SIGNAL' },
  { id: 5, emoji: '🗝️', label: 'CIPHER KEY' },
  { id: 6, emoji: '💼', label: 'BRIEFCASE' },
  { id: 7, emoji: '🎯', label: 'TARGET' },
  { id: 8, emoji: '🌍', label: 'STATION' },
]

const TRIVIA = [
  { section: 'LOGICAL REASONING', q: 'All field officers are trained analysts.\nSome trained analysts speak Arabic.\nWhich statement MUST be true?', options: ['All field officers speak Arabic', 'Some field officers speak Arabic', 'No field officers speak Arabic', 'Cannot be determined'], a: 3 },
  { section: 'LOGICAL REASONING', q: 'Complete the sequence:\n3 — 6 — 18 — 72 — ?', options: ['144', '216', '360', '432'], a: 2 },
  { section: 'VERBAL REASONING', q: '"The source has previously provided reliable information, but has recently shown signs of exaggeration."\n\nWhich is the SAFEST conclusion?', options: ['The source is fully reliable', 'The source is unreliable', 'The source should be cross-verified', 'The source should be ignored'], a: 2 },
  { section: 'VERBAL REASONING', q: 'A report states: "There is moderate confidence that the operation will succeed."\n\nThis MOST likely means:', options: ['Success is guaranteed', 'Success is unlikely', 'Evidence supports success but uncertainty remains', 'There is no data'], a: 2 },
  { section: 'SITUATIONAL JUDGMENT', q: 'You receive urgent intelligence from a new source. It indicates possible risk but lacks verification. What is the BEST first action?', options: ['Publicly disclose the warning', 'Immediately act on it', 'Cross-check with existing intelligence', 'Ignore it until verified'], a: 2 },
  { section: 'SITUATIONAL JUDGMENT', q: 'A colleague asks you to share restricted data "just for context" outside official channels. You should:', options: ['Share if you trust them', 'Share only partial data', 'Refuse and remind them of protocol', 'Report them immediately without discussion'], a: 2 },
  { section: 'ANALYTICAL THINKING', q: 'You receive 3 reports:\n• Report A: Threat likely within 72 hours.\n• Report B: Threat possible but low confidence.\n• Report C: No current evidence of threat.\n\nBest analytical conclusion:', options: ['There is definitely a threat', 'No threat exists', 'There is a possible threat requiring monitoring', 'Ignore until certainty is reached'], a: 2 },
  { section: 'ANALYTICAL THINKING', q: 'Intelligence confidence levels:\n• High = 80-100%\n• Moderate = 50-79%\n• Low = below 50%\n\nA report with 65% certainty should be classified as:', options: ['High confidence', 'Moderate confidence', 'Low confidence', 'Critical'], a: 1 },
]
const SUSPECTS = [
  {
    scene: 'A hotel lobby in Vienna. Four guests are present.',
    clues: ['The spy arrived alone but keeps glancing at the exit', 'They have no luggage despite claiming to have just arrived', 'Their newspaper is two days old', 'They have not touched their coffee in 40 minutes'],
    suspects: ['Business executive on phone call', 'Tourist reading old newspaper with no luggage', 'Couple checking in with suitcases', 'Hotel staff member at the desk'],
    a: 1,
    explain: 'The tourist matches all clues — old newspaper, no luggage, and stationary behavior consistent with surveillance.',
  },
  {
    scene: 'A train station in Berlin. Four individuals are on the platform.',
    clues: ['The agent is travelling without a ticket', 'They are memorizing the schedule board, not checking it', 'They made eye contact with three different people in sequence', 'Their coat has an unusual bulge near the left pocket'],
    suspects: ['Businessman checking his phone repeatedly', 'Woman studying the schedule board intensely without looking at her phone', 'Student with a large backpack and headphones', 'Elderly man sitting on a bench reading'],
    a: 1,
    explain: 'The woman studying the board matches — memorizing routes, no ticket needed, and conducting surveillance passes.',
  },
  {
    scene: 'A cafe in Prague. Four patrons are seated.',
    clues: ['The agent ordered nothing but has been there 2 hours', 'They are seated facing the door at all times', 'They wrote something on a napkin and left it under the table', 'Their accent does not match their claimed nationality'],
    suspects: ['Local student doing homework with coffee', 'Foreign man seated facing the door with no drink, writing on napkin', 'Couple arguing quietly near the window', 'Journalist typing on a laptop'],
    a: 1,
    explain: 'The foreign man matches every clue — facing the door, no order, napkin dead drop, and suspicious nationality claim.',
  },
]

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }
function generateNumbers(): number[] { return Array.from({ length: 15 }, () => Math.floor(10 + Math.random() * 90)) }

interface CardItem { uid: number; id: number; emoji: string; label: string; flipped: boolean; matched: boolean }

function createDeck(): CardItem[] {
  return shuffle([...CARD_ITEMS, ...CARD_ITEMS].map((c, i) => ({ ...c, uid: i, flipped: false, matched: false })))
}

type Stage = 'intro' | 'cards' | 'numbers-show' | 'numbers-input' | 'trivia' | 'spot' | 'complete' | 'failed'

// ─── STAGE COMPONENTS ─────────────────────────────────────────────────────────

function StageHeader({ stage, total }: { stage: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${i < stage ? 'var(--red)' : i === stage ? 'var(--paper)' : 'var(--border)'}`,
            background: i < stage ? 'var(--red)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: i < stage ? '#fff' : i === stage ? 'var(--paper)' : 'var(--paper-dim)',
          }}>
            {i < stage ? '✓' : i + 1}
          </div>
          {i < total - 1 && <div style={{ width: '32px', height: '1px', background: i < stage ? 'var(--red)' : 'var(--border)' }} />}
        </div>
      ))}
    </div>
  )
}

function TimerBar({ seconds, total }: { seconds: number; total: number }) {
  const pct = (seconds / total) * 100
  const color = pct > 50 ? 'var(--red)' : pct > 25 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', letterSpacing: '0.2em' }}>TIME REMAINING</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: seconds <= 10 ? '#ef4444' : 'var(--paper)', fontWeight: 700 }}>{seconds}s</span>
      </div>
      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 1s linear, background 0.3s' }} />
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ClearancePage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('intro')
  const [failReason, setFailReason] = useState('')

  // Cards state
  const [deck, setDeck] = useState<CardItem[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [cardMatches, setCardMatches] = useState(0)
  const [cardLocked, setCardLocked] = useState(false)
  const [cardTimer, setCardTimer] = useState(30)

  // Numbers state
  const [numbers, setNumbers] = useState<number[]>([])
  const [numberTimer, setNumberTimer] = useState(30)
  const [inputValue, setInputValue] = useState('')
  const [numberResult, setNumberResult] = useState<null | { correct: number; passed: boolean }>(null)

  // Trivia state
  const [triviaIndex, setTriviaIndex] = useState(0)
  const [triviaScore, setTriviaScore] = useState(0)
  const [triviaAnswered, setTriviaAnswered] = useState<number | null>(null)
  const [triviaQuestions] = useState(() => TRIVIA)

  // Spot state
  const [spotIndex] = useState(() => Math.floor(Math.random() * SUSPECTS.length))
  const [spotAnswer, setSpotAnswer] = useState<number | null>(null)

  const fail = useCallback((reason: string) => {
    setFailReason(reason)
    setStage('failed')
  }, [])

  // ── Card timer
  useEffect(() => {
    if (stage !== 'cards') return
    if (cardTimer <= 0) { fail('You ran out of time on the Memory Cards stage.'); return }
    const t = setTimeout(() => setCardTimer(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [stage, cardTimer, fail])

  // ── Numbers timer
  useEffect(() => {
    if (stage !== 'numbers-show') return
    if (numberTimer <= 0) { setStage('numbers-input'); return }
    const t = setTimeout(() => setNumberTimer(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [stage, numberTimer])

  // ── Start cards stage
  const startCards = () => {
    setDeck(createDeck())
    setCardMatches(0)
    setCardTimer(30)
    setSelected([])
    setStage('cards')
  }

  // ── Card flip
  const handleFlip = (uid: number) => {
    if (cardLocked || stage !== 'cards') return
    const card = deck.find(c => c.uid === uid)
    if (!card || card.flipped || card.matched) return
    const newSelected = [...selected, uid]
    const newDeck = deck.map(c => c.uid === uid ? { ...c, flipped: true } : c)
    setDeck(newDeck)
    if (newSelected.length === 2) {
      setSelected([])
      setCardLocked(true)
      const [a, b] = newSelected.map(id => newDeck.find(c => c.uid === id)!)
      if (a.id === b.id) {
        setTimeout(() => {
          const newMatches = cardMatches + 1
          setDeck(d => d.map(c => newSelected.includes(c.uid) ? { ...c, matched: true } : c))
          setCardMatches(newMatches)
          setCardLocked(false)
          if (newMatches === CARD_ITEMS.length) {
            setNumbers(generateNumbers())
            setNumberTimer(30)
            setStage('numbers-show')
          }
        }, 500)
      } else {
        setTimeout(() => {
          setDeck(d => d.map(c => newSelected.includes(c.uid) ? { ...c, flipped: false } : c))
          setCardLocked(false)
        }, 900)
      }
    } else {
      setSelected(newSelected)
    }
  }

  // ── Numbers submit
  const submitNumbers = () => {
    const typed = inputValue.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && n >= 10 && n <= 99)
    const correct = typed.filter(n => numbers.includes(n)).length
    const passed = correct >= 12
    setNumberResult({ correct, passed })
    if (!passed) setTimeout(() => fail(`You only recalled ${correct}/12 numbers. Minimum is 12.`), 1500)
    else setTimeout(() => { setTriviaIndex(0); setTriviaScore(0); setStage('trivia') }, 1500)
  }

  // ── Trivia answer
  const handleTrivia = (optionIdx: number) => {
    if (triviaAnswered !== null) return
    setTriviaAnswered(optionIdx)
    const correct = optionIdx === triviaQuestions[triviaIndex].a
    if (correct) setTriviaScore(s => s + 1)
    setTimeout(() => {
      const next = triviaIndex + 1
      if (next >= 8) {
        const finalScore = triviaScore + (correct ? 1 : 0)
        if (finalScore < 8) fail(`You scored ${finalScore}/8 on Spy Trivia. Minimum is 6.`)
        else setStage('spot')
      } else {
        setTriviaIndex(next)
        setTriviaAnswered(null)
      }
    }, 1000)
  }

  // ── Spot answer
  const handleSpot = (idx: number) => {
    if (spotAnswer !== null) return
    setSpotAnswer(idx)
    if (idx !== SUSPECTS[spotIndex].a) {
      setTimeout(() => fail('You identified the wrong suspect. Mission compromised.'), 1500)
    } else {
      setTimeout(() => setStage('complete'), 1500)
    }
  }

  const resetAll = () => {
    setStage('intro')
    setFailReason('')
    setCardMatches(0)
    setCardTimer(30)
    setSelected([])
    setDeck([])
    setNumbers([])
    setNumberTimer(30)
    setInputValue('')
    setNumberResult(null)
    setTriviaIndex(0)
    setTriviaScore(0)
    setTriviaAnswered(null)
    setSpotAnswer(null)
  }

  const stageNum = stage === 'cards' ? 0 : stage === 'numbers-show' || stage === 'numbers-input' ? 1 : stage === 'trivia' ? 2 : stage === 'spot' ? 3 : -1

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, padding: '40px 24px', maxWidth: '820px', margin: '0 auto', width: '100%' }}>

        {/* ── INTRO ── */}
        {stage === 'intro' && (
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div style={{ border: '1px solid var(--red)', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', padding: '4px 16px', display: 'inline-block', marginBottom: '24px' }}>LEVEL 5 SECURITY CLEARANCE</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '16px' }}>OPERATIVE ASSESSMENT</h1>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 48px' }}>
              Access to Briefcase Intelligence requires passing a 4-stage clearance protocol. Fail any stage and you return to the beginning.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '48px', textAlign: 'left' }}>
              {[
                { num: '01', title: 'MEMORY CARDS', desc: 'Match 8 classified pairs in 30 seconds' },
                { num: '02', title: 'NUMBER RECALL', desc: 'Memorize 15 numbers in 30s, recall at least 12' },
                { num: '03', title: 'SPY TRIVIA', desc: 'Answer 12 intelligence questions, score 8+' },
                { num: '04', title: 'SPOT THE AGENT', desc: 'Identify the operative from witness clues' },
              ].map(s => (
                <div key={s.num} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '20px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--red)', letterSpacing: '0.2em', marginBottom: '6px' }}>STAGE {s.num}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{s.title}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--paper-dim)' }}>{s.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={startCards} className="btn-primary" style={{ fontSize: '1rem', padding: '16px 48px' }}>Begin Assessment</button>
            <div style={{ marginTop: '16px' }}>
              <button onClick={() => router.push('/subscribe')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--paper-dim)', opacity: 0.4, textDecoration: 'underline' }}>
                Skip → go straight to subscribe
              </button>
            </div>
          </div>
        )}

        {/* ── CARDS ── */}
        {stage === 'cards' && (
          <div>
            <StageHeader stage={0} total={4} />
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', marginBottom: '8px' }}>STAGE 01 — MEMORY CARDS</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>MATCH ALL PAIRS</h2>
            </div>
            <TimerBar seconds={cardTimer} total={30} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)' }}>MATCHED: {cardMatches}/{CARD_ITEMS.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {deck.map(card => (
                <button key={card.uid} onClick={() => handleFlip(card.uid)} style={{
                  aspectRatio: '1', background: card.matched ? 'rgba(204,26,46,0.15)' : card.flipped ? 'var(--bg-light)' : 'var(--bg-card)',
                  border: `1px solid ${card.matched ? 'var(--red)' : card.flipped ? 'rgba(232,230,225,0.3)' : 'var(--border)'}`,
                  cursor: card.matched ? 'default' : 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.25s',
                }}>
                  {card.flipped || card.matched ? (
                    <>
                      <div style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)' }}>{card.emoji}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.45rem', letterSpacing: '0.1em', color: card.matched ? 'var(--red)' : 'var(--paper-dim)' }}>{card.label}</div>
                    </>
                  ) : (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--paper-dim)', opacity: 0.3, letterSpacing: '0.2em' }}>???</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── NUMBERS SHOW ── */}
        {stage === 'numbers-show' && (
          <div style={{ textAlign: 'center' }}>
            <StageHeader stage={1} total={4} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', marginBottom: '8px' }}>STAGE 02 — NUMBER RECALL</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>MEMORIZE THESE NUMBERS</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', marginBottom: '24px', fontSize: '0.9rem' }}>You have 30 seconds. You must recall at least 12.</p>
            <TimerBar seconds={numberTimer} total={30} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginTop: '24px' }}>
              {numbers.map((n, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '20px 8px', fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, textAlign: 'center', color: 'var(--red)' }}>{n}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── NUMBERS INPUT ── */}
        {stage === 'numbers-input' && (
          <div style={{ textAlign: 'center' }}>
            <StageHeader stage={1} total={4} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', marginBottom: '8px' }}>STAGE 02 — NUMBER RECALL</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>ENTER THE NUMBERS</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', marginBottom: '32px', fontSize: '0.9rem' }}>Type the numbers you remember, separated by spaces or commas. Minimum 12 correct.</p>
            {numberResult === null ? (
              <>
                <textarea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="e.g. 42 17 83 55 29..."
                  style={{ width: '100%', background: 'var(--bg-light)', border: '1px solid var(--border)', borderBottom: '2px solid var(--red)', color: 'var(--paper)', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', outline: 'none', resize: 'vertical', minHeight: '120px', letterSpacing: '0.1em' }}
                />
                <button onClick={submitNumbers} className="btn-primary" style={{ marginTop: '24px', padding: '14px 48px', fontSize: '0.9rem' }}>Submit Recall</button>
              </>
            ) : (
              <div style={{ background: 'var(--bg-card)', border: `1px solid ${numberResult.passed ? 'var(--red)' : 'var(--border)'}`, padding: '40px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: numberResult.passed ? 'var(--red)' : 'var(--paper-dim)' }}>{numberResult.correct}/15</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.2em', marginTop: '8px' }}>
                  {numberResult.passed ? 'CLEARANCE GRANTED — PROCEEDING' : 'INSUFFICIENT RECALL — MISSION FAILED'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TRIVIA ── */}
        {stage === 'trivia' && (
          <div>
            <StageHeader stage={2} total={4} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', marginBottom: '8px', textAlign: 'center' }}>STAGE 03 — SPY TRIVIA</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>QUESTION {triviaIndex + 1} OF 8</h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--red)' }}>SCORE: {triviaScore}</span>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '32px', marginBottom: '24px' }}>
              {(triviaQuestions[triviaIndex] as any).section && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.25em', color: 'var(--red)', marginBottom: '12px' }}>
                  {(triviaQuestions[triviaIndex] as any).section}
                </div>
              )}
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{triviaQuestions[triviaIndex].q}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {triviaQuestions[triviaIndex].options.map((opt, i) => {
                const isCorrect = i === triviaQuestions[triviaIndex].a
                const isSelected = triviaAnswered === i
                const revealed = triviaAnswered !== null
                let bg = 'var(--bg-card)'
                let border = 'var(--border)'
                if (revealed && isCorrect) { bg = 'rgba(204,26,46,0.2)'; border = 'var(--red)' }
                if (revealed && isSelected && !isCorrect) { bg = 'rgba(100,100,100,0.2)'; border = 'rgba(150,150,150,0.5)' }
                return (
                  <button key={i} onClick={() => handleTrivia(i)} style={{
                    background: bg, border: `1px solid ${border}`, padding: '16px 20px', textAlign: 'left',
                    fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--paper)', cursor: revealed ? 'default' : 'pointer', transition: 'all 0.3s',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', marginRight: '12px' }}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--paper-dim)' }}>PASS REQUIREMENT: 6/8 · 4 SECTIONS</span>
            </div>
          </div>
        )}

        {/* ── SPOT THE AGENT ── */}
        {stage === 'spot' && (
          <div>
            <StageHeader stage={3} total={4} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--paper-dim)', marginBottom: '8px', textAlign: 'center' }}>STAGE 04 — SPOT THE AGENT</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>IDENTIFY THE OPERATIVE</h2>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', marginBottom: '24px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--red)', letterSpacing: '0.2em', marginBottom: '12px' }}>FIELD REPORT — SCENE</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '20px' }}>{SUSPECTS[spotIndex].scene}</p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--red)', letterSpacing: '0.2em', marginBottom: '12px' }}>INTELLIGENCE CLUES</div>
              {SUSPECTS[spotIndex].clues.map((clue, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--paper-dim)' }}>
                  <span style={{ color: 'var(--red)', flexShrink: 0 }}>◆</span>{clue}
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', letterSpacing: '0.2em', marginBottom: '12px' }}>SELECT THE SUSPECT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SUSPECTS[spotIndex].suspects.map((s, i) => {
                const isCorrect = i === SUSPECTS[spotIndex].a
                const isSelected = spotAnswer === i
                const revealed = spotAnswer !== null
                let bg = 'var(--bg-card)'
                let border = 'var(--border)'
                if (revealed && isCorrect) { bg = 'rgba(204,26,46,0.2)'; border = 'var(--red)' }
                if (revealed && isSelected && !isCorrect) { bg = 'rgba(100,100,100,0.2)'; border = 'rgba(150,150,150,0.4)' }
                return (
                  <button key={i} onClick={() => handleSpot(i)} style={{
                    background: bg, border: `1px solid ${border}`, padding: '16px 20px', textAlign: 'left',
                    fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--paper)', cursor: revealed ? 'default' : 'pointer', transition: 'all 0.3s',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--paper-dim)', marginRight: '12px' }}>{String.fromCharCode(65 + i)}</span>
                    {s}
                    {revealed && isCorrect && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--red)', marginLeft: '12px' }}>◆ {SUSPECTS[spotIndex].explain}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── COMPLETE ── */}
        {stage === 'complete' && (
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <StageHeader stage={4} total={4} />
            <div style={{ border: '1px solid var(--red)', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', padding: '6px 16px', display: 'inline-block', marginBottom: '24px' }}>ALL STAGES PASSED</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, marginBottom: '16px' }}>CLEARANCE GRANTED</h1>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto 16px' }}>
              You have demonstrated the memory, knowledge, and judgment of a seasoned operative.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto 40px' }}>
              Access to <strong style={{ color: 'var(--paper)' }}>Briefcase Intelligence</strong> is now unlocked.
            </p>
            <button onClick={() => router.push('/subscribe')} className="btn-primary" style={{ fontSize: '1rem', padding: '16px 48px' }}>
              Claim Your Access →
            </button>
          </div>
        )}

        {/* ── FAILED ── */}
        {stage === 'failed' && (
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div style={{ border: '1px solid rgba(150,150,150,0.3)', color: 'var(--paper-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.3em', padding: '6px 16px', display: 'inline-block', marginBottom: '24px' }}>MISSION FAILED</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, marginBottom: '16px' }}>CLEARANCE DENIED</h1>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto 12px' }}>{failReason}</p>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--paper-dim)', fontSize: '0.9rem', marginBottom: '40px' }}>You must restart from Stage 01.</p>
            <button onClick={resetAll} className="btn-primary" style={{ fontSize: '1rem', padding: '16px 48px' }}>Restart Assessment</button>
            <div style={{ marginTop: '16px' }}>
              <button onClick={() => router.push('/subscribe')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--paper-dim)', opacity: 0.4, textDecoration: 'underline' }}>
                Skip → go straight to subscribe
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
