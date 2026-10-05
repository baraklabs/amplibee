import { siteConfig } from "./config";
import { FEATURE_LIST } from "@/lib/features-data";
import { absoluteUrl } from "./metadata";

const ORG_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.name,
    alternateName: siteConfig.company,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon-mark.png"),
    },
    email: siteConfig.contactEmail,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: siteConfig.contactEmail,
      url: absoluteUrl("/contact"),
    },
    parentOrganization: { "@type": "Organization", name: siteConfig.company },
    sameAs: [siteConfig.links.x, siteConfig.links.linkedin, siteConfig.links.youtube],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    alternateName: `${siteConfig.name} — ${siteConfig.tagline}`,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${siteConfig.url}/#software`,
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Social media automation and content repurposing",
    operatingSystem: "Web",
    description: siteConfig.description,
    url: siteConfig.url,
    image: absoluteUrl("/icon-mark.png"),
    featureList: FEATURE_LIST.map((feature) => feature.title),
    publisher: { "@id": ORG_ID },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      category: "Freemium",
    },
  };
}

type WebPageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";

export function webPageJsonLd(input: {
  title: string;
  description: string;
  path: string;
  type?: WebPageType;
  /** Set on detail pages so answer engines can tie the page to the entity it describes. */
  about?: object;
}) {
  return {
    "@context": "https://schema.org",
    "@type": input.type ?? "WebPage",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    ...(input.about ? { about: input.about } : {}),
  };
}

/** An ordered list of pages, for index/collection pages (blog, features, platforms). */
export function itemListJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

/** One priced Offer per plan, attached to the product so pricing shows up in rich results and AI answers. */
export function pricingJsonLd(plans: { name: string; price: string; description: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/pricing"),
    offers: plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      description: plan.description,
      price: plan.price.replace(/[^0-9.]/g, "") || "0",
      priceCurrency: "USD",
      url: absoluteUrl("/pricing"),
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  image: string;
  author: string;
  publishedTime: string;
  modifiedTime: string;
  section?: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: [absoluteUrl(input.image)],
    author: /team/i.test(input.author)
      ? { "@type": "Organization", name: siteConfig.name, url: siteConfig.url }
      : { "@type": "Person", name: input.author },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en",
    ...(input.section ? { articleSection: input.section } : {}),
    ...(input.keywords?.length ? { keywords: input.keywords.join(", ") } : {}),
    datePublished: input.publishedTime,
    dateModified: input.modifiedTime,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(input.path) },
  };
}
