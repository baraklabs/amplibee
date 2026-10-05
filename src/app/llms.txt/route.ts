import { blogPosts } from "@/lib/blog/posts";
import { FEATURE_LIST } from "@/lib/features-data";
import { siteConfig } from "@/lib/seo/config";

/**
 * llms.txt (llmstxt.org convention): a plain-text map of the site for AI
 * crawlers and answer engines, generated from the same data as the sitemap
 * and RSS feed so it never drifts out of sync.
 */
export async function GET() {
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `${siteConfig.name} is built by ${siteConfig.company} for creators, brands, and small teams who want to post to X, LinkedIn, YouTube, Instagram, and Facebook without logging into five separate apps — more platforms are on the roadmap. AI post drafts run on the customer's own OpenAI, Anthropic, or OpenRouter API key (no AI token markup). Full plain-text content: ${siteConfig.url}/llms-full.txt`,
    "",
    "## Product",
    `- [Features](${siteConfig.url}/features): Every feature in Oyekool — a cross-posting composer, a brand profile for AI drafting, connected accounts, post analytics, a content calendar, and team approvals.`,
    `- [Channels](${siteConfig.url}/channels): Every platform Oyekool can schedule and cross-post to — X, LinkedIn, YouTube, Instagram, and Facebook — and what's coming next.`,
    `- [Pricing](${siteConfig.url}/pricing): Plans, connected-account limits, and scheduled-post allowances.`,
    "",
    "## Features",
    ...FEATURE_LIST.map(
      (feature) => `- [${feature.title}](${siteConfig.url}/features/${feature.slug}): ${feature.description}`,
    ),
    "",
    "## Blog",
    ...sortedPosts.map(
      (post) => `- [${post.title}](${siteConfig.url}/blog/${post.slug}): ${post.description}`,
    ),
    "",
    "## Company",
    `- [About](${siteConfig.url}/about)`,
    `- [FAQ](${siteConfig.url}/faq)`,
    `- [Contact](${siteConfig.url}/contact)`,
    `- [Privacy](${siteConfig.url}/privacy)`,
    `- [Terms](${siteConfig.url}/terms)`,
    "",
    "## Feeds",
    `- [RSS feed](${siteConfig.url}/feed.xml)`,
    `- [Sitemap](${siteConfig.url}/sitemap.xml)`,
    `- [Full content for LLMs](${siteConfig.url}/llms-full.txt)`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
