import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog/posts";
import { FEATURE_LIST } from "@/lib/features-data";
import { siteConfig } from "@/lib/seo/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/features",
    "/channels",
    "/pricing",
    "/about",
    "/blog",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const featureRoutes = FEATURE_LIST.map((feature) => ({
    url: `${siteConfig.url}/features/${feature.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes, ...featureRoutes];
}
