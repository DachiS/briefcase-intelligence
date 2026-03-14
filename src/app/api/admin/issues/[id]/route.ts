// src/app/api/admin/issues/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteS3Object } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const issue = await prisma.issue.findUnique({ where: { id } })
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    if (issue.pdfKey) {
      await deleteS3Object(issue.pdfKey)
    }

    if (issue.coverImage && issue.coverImage.includes('amazonaws.com')) {
      const coverKey = issue.coverImage.split('.amazonaws.com/')[1]
      if (coverKey) await deleteS3Object(coverKey)
    }

    await prisma.issue.delete({ where: { id } })
    return NextResponse.json({ message: 'Issue deleted successfully' })
  } catch (error) {
    console.error('Delete issue error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
