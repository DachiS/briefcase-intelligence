// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasSubscription: user.subscriptions.length > 0,
        subscription: user.subscriptions[0] || null,
      },
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
