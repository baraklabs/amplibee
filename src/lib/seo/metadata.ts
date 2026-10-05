import type { Metadata } from "next";
import { siteConfig } from "./config";

/** Branded static card used for the home page / site-wide default. */
export const DEFAULT_OG_IMAGE = "/og-default.jpg";

interface PageMetadataInput {
  title: string;
  description: string;
  path?: string;
  image?: string;
  eyebrow?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
  noIndex?: boolean;
}

/**
 * Builds consistent metadata (title, description, canonical, OG, Twitter)
 * for a page. Every public route should call this rather than hand-rolling
 * a Metadata object, so titles/OG/canonicals stay consistent site-wide.
 */
export function pageMetadata({
  title,
  description,
  path = "/",
  image,
  eyebrow,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  section,
  tags,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const ogImageParams = new URLSearchParams({ title });
  if (eyebrow) ogImageParams.set("eyebrow", eyebrow);
  const ogImage = image
    ? new URL(image, siteConfig.url).toString()
    : path === "/"
      ? new URL(DEFAULT_OG_IMAGE, siteConfig.url).toString()
      : new URL(`/api/og?${ogImageParams.toString()}`, siteConfig.url).toString();
  const fullTitle = path === "/" ? title : `${title} · ${siteConfig.name}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": absoluteUrl("/feed.xml"),
      },
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: siteConfig.locale,
      type,
      publishedTime,
      modifiedTime,
      authors,
      section,
      tags,
    } as Metadata["openGraph"],
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
    },
  };
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}
