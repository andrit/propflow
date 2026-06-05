import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { PwaInit } from '@/components/PwaInit'
import './globals.css'

export const viewport: Viewport = {
  themeColor:   '#4f46e5',
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title:       'propflow — Professional Proposals in Minutes',
  description: 'Create polished, branded PDF proposals with a simple wizard. Win more clients.',
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:        true,
    statusBarStyle: 'default',
    title:          'propflow',
  },
  icons: {
    icon:  [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-white text-gray-900 antialiased">
          {children}
          <PwaInit />
        </body>
      </html>
    </ClerkProvider>
  )
}
