# Spy Magazine — Full Stack Setup Guide

A complete membership magazine platform built with Next.js 14, Stripe subscriptions, AWS S3 PDF storage, and PostgreSQL.

---

## Architecture Overview

```
User visits site → Registers → Verifies email → Subscribes via Stripe
→ Stripe webhook confirms payment → Subscription saved to DB
→ User can read PDFs (served via secure signed S3 URLs)
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted — Neon, Supabase, or Railway are free)
- Stripe account (free to create, test mode available)
- AWS account with S3 bucket (or use Cloudflare R2 as a cheaper alternative)
- Gmail account or SMTP provider for emails

---

## Step 1 — Install Dependencies

```bash
cd spy-magazine
npm install
```

---

## Step 2 — Set Up Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

### DATABASE_URL
If using local PostgreSQL:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/spy_magazine"
```
If using Neon (free tier available at neon.tech):
```
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/spy_magazine?sslmode=require"
```

### JWT_SECRET
Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Stripe Setup
1. Go to https://dashboard.stripe.com
2. Create an account and get your test API keys
3. Create two products in Stripe Dashboard:
   - Product 1: "Field Agent" → Monthly price at $9.99/month
   - Product 2: "Station Chief" → Annual price at $89.99/year
4. Copy the Price IDs (start with `price_...`)

```
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_ANNUAL_PRICE_ID="price_..."
```

For the webhook secret — see Step 5.

### AWS S3 Setup
1. Go to AWS Console → S3
2. Create a bucket (e.g., `spy-magazine-pdfs`)
3. Block ALL public access (PDFs are served via signed URLs)
4. Make cover images publicly accessible OR use signed URLs for both
5. Go to IAM → Create a user with S3 permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
       "Resource": "arn:aws:s3:::spy-magazine-pdfs/*"
     }]
   }
   ```
6. Create access keys for that IAM user

```
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="spy-magazine-pdfs"
```

### Email (Gmail)
1. Enable 2FA on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Create an app password for "Mail"

```
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your@gmail.com"
EMAIL_PASS="xxxx xxxx xxxx xxxx"  # 16-char app password
EMAIL_FROM="Spy Magazine <your@gmail.com>"
```

---

## Step 3 — Set Up the Database

```bash
# Push the schema to your database
npx prisma db push

# (Optional) Open Prisma Studio to view your data
npx prisma studio
```

---

## Step 4 — Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## Step 5 — Set Up Stripe Webhooks

Stripe needs to notify your app when a payment succeeds. During development, use the Stripe CLI:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret it gives you and add to `.env.local`:
```
STRIPE_WEBHOOK_SECRET="whsec_..."
```

For production, go to Stripe Dashboard → Webhooks → Add endpoint:
- URL: `https://yourdomain.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## Step 6 — Create Your First Admin User

After registering via the UI, manually set your user as ADMIN in the database:

```bash
npx prisma studio
```

Or via SQL:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Then go to http://localhost:3000/admin to upload your first issue.

---

## Step 7 — Deploy to Production

### Recommended: Vercel (free tier available)

```bash
npm install -g vercel
vercel
```

Add all your environment variables in Vercel's dashboard under Project Settings → Environment Variables.

Update your `.env.local`:
```
NEXT_PUBLIC_APP_URL="https://your-vercel-url.vercel.app"
```

Update `next.config.js` with your actual S3 bucket domain.

### After deploying:
1. Update Stripe webhook URL to your production URL
2. Switch Stripe from test mode to live mode and update keys
3. Update `NEXT_PUBLIC_APP_URL` to your real domain

---

## File Structure

```
spy-magazine/
├── prisma/
│   └── schema.prisma          # Database models
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   ├── login/page.tsx      # Login page
│   │   ├── register/page.tsx   # Registration page
│   │   ├── subscribe/page.tsx  # Subscription/pricing page
│   │   ├── dashboard/page.tsx  # User dashboard
│   │   ├── issues/
│   │   │   ├── page.tsx        # Issue listing
│   │   │   └── [id]/page.tsx   # PDF reader
│   │   ├── admin/page.tsx      # Admin upload panel
│   │   ├── verify-email/       # Email verification
│   │   └── api/
│   │       ├── auth/           # Register, login, logout, verify
│   │       ├── stripe/         # Checkout, webhook, cancel
│   │       ├── issues/         # Issue listing + PDF URL
│   │       └── admin/          # Admin issue management
│   ├── components/
│   │   └── Navbar.tsx
│   └── lib/
│       ├── prisma.ts           # DB client
│       ├── stripe.ts           # Stripe client + plan config
│       ├── auth.ts             # JWT utilities
│       ├── s3.ts               # S3 upload/download
│       └── email.ts            # Email sending
```

---

## Changing Prices

Edit `src/lib/stripe.ts` — update the price values there. The actual billing amounts are set in Stripe Dashboard. Keep them in sync.

---

## Customizing the Magazine Name

Search and replace "Spy Magazine" / "SPY MAGAZINE" throughout the codebase.

---

## Security Notes

- PDFs are served via signed S3 URLs that expire after 2 hours — users cannot share direct links
- Auth tokens are stored in httpOnly cookies (not accessible to JavaScript)
- Stripe webhook signature is verified on every request
- All subscription checks happen server-side

---

## Testing Payments

Use Stripe's test card: `4242 4242 4242 4242` with any future expiry and any CVC.

For a declined card: `4000 0000 0000 0002`
