export const dynamic = 'force-dynamic'
// src/app/api/issues/[id]/pdf/route.ts
//
// Streams a subscriber's issue PDF with a per-user watermark baked in. The raw
// S3 URL is never exposed to the browser; the PDF is fetched server-side,
// stamped with the reader's OPERATIVE ID (not their email — pseudonymous but
// traceable), and returned. Used both for the in-browser reader (inline) and
// the download button (?download=1). Any leaked copy is attributable.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getPDFBuffer } from '@/lib/s3'
import { operativeId } from '@/lib/identity'
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'

// Small per-instance cache of the RAW (un-watermarked) issue bytes keyed by the
// S3 key, so repeat opens skip the slow S3 round-trip. Shared across users (the
// per-user watermark is applied after, on every request), so memory stays to
// one copy per issue. Bounded by count + TTL.
const RAW_TTL_MS = 10 * 60 * 1000
const RAW_MAX = 8
const rawCache = new Map<string, { bytes: Buffer; exp: number }>()

async function getRawPdf(key: string, fetchFn: (k: string) => Promise<Buffer>): Promise<Buffer> {
  const hit = rawCache.get(key)
  if (hit && hit.exp > Date.now()) return hit.bytes
  const bytes = await fetchFn(key)
  rawCache.set(key, { bytes, exp: Date.now() + RAW_TTL_MS })
  if (rawCache.size > RAW_MAX) rawCache.delete(rawCache.keys().next().value as string)
  return bytes
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.subscriptions.length === 0) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 403 })
    }

    const issue = await prisma.issue.findUnique({ where: { id, isPublished: true } })
    if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 })

    const raw = await getRawPdf(issue.pdfKey, getPDFBuffer)
    const pdf = await PDFDocument.load(raw, { updateMetadata: false })
    const font = await pdf.embedFont(StandardFonts.Helvetica)

    const opId = operativeId(user.id)
    const stamp = `${opId}  ·  ISSUE ${String(issue.issueNumber).padStart(3, '0')}`

    // Tile the watermark diagonally across every page at low opacity — visible
    // enough to deter sharing, faint enough not to obscure the content.
    for (const page of pdf.getPages()) {
      const { width, height } = page.getSize()
      const size = 11
      const stepX = 250
      const stepY = 150
      for (let y = -80; y < height + 80; y += stepY) {
        for (let x = -80; x < width + 80; x += stepX) {
          page.drawText(stamp, {
            x,
            y,
            size,
            font,
            color: rgb(0.5, 0.5, 0.55),
            opacity: 0.1,
            rotate: degrees(-30),
          })
        }
      }
    }

    const out = await pdf.save()
    const download = req.nextUrl.searchParams.get('download') === '1'
    const filename = `briefcase-issue-${String(issue.issueNumber).padStart(3, '0')}.pdf`

    return new NextResponse(Buffer.from(out), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${filename}"`,
        // Never cache the personalized copy in shared/proxy caches.
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('Issue PDF error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
