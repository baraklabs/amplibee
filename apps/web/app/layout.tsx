import type { Metadata, Viewport } from 'next'
import { Caveat, Geist, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import './globals.css'
import './tracker.css'
import './social.css'
import './auth-flip.css'
import './features.css'
import './cookie.css'
import './dashboard.css'
import { CookieConsent } from '../components/CookieConsent.tsx'
import { GoogleAnalytics } from '../components/GoogleAnalytics.tsx'
import { Footer } from '../components/Footer.tsx'
import { Header } from '../components/Header.tsx'
import { JsonLd } from '../components/JsonLd.tsx'
import { SITE } from '../lib/config.ts'
import { organization, website } from '../lib/jsonld.ts'
import { OG_ALT, OG_DEFAULT } from '../lib/seo.ts'

const ui = Geist({ subsets: ['latin'], variable: '--font-ui', display: 'swap', weight: ['400', '600', '700'] })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap', weight: ['400'], preload: false })
const hand = Caveat({ subsets: ['latin'], variable: '--font-hand', display: 'swap', weight: ['500'], preload: false })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Amplibee: free visibility check for your product', template: '%s | Amplibee' },
  description: 'Enter your product website. Amplibee checks directories, search indexing, mentions, technical SEO and trust signals, compares you with your competitors and lists what to fix.',
  applicationName: SITE.name,
  generator: 'Next.js',
  keywords: ['product visibility check', 'startup directories', 'SaaS launch checklist', 'AI search visibility', 'answer engine optimization', 'generative engine optimization', 'SEO audit for founders'],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: 'technology',
  formatDetection: { email: false, address: false, telephone: false },
  manifest: '/manifest.webmanifest',
  openGraph: { type: 'website', siteName: SITE.name, locale: 'en_US', url: SITE.url, title: 'Amplibee: free visibility check for your product', description: 'Check how visible your product is online, compare it with competitors and get a fix list.', images: [{ url: OG_DEFAULT.path, width: OG_DEFAULT.width, height: OG_DEFAULT.height, alt: OG_ALT }] },
  twitter: { card: 'summary_large_image', title: 'Amplibee: free visibility check for your product', description: 'Check how visible your product is online, compare it with competitors and get a fix list.', images: [OG_DEFAULT.path] },
  alternates: { canonical: '/', types: { 'text/plain': [{ url: '/llms.txt', title: 'LLM-readable site summary' }] } },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION, other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined },
}

export const viewport: Viewport = { themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f6f5f3' }, { media: '(prefers-color-scheme: dark)', color: '#151514' }], width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${ui.variable} ${mono.variable} ${hand.variable}`}>
      <head>
        <GoogleAnalytics />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CookieConsent />
        <JsonLd data={[organization, website]} />
      </body>
    </html>
  )
}
