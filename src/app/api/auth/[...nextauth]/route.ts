// src/app/api/auth/[...nextauth]/route.ts
export const dynamic = 'force-dynamic'

import NextAuth from 'next-auth'
export const dynamic = 'force-dynamic'

import GoogleProvider from 'next-auth/providers/google'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const existing = await prisma.user.findUnique({
            where: { email: user.email!.toLowerCase() },
          })

          if (!existing) {
            await prisma.user.create({
              data: {
                email: user.email!.toLowerCase(),
                name: user.name || 'Operative',
                password: '',
                emailVerified: true,
              },
            })
          }
          return true
        } catch (error) {
          console.error('Google sign in error:', error)
          return false
        }
      }
      return true
    },

    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email.toLowerCase() },
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' },
              take: 1,
            },
          },
        })
        if (dbUser) {
          (session.user as any).id = dbUser.id;
          (session.user as any).role = dbUser.role;
          (session.user as any).hasSubscription = dbUser.subscriptions.length > 0
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})

export { handler as GET, handler as POST }
