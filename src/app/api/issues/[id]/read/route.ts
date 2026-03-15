export const dynamic = 'force-dynamic'
// src/app/api/issues/[id]/read/route.ts

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

import { getCurrentUser } from '@/lib/auth'

import { getPDFReadUrl } from '@/lib/s3'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const hasSubscription = user.subscriptions.length > 0
    if (!hasSubscription) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 403 })
    }

    const issue = await prisma.issue.findUnique({
      where: { id, isPublished: true },
    })

    if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 })

    const url = await getPDFReadUrl(issue.pdfKey)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Read URL error:', error instanceof Error ? error.message : JSON.stringify(error))
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
