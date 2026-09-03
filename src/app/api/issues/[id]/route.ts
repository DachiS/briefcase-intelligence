export const dynamic = 'force-dynamic'
// src/app/api/issues/[id]/route.ts
//
// Metadata for a SINGLE published issue plus the caller's subscription flag.
// The reader uses this instead of fetching the whole /api/issues list just to
// pick one row — so payload/DB work doesn't grow with the archive. Returns only
// public metadata; the pdfKey and any S3 URL are never exposed here (the watermarked
// bytes are served exclusively by /api/issues/[id]/pdf).

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const hasSubscription = user.subscriptions.length > 0

    const issue = await prisma.issue.findUnique({
      where: { id, isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        coverImage: true,
        issueNumber: true,
        publishedAt: true,
      },
    })
    if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 })

    return NextResponse.json({ issue, hasSubscription })
  } catch (error) {
    console.error('Issue metadata error:', error instanceof Error ? error.message : JSON.stringify(error))
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
