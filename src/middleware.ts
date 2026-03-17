// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const ACCESS_CODE = process.env.SITE_ACCESS_CODE || 'briefcase'
const COOKIE_NAME = 'site_access'
const PUBLIC_PATHS = ['/api/site-access', '/_next', '/favicon.ico']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths through
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check if user has access cookie
  const accessCookie = req.cookies.get(COOKIE_NAME)?.value
  if (accessCookie === ACCESS_CODE) {
    return NextResponse.next()
  }

  // Show coming soon page
  const url = req.nextUrl.clone()
  url.pathname = '/api/site-access/page'
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
