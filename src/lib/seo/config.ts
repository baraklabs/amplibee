export const siteConfig = {
  name: "Oyekool",
  tagline: "Schedule and cross-post to every social channel from one place",
  description:
    "Oyekool is a social media scheduling and cross-posting tool. Write once, plan your calendar, and publish to X, LinkedIn, YouTube, Instagram, and Facebook from a single composer — with more platforms coming soon.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://oyekool.com",
  locale: "en_US",
  twitterHandle: "@baraklabs",
  keywords: [
    "Oyekool",
    "social media scheduler",
    "cross posting tool",
    "schedule social media posts",
    "post to multiple platforms",
    "content calendar",
    "X LinkedIn YouTube Instagram Facebook scheduler",
    "AI caption generator",
    "social media management tool",
    "Postiz alternative",
    "Buffer alternative",
    "Hootsuite alternative",
  ],
  company: "Baraklabs",
  contactEmail: "info@oyekool.com",
  links: {
    x: "https://x.com/baraklabs",
    linkedin: "https://www.linkedin.com/company/baraklabs",
    youtube: "https://www.youtube.com/@baraklabs",
  },
  stats: {
    users: "10,000+",
    platforms: "5",
  },
} as const;

export type SiteConfig = typeof siteConfig;
