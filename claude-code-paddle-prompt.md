# Claude Code Task — Make briefcase.agency Paddle-verification-ready

You are working in the **briefcase.agency** repository (Next.js app, deployed on Vercel). Your job is to bring the site into compliance with Paddle's Acceptable Use Policy and Master Services Agreement so the domain passes Paddle merchant verification. Complete **all** tasks below end to end. Do **not** ask clarifying questions, do not stop for approval between tasks, and do not propose alternatives — follow the deterministic rules given here, make the changes, run the build, fix what breaks, and finish with the summary report described at the end. Where a value is genuinely ambiguous, resolve it using the rules provided rather than asking.

Work in this order. After each task, verify its "Done when" condition before moving on.

---

## Task 1 — Single source of truth for pricing (highest priority)

The site currently contains conflicting prices. The homepage shows Field Agent **$9.99/month** and Station Chief **$89.99/year**; the `/refund` page shows Field Agent **$19.99/month** and Station Chief **$99.99/year**. This conflict must be eliminated.

1. Grep the entire repo for hardcoded prices and tier strings: `9.99`, `19.99`, `89.99`, `99.99`, `Analyst`, `Field Agent`, `Station Chief`.
2. Determine the **canonical** price set using this deterministic rule, in order:
   - **(a)** If a price value is wired into the actual checkout / payment integration code (Paddle price config, checkout handler, plan IDs, env-referenced amounts), that value is canonical.
   - **(b)** If checkout is not yet wired to live amounts, the **homepage** values are canonical: Field Agent **$9.99/month**, Station Chief **$89.99/year**, Analyst **$0**.
   - Apply the same chosen set everywhere. Do not mix sources.
3. Create `lib/pricing.ts` exporting a typed config, e.g.:
   ```ts
   export const PRICING = {
     analyst:     { name: "Analyst",       amount: 0,     interval: "free",    currency: "USD", paddlePriceId: "" },
     fieldAgent:  { name: "Field Agent",   amount: 9.99,  interval: "month",   currency: "USD", paddlePriceId: "" },
     stationChief:{ name: "Station Chief", amount: 89.99, interval: "year",    currency: "USD", paddlePriceId: "" },
   } as const;

   export const fmt = (a: number) => a === 0 ? "$0" : `$${a.toFixed(2)}`;
   ```
   (Use the canonical amounts resolved in step 2. Leave `paddlePriceId` empty for now.)
4. Refactor every page/component that displays a price — homepage pricing section, `/refund`, `/clearance`, login/register CTAs, and any others found in step 1 — to import from `lib/pricing.ts` instead of hardcoding.

**Done when:** every price rendered on the site resolves from `lib/pricing.ts`, and grepping for the raw numbers (`9.99`, `19.99`, `89.99`, `99.99`) returns matches only inside `lib/pricing.ts`.

---

## Task 2 — Disclose Paddle as reseller / Merchant of Record

1. Find the footer component rendering `SECURED BY FLITT · VISA · MASTERCARD`. Replace **only the text content** (keep existing classes/styling) with:
   ```
   ● SECURE   PAYMENTS BY PADDLE · VISA · MASTERCARD   ◆ NO LOG
   ```
   Remove every remaining occurrence of the string `Flitt` / `FLITT` across the codebase.
2. In the Terms of Service page (`/terms`), add a new section using this exact text:

   > ## Billing, Payments, and Merchant of Record
   >
   > Our order process and payments are conducted by our online reseller Paddle.com. Paddle.com Market Ltd. (and its affiliates) is the Merchant of Record for all orders placed through Briefcase Intelligence. Paddle provides all customer service inquiries and handles returns.
   >
   > When you purchase a subscription, Paddle — not Briefcase Intelligence — processes your payment, issues your invoice or receipt, and is responsible for collecting and remitting any applicable sales tax or VAT. Your purchase is therefore also subject to Paddle's Checkout Buyer Terms (paddle.com/legal/checkout-buyer-terms) and Privacy Policy (paddle.com/legal/privacy).
   >
   > Subscriptions renew automatically at the then-current price until cancelled. You can cancel at any time from your account or by contacting support@briefcase.agency. Refunds are governed by our Refund Policy and are processed through Paddle.

3. On the `/clearance` (checkout) page, add this line near the primary purchase CTA:
   ```
   Payments are securely processed by our reseller and Merchant of Record, Paddle.com. By continuing, you agree to Paddle's Buyer Terms.
   ```

**Done when:** no `Flitt`/`FLITT` string remains in the rendered site, and both `/terms` and the checkout flow name Paddle as reseller/Merchant of Record.

---

## Task 3 — Replace the Refund Policy

Replace the entire content of `/refund` with the policy below (preserve the page's existing layout/section styling — only the copy changes). Prices must come from `lib/pricing.ts`; substitute `{{FIELD_AGENT_MONTHLY}}` and `{{STATION_CHIEF_ANNUAL}}` with formatted values from the config. Set "LAST UPDATED" to the current date at build/commit time.

```
# Refund Policy

"Every mission has an exit. So does every subscription."

LAST UPDATED: [current date]
DOC REF: BI-LEGAL-RFND-2026

## Quick Summary
◆ Payments and refunds are handled by Paddle, our Merchant of Record.
◆ Monthly plan: cancel anytime · access continues until the period ends · no proration.
◆ Annual plan: refund eligible within 14 days of the charge if fewer than 2 issues have been released.
◆ Technical failure or duplicate charge: full refund · always.

§01 — Digital Product Policy
Briefcase Intelligence delivers digital content (issues, archive access, PDF downloads) made available immediately upon subscription activation. Because the content is delivered digitally, refund eligibility is limited as described below. This policy does not affect any statutory rights you may have under applicable consumer law.

§02 — Merchant of Record
All purchases are sold and fulfilled by Paddle.com, which acts as the Merchant of Record. Paddle processes payments, issues receipts, and administers refunds on our behalf. You may request a refund either by contacting us at support@briefcase.agency or directly through Paddle at paddle.net.

§03 — Eligibility for Refund
You may be eligible for a refund in the following circumstances:
◆ You request a refund within 14 days of the charge and have not downloaded or accessed paid issues during that period.
◆ You were charged but did not receive access due to a technical failure on our end (full refund, no time limit).
◆ You were charged more than once for the same billing period due to a payment processing error (full refund of the duplicate, no time limit).
Requests outside these conditions are evaluated case by case at our and Paddle's discretion.

§04 — Monthly Subscriptions
Monthly Field Agent subscriptions ({{FIELD_AGENT_MONTHLY}}/month) are billed at the start of each cycle. We do not provide prorated refunds for cancellations made mid-cycle. On cancellation, access continues until the end of the current paid period, after which your account reverts to the free Analyst tier.

§05 — Annual Subscriptions
Annual Station Chief subscriptions ({{STATION_CHIEF_ANNUAL}}/year) may be refunded within 14 days of the charge, provided fewer than 2 monthly issues have been released since the charge. After 14 days, or once 2 or more issues have been released in your billing period, the annual term is non-refundable except where required by law.

§06 — How to Request a Refund
Email support@briefcase.agency with the subject "REFUND REQUEST" and include: the email on your account, the date of the charge, and a brief reason. We respond within 3 business days. Approved refunds are processed by Paddle to your original payment method and may take 5–10 business days to appear, depending on your bank or card provider.

§07 — Chargebacks
If you initiate a chargeback with your bank or card provider without first contacting us or Paddle, we reserve the right to suspend your account. Most issues can be resolved quickly and directly — please reach out before escalating.

§08 — Free Tier
The Analyst (free) tier requires no payment and is not subject to refund considerations. No card is required to maintain a free account.

§09 — Changes to This Policy
We may modify this Refund Policy at any time. Material changes will be communicated via email or a notice on the Service and apply to charges made after the effective date.

§10 — Contact
Briefcase Intelligence
www.briefcase.agency
support@briefcase.agency
Operating hours: Monday–Friday, 09:00–18:00 GMT+4
```

**Done when:** `/refund` contains no 48-hour clause, all refund windows are internally consistent and none is stricter than 14 days, Paddle is named as MoR, and embedded prices match `lib/pricing.ts`.

---

## Task 4 — Site-wide "not affiliated" disclaimer

Add this text to the global footer component so it renders on every page (style it subtly/small):

```
Briefcase Intelligence is an independent editorial and entertainment publication. It is not affiliated with, endorsed by, or connected to any government, intelligence agency, or military organization. All content is original work or commentary on matters of public record. References to classifications, clearances, and operations are stylistic and fictional unless explicitly sourced.
```

**Done when:** the disclaimer renders in the footer across all routes.

---

## Task 5 — Surface business identity

In the footer or an About section, add the operating business identity next to the existing `support@briefcase.agency` and operating hours:
- Trading name: **Briefcase Intelligence**
- Country of operation: **Georgia**
- Contact: **support@briefcase.agency**

If a registered legal entity name exists anywhere in the repo (env, config, prior legal copy), use it; otherwise use the trading name "Briefcase Intelligence" and leave a clearly-marked `{{LEGAL_ENTITY_NAME}}` token for later fill-in. Do not invent a company registration number.

**Done when:** the public site identifies the operating business and country.

---

## Task 6 — Image & content provenance audit (code-assisted)

You cannot verify licenses, so produce an audit artifact instead of guessing.

1. Enumerate every image asset referenced by the homepage and issue pages (cover art, `SURVEILLANCE PHOTO 01` and any similar placeholders, article imagery). For each, record: file path / source, where it's used, and a provenance status of `ORIGINAL`, `LICENSED`, `AI-GENERATED`, or `UNKNOWN/PLACEHOLDER`.
2. Flag any image that appears to be an AI-generated human face or to use a real person's likeness (Paddle AUP category 16 risk) with `⚠ REVIEW`.
3. Replace any literal placeholder text/image references (e.g. `SURVEILLANCE PHOTO 01`) with a neutral existing asset or a clearly-labeled committed placeholder so no "[PLACEHOLDER]" string ships to production.
4. For "news"-framed articles about named real people (e.g. the Volkov piece), ensure the framing reads as original commentary, not reproduced reporting; if a `LATEST NEWS` label sits on fictional content, relabel it (e.g. `FEATURE` / `DOSSIER`) so it isn't presented as factual news.
5. Write the findings to `IMAGE_AUDIT.md` at the repo root.

**Done when:** `IMAGE_AUDIT.md` lists every image with a provenance status, all `⚠ REVIEW` items are flagged, and no placeholder image strings remain in production pages.

---

## Task 7 — Final consistency sweep & build

1. Re-grep for: stray old prices (`19.99`, `99.99` outside config), `Flitt`/`FLITT`, `48 hours`, `48-hour`, and any tier-name typos.
2. Run `next build` (and the project's lint/typecheck). Fix every error introduced by the refactor.
3. Confirm home, `/refund`, `/terms`, and `/clearance` all render the same prices and all name Paddle.

**Done when:** clean build with no type/lint errors and zero stale references.

---

## Final report (output this when finished)

Print a concise summary containing:
1. **Canonical pricing chosen** (the exact amounts) and which rule from Task 1 selected them — call this out clearly so it can be overridden if wrong.
2. Files created and files modified.
3. Any `⚠ REVIEW` image items and any `{{LEGAL_ENTITY_NAME}}` token left for manual fill-in.
4. Build status (pass/fail) and any remaining manual steps (e.g. setting Paddle `paddlePriceId` values once products are created in the Paddle dashboard).

Do all of the above without pausing for confirmation. Commit the changes on a branch named `paddle-verification-fixes` with clear, atomic commits per task.





