// src/app/layout.tsx
import type { Metadata } from 'next'
import { Barlow_Condensed, Barlow, Share_Tech_Mono } from 'next/font/google'
import './globals.css'
import NextAuthProvider from '@/components/SessionProvider'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

const barlow = Barlow({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Briefcase Intelligence — Exclusive Intelligence Insights',
  description:
    'The premier intelligence magazine. Declassified operations, tradecraft, and stories that never made the headlines.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${barlowCondensed.variable} ${barlow.variable} ${shareTechMono.variable} antialiased`}
        style={{ background: '#0d1117', color: '#e8e6e1' }}
      >
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  )
}
