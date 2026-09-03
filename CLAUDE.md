# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run lint         # Run ESLint
npx prisma db push   # Push schema changes to the database
npx prisma studio    # Open Prisma Studio GUI
npx prisma generate  # Regenerate Prisma client after schema changes
```

No test suite is configured.

## Architecture

This is a **Next.js 14 App Router** membership magazine platform called "Briefcase Intelligence" (branded as Spy Magazine in code). Users register, verify email, subscribe via payment, and then access PDF issues stored on AWS S3.

### Auth flow

Two parallel auth mechanisms coexist — both are checked in `src/lib/auth.ts:getCurrentUser()`:
1. **Custom JWT** — stored in an `auth-token` httpOnly cookie, signed with `JWT_SECRET`. Used for email/password login.
2. **NextAuth** — for Google OAuth (`[...nextauth]` route). Falls back after JWT check fails.

`requireAuth()` and `requireSubscription()` are the two server-side guards used in API routes. Both delegate to `getCurrentUser()`, which loads the user's subscriptions filtered by `status: 'ACTIVE'` **and** `currentPeriodEnd > now`. Any other place that computes "is this user subscribed" must use that same two-part filter — an `ACTIVE`-but-expired row is NOT a live subscription, and checking status alone lets an expired user appear subscribed in the UI while content routes reject them.

Password resets bump `User.tokenVersion`; `signToken`/`getCurrentUser` compare it so old JWTs are rejected after a reset (a missing `tokenVersion` in a legacy token coerces to `0`).

### Payment flow

Payments are processed by **Paddle** (Merchant of Record):
- **Pricing** is defined once in `src/lib/pricing.ts` — the single source of truth for every displayed amount. `src/lib/paddle.ts` (`PLANS`) sources its prices and live Paddle `pri_…` price IDs from `pricing.ts`.
- **Checkout** — `/subscribe` loads Paddle.js and opens the overlay checkout (`Paddle.Checkout.open`) with the selected plan's price ID. Requires `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` (set `NEXT_PUBLIC_PADDLE_ENV=sandbox` for the sandbox).
- **Webhook** — `src/app/api/paddle/webhook/route.ts` verifies the `Paddle-Signature` header with `PADDLE_WEBHOOK_SECRET` (and rejects events whose signature timestamp is off by more than a few minutes) and writes `Subscription` records, reusing the `stripeSubscriptionId`/`stripePriceId` fields for Paddle's subscription/price id. Two security invariants live here: (1) the **plan** is derived from the Paddle-verified `pri_…` price id via `planFromPriceId`, never from browser-supplied `custom_data`; (2) the **owner** is resolved by looking up the Paddle-verified customer email (via `paddleRequest('/customers/:id')`), falling back through the event email and `custom_data.email` — trying each candidate until one maps to a real user.
- **Other subscription routes** — `change-plan` (+ `change-plan/preview`) switch a live subscription between monthly/annual; `cancel/route.ts` cancels at period end (best-effort: marks the local record even if the Paddle call fails); `resume/route.ts` clears a scheduled cancellation (strict: it errors rather than claim success if it can't reach Paddle). These last two only call the Paddle API when the stored id is a real `sub_…` id (some rows carry a `paddle_<timestamp>` placeholder minted when an activation webhook arrived with no id).
- **Stripe** — referenced only in `package.json`; its lib and API routes were removed. The Prisma schema still uses Stripe field naming (`stripeSubscriptionId`, `stripePriceId`) for Paddle values.

Set the `paddlePriceId` values in `src/lib/pricing.ts` to match the products created in the Paddle dashboard before going live. `NEXT_PUBLIC_PADDLE_PRICE_MONTHLY`/`_ANNUAL` override them per environment (sandbox vs live) — but being `NEXT_PUBLIC_`, they are inlined at **build** time, so changing them requires a rebuild, not just a redeploy. Any displayed savings figure (e.g. "save 25%") must be derived from `PRICING` (see `ANNUAL_SAVINGS_PCT`), never hardcoded.

### Site access gate

`src/middleware.ts` intercepts all requests and checks for a `site_access` cookie. If missing, it rewrites to `/api/site-access/page` which serves a standalone HTML "coming soon" page. The access code is set via `SITE_ACCESS_CODE` env var (default: `briefcase`). To bypass locally, set the cookie or remove/modify the middleware.

### PDF delivery & the reader

Issues are stored as PDFs in S3 with private ACLs. **The raw S3 URL is never exposed to the browser.** `src/app/api/issues/[id]/pdf/route.ts` fetches the file server-side (caching raw bytes per-instance by S3 key), stamps a per-user diagonal watermark carrying the reader's **operative id**, and streams the result — inline for the reader, or as an attachment for `?download=1`. So any leaked copy is attributable to an account.

- The operative id is a pseudonymous label derived from the user's DB id. Its derivation lives once in `src/lib/identity.ts:operativeId()` and is shared by the watermark route and the dashboard/navbar UI — they MUST stay identical or a watermark stops mapping to the id the user sees. Do not re-inline this function.
- `src/lib/s3.ts` still exports `getPDFReadUrl()` (2-hour signed URLs), but it now has **no callers** — the old `/api/issues/[id]/read` route that handed raw un-watermarked URLs to the browser was deleted precisely because it bypassed the watermark. Don't reintroduce a route that returns that URL to subscribers. Admin uploads use pre-signed PUT URLs so files go browser→S3 without passing through the server.
- `src/app/issues/[id]/ReaderView.tsx` is the reader: **client-only** (loaded via `next/dynamic` with `ssr:false` from `page.tsx`, because react-pdf/pdf.js touch browser-only globals at import). It renders pages to canvas in a horizontal scroll-snap strip, keeping a small window of spreads pre-rasterized so page turns don't stall. The pdf.js worker is served from `/public/pdf.worker.min.mjs` at a fixed path (`pdfjs.GlobalWorkerOptions.workerSrc`) and must match the `pdfjs-dist` version react-pdf depends on — re-copy it from `node_modules` when that version changes.
- `src/app/api/issues/[id]/route.ts` returns a single issue's metadata + `hasSubscription`; the reader uses it instead of the full `/api/issues` list so payload/DB work doesn't scale with the archive.

### Rate limiting

`src/lib/rate-limit.ts` is a dependency-free **in-memory** fixed-window limiter guarding unauthenticated endpoints (login, forgot-password, site-access). State is per-process, so on multi-instance/serverless it caps per-instance bursts only — swap for a shared store (Upstash Redis, or a Vercel Firewall rule) for a hard global limit, keeping the `checkRateLimit` signature. Login uses two keys: a per-IP counter that counts every attempt, and a per-email counter that is only **peeked** on entry and incremented solely on a *failed* password check (via `peekRateLimit` + `checkRateLimit`), so an attacker can't lock a victim out by spamming their email.

### Database

PostgreSQL via Prisma. Key models: `User` (with `role: ADMIN | SUBSCRIBER`), `Subscription`, `Issue`.

To promote a user to admin:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### Environment variables required

```
DATABASE_URL
JWT_SECRET
NEXTAUTH_SECRET
NEXTAUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET
EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
PADDLE_API_KEY, PADDLE_WEBHOOK_SECRET
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN, NEXT_PUBLIC_PADDLE_ENV   # NEXT_PUBLIC_PADDLE_ENV=sandbox for sandbox checkout
NEXT_PUBLIC_PADDLE_PRICE_MONTHLY, NEXT_PUBLIC_PADDLE_PRICE_ANNUAL   # optional per-env price-id overrides (build-time inlined)
NEXT_PUBLIC_AWS_REGION, NEXT_PUBLIC_AWS_S3_BUCKET   # client-side S3 references
NEXT_PUBLIC_GA_ID         # optional, Google Analytics
SITE_ACCESS_CODE          # optional, defaults to "briefcase"
NEXT_PUBLIC_APP_URL
```

After adding new env vars, update `next.config.js` image domains if S3 bucket changes.

### Deployment

The live site is the `briefcase-intelligence` Vercel project (team `dachis-8875s-projects`); production is `briefcase.agency`. The test site `briefcase-sandbox.vercel.app` is **not a separate project** — it's an alias pointed at a preview deployment. To update it: `vercel deploy` (preview), then `vercel alias set <deployment-url> briefcase-sandbox.vercel.app`. (The separate `spy-magazine` Vercel project is stale/unused.)
