# Image & Content Provenance Audit

DOC REF: BI-LEGAL-IMG-AUDIT-2026
Last updated: 2026-05-30
Scope: homepage (`src/app/page.tsx`), issue archive (`src/app/issues/page.tsx`),
issue reader (`src/app/issues/[id]/page.tsx`), and shared components/layout.

## Summary

The site ships **no committed raster image assets** — there is no `public/`
directory and no bundled photographs or illustrations. Every visual on the
marketing and editorial pages is generated from code: CSS gradients, inline SVG,
data-URI SVG textures, Unicode/emoji glyphs, and Google Fonts. The only
user-visible raster images are **admin-uploaded issue cover images** (and the
issue PDFs themselves) served from private S3, whose provenance depends entirely
on what the operator uploads.

No AI-generated human faces and no real-person photographs were found anywhere in
the codebase.

## Inventory

| # | Asset / reference | Location | Type | Provenance |
|---|---|---|---|---|
| 1 | Hero globe (`SpyGlobe`) | `page.tsx` → `src/components/SpyGlobe.tsx` | Procedurally rendered in code (no external image) | ORIGINAL |
| 2 | Hero crosshair + live-feed coordinates panel | `page.tsx` | Inline SVG + text | ORIGINAL |
| 3 | Magazine "cover" mock (Issue 001) | `page.tsx` | CSS gradient + SVG barcode + text | ORIGINAL |
| 4 | Featured-article image box | `page.tsx` | CSS gradient; **was** the placeholder caption `[SURVEILLANCE PHOTO 01]` | PLACEHOLDER → replaced (see Actions) |
| 5 | Pricing tier envelope flaps / wax seals | `page.tsx` | Inline SVG | ORIGINAL |
| 6 | Background noise / grid textures | `src/app/globals.css` | Data-URI SVG (`feTurbulence`) | ORIGINAL |
| 7 | Marquee, stamps, dotted dividers | `page.tsx` + CSS | Text + CSS | ORIGINAL |
| 8 | Issue cover images | `issues/page.tsx` — `<img src={issue.coverImage}>` | Raster, admin-uploaded to S3 | UNKNOWN / ADMIN-SUPPLIED — ⚠ REVIEW |
| 9 | Issue document (PDF) | `issues/[id]/page.tsx` — `<iframe src={signedPdfUrl}>` | Admin-uploaded PDF (S3 signed URL) | UNKNOWN / ADMIN-SUPPLIED — ⚠ REVIEW |
| 10 | Dashboard ID-card avatar | `dashboard/page.tsx` | Inline SVG silhouette | ORIGINAL |
| 11 | Clearance assessment tiles | `clearance/page.tsx` | Unicode/system emoji (🕵️ 📁 🔐 …) | ORIGINAL |

## ⚠ REVIEW items

- **Issue cover images (#8) and issue PDFs (#9)** are uploaded by the admin via
  pre-signed S3 URLs. The codebase cannot verify their licenses. The operator
  must ensure every uploaded cover and PDF is original, licensed, or
  public-domain, and contains **no AI-generated likeness of a real person**
  (Paddle AUP category 16 risk).
- **"Missing Russian Businessman / Dmitri Volkov" (homepage featured piece)** — a
  named individual previously presented under a `LATEST NEWS` label. This is
  original fictional/editorial commentary, **not** reproduced reporting.
  - *Action taken:* relabeled `LATEST NEWS` → `DOSSIER` (both the article data
    and the rendered file label) so fiction is not framed as factual news.
  - *Still to confirm:* that "Dmitri Volkov" does not correspond to an
    identifiable real person before publishing.

## Actions taken

- Replaced the literal placeholder caption `[SURVEILLANCE PHOTO 01]` (homepage
  featured-article box) with the neutral editorial caption
  `SURVEILLANCE FILE — IMAGE WITHHELD`. No bracketed `[PLACEHOLDER]`-style string
  ships to production pages.
- Relabeled the Volkov feature from `LATEST NEWS` to `DOSSIER` so fictional
  content is not presented as factual news.

## Notes (non-blocking)

- `next.config.js` `images.domains` currently hold placeholder values
  (`your-s3-bucket.s3.amazonaws.com`). Issue covers render through a raw `<img>`
  tag (not `next/image`), so this does not block them today, but the domains
  should be pointed at the real S3 bucket if `next/image` is adopted later.
