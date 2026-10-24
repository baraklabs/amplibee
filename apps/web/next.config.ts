import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { agentUpgrade: 'security' },
  async redirects() {
    return [
      { source: '/guides', destination: '/blog', permanent: true },
      { source: '/guides/:slug', destination: '/blog/:slug', permanent: true },
      // earlier case study addresses, which were replaced by the use case pages
      { source: '/case-studies/check-:rest', destination: '/case-studies', permanent: false },
      { source: '/case-studies/:slug(project-management|website-analytics|developer-email|product-analytics|app-hosting|backend-platform|scheduling|user-sign-in|indiecrew|nativeship|edgevolume|stas)', destination: '/case-studies', permanent: false },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default config
