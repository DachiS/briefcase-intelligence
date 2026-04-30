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

`requireAuth()` and `requireSubscription()` are the two server-side guards used in API routes.

### Payment flow

The codebase has **two payment integrations** in different states:
- **Flitt** (`src/lib/flitt.ts`, `src/app/api/flitt/`) — the active integration. Uses a hosted checkout flow: frontend calls `/api/flitt/create-token` → gets a token → redirects to `pay.flitt.com`. Flitt POSTs back to `/api/flitt/webhook` with form data. Subscription records are written directly to the DB using Prisma's `Subscription` model, reusing `stripeSubscriptionId`/`stripePriceId` fields for Flitt's `payment_id`/plan.
- **Stripe** — referenced in `src/lib/stripe.ts` and `package.json` but the API routes were removed. The Prisma schema still uses Stripe field naming.

The test Flitt merchant (ID `1549901`) only supports GEL currency. Production requires `FLITT_MERCHANT_ID` env var set to a real merchant ID for USD.

### Site access gate

`src/middleware.ts` intercepts all requests and checks for a `site_access` cookie. If missing, it rewrites to `/api/site-access/page` which serves a standalone HTML "coming soon" page. The access code is set via `SITE_ACCESS_CODE` env var (default: `briefcase`). To bypass locally, set the cookie or remove/modify the middleware.

### PDF delivery

Issues are stored as PDFs in S3 with private ACLs. `src/lib/s3.ts:getPDFReadUrl()` generates 2-hour signed URLs. Admin uploads also use pre-signed PUT URLs so files go directly from browser to S3 without passing through the server.

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
FLITT_MERCHANT_ID, FLITT_SECRET_KEY
SITE_ACCESS_CODE          # optional, defaults to "briefcase"
NEXT_PUBLIC_APP_URL
```

After adding new env vars, update `next.config.js` image domains if S3 bucket changes.
