export const siteConfig = {
  name: "Amplibee",
  tagline: "Marketing muscle for your products.",
  description:
    "Amplibee turns one post into platform-native content for X, LinkedIn, Medium, and Substack, and generates backlinks for every launch.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://amplibee.com",
  locale: "en_US",
  twitterHandle: "@baraklabs",
  keywords: [
    "Amplibee",
    "product launch marketing",
    "cross-posting tool",
    "content repurposing",
    "social media automation",
    "Product Hunt launch",
    "backlink generation",
    "X to LinkedIn",
    "content distribution",
    "publish once, post everywhere",
    "AI content repurposing",
    "bring your own AI key",
  ],
  company: "Baraklabs",
  contactEmail: "info@amplibee.com",
  links: {
    x: "https://x.com/baraklabs",
    linkedin: "https://www.linkedin.com/company/baraklabs",
    youtube: "https://www.youtube.com/@baraklabs",
  },
  stats: {
    users: "10,000+",
    influencers: "1.2M+",
  },
} as const;

export type SiteConfig = typeof siteConfig;
