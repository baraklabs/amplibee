import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { agentUpgrade: 'security' },
  async redirects() {
    return [
      { source: '/guides', destination: '/blog', permanent: true },
      { source: '/guides/:slug', destination: '/blog/:slug', permanent: true },
      // the case studies were replaced by the features pages
      { source: '/case-studies', destination: '/features', permanent: true },
      { source: '/case-studies/:slug*', destination: '/features', permanent: true },
      { source: '/blog/how-answer-engines-pick-products', destination: '/blog/how-to-get-chatgpt-to-suggest-your-product', permanent: true },
      { source: '/blog/first-mentions', destination: '/blog', permanent: true },
      { source: '/features/mentions-and-campaigns', destination: '/features', permanent: true },
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
