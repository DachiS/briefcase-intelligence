// src/app/api/issues/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const hasSubscription = user.subscriptions.length > 0

    const issues = await prisma.issue.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        coverImage: true,
        issueNumber: true,
        publishedAt: true,
        // Only include pdfKey if subscribed
        ...(hasSubscription ? { pdfKey: true } : {}),
      },
    })

    return NextResponse.json({ issues, hasSubscription })
  } catch (error) {
    console.error('Issues error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
