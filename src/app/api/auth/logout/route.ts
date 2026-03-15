// src/app/api/auth/logout/route.ts
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' })
  response.cookies.delete('auth-token')
  return response
}
