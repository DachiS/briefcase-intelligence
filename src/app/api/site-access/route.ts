// src/app/api/site-access/route.ts
import { NextRequest, NextResponse } from 'next/server'

const ACCESS_CODE = process.env.SITE_ACCESS_CODE || 'briefcase'
const COOKIE_NAME = 'site_access'

export async function POST(req: NextRequest) {
  const { code } = await req.json()

  if (code === ACCESS_CODE) {
    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, ACCESS_CODE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    return response
  }

  return NextResponse.json({ success: false, error: 'Invalid access code' }, { status: 401 })
}
