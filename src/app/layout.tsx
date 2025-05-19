import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Layout from '@/components/layout'

export const metadata: Metadata = {
  title: 'The Climb',
  description: 'A glitchy climbing experience',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// const coalition_v2 = localFont({
//   src: [
//     {
//       path: '../assets/fonts/Coalition_v2.ttf',
//       weight: '400',
//       style: 'normal',
//     },
//   ],
//   variable: '--font-coalition_v2',
// })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
