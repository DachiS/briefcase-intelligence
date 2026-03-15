export const dynamic = 'force-dynamic'
// src/app/api/admin/upload-url/route.ts

import { NextRequest, NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth'

import { getUploadPresignedUrl, generateIssueKey, generateCoverKey } from '@/lib/s3'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { type, issueNumber, extension } = await req.json()

    let key: string
    let contentType: string

    if (type === 'pdf') {
      key = generateIssueKey(issueNumber)
      contentType = 'application/pdf'
    } else if (type === 'cover') {
      key = generateCoverKey(issueNumber, extension || 'jpg')
      contentType = `image/${extension || 'jpeg'}`
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const uploadUrl = await getUploadPresignedUrl(key, contentType)

    return NextResponse.json({ uploadUrl, key })
  } catch (error) {
    console.error('Upload URL error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
