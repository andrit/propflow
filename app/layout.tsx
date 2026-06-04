import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: 'propflow — Professional Proposals in Minutes',
  description: 'Create polished, branded PDF proposals with a simple wizard. Win more clients.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'propflow',
  },
  icons: {
    apple: '/icons/icon-152.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-white text-gray-900 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
