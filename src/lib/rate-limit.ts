// src/lib/rate-limit.ts
//
// Lightweight in-memory sliding-window rate limiter with ZERO external
// dependencies. Used to blunt brute-force / abuse on unauthenticated endpoints
// (login, forgot-password, the site-access gate).
//
// LIMITATION: state lives in the process, so on a multi-instance serverless
// deployment (Vercel) each instance counts independently and counters reset on
// cold start. That still caps per-instance bursts, but for a hard global limit
// swap this for a shared store — Upstash Redis + @upstash/ratelimit, or a
// Vercel Firewall rate-limit rule. Keep the same `checkRateLimit` signature so
// callers don't change. See the fix guide in the audit for the exact wiring.

interface Window {
  count: number
  resetAt: number
}

const buckets = new Map<string, Window>()

// Periodically drop expired buckets so the map can't grow unbounded.
let lastSweep = 0
function sweep(now: number) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, win] of buckets) {
    if (win.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  /** Seconds until the window resets (only meaningful when success === false). */
  retryAfter: number
}

/**
 * Fixed-window limiter. Allows `limit` requests per `windowMs` per `key`.
 * @param key      Caller-scoped identity, e.g. `login:<ip>` or `forgot:<email>`.
 * @param limit    Max requests allowed in the window.
 * @param windowMs Window length in milliseconds.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const win = buckets.get(key)
  if (!win || win.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, retryAfter: 0 }
  }

  if (win.count >= limit) {
    return { success: false, remaining: 0, retryAfter: Math.ceil((win.resetAt - now) / 1000) }
  }

  win.count += 1
  return { success: true, remaining: limit - win.count, retryAfter: Math.ceil((win.resetAt - now) / 1000) }
}

/** Clear a bucket, e.g. after a successful login so real users aren't locked out. */
export function resetRateLimit(key: string): void {
  buckets.delete(key)
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}
