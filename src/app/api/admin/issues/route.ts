// src/app/api/admin/issues/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, description, coverImage, pdfKey, issueNumber, publishedAt, isPublished } =
      await req.json()

    if (!title || !pdfKey || !issueNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        coverImage,
        pdfKey,
        issueNumber: Number(issueNumber),
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        isPublished: isPublished ?? false,
      },
    })

    return NextResponse.json({ issue })
  } catch (error) {
    console.error('Create issue error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const issues = await prisma.issue.findMany({
      orderBy: { issueNumber: 'desc' },
    })

    return NextResponse.json({ issues })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
