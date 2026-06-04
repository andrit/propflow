import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Required for Docker standalone mode — copies only production files into .next/standalone
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.r2.dev https://img.clerk.com https://*.clerk.com",
              "connect-src 'self' https://api.stripe.com https://clerk.accounts.dev https://*.clerk.accounts.dev https://*.r2.cloudflarestorage.com",
              "frame-src https://js.stripe.com",
              "frame-ancestors 'none'",
              "font-src 'self' data:",
              "worker-src 'self' blob:",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
        ],
      },
    ]
  },
}

export default nextConfig
