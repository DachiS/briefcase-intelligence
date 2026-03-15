// src/app/api/issues/[id]/read/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/auth'
export const dynamic = 'force-dynamic'

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