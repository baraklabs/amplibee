import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarDays,
  Wand2,
  Link as LinkIcon,
  BarChart3,
  Users,
  ShieldCheck,
  Play,
  TrendingUp,
  Code2,
  Megaphone,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowMap } from "@/components/marketing/workflow-map";
import { SectionHeading } from "@/components/marketing/section-heading";
import { PromoCard } from "@/components/marketing/promo-card";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { JsonLd } from "@/components/seo/json-ld";
import { softwareApplicationJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/config";
import { platformDefinitions, upcomingPlatforms } from "@/lib/platforms/registry";
import { getBlockColor } from "@/lib/block-colors";
import { blogPosts } from "@/lib/blog/posts";
import { FEATURE_LIST } from "@/lib/features-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
});

const useCases = [
  { icon: Megaphone, label: "Brand & marketing teams" },
  { icon: TrendingUp, label: "Solo creators" },
  { icon: Users, label: "Agencies & clients" },
  { icon: Sparkles, label: "Founders building in public" },
];

const featureIcons: Record<string, typeof FileText> = {
  "cross-posting-composer": Wand2,
  "brand-profile": FileText,
  "connected-accounts": LinkIcon,
  "post-analytics": BarChart3,
  "content-calendar": CalendarDays,
  "team-approvals": ShieldCheck,
};

const exploreFeatures = FEATURE_LIST.slice(0, 2).map((feature) => ({
  href: `/features/${feature.slug}`,
  color: feature.color,
  icon: featureIcons[feature.slug] ?? Megaphone,
  image: feature.thumbnail,
  eyebrow: "Feature",
  title: feature.title,
  description: feature.description,
}));

const blogCategoryIcons: Record<string, typeof FileText> = {
  Growth: TrendingUp,
  Product: Sparkles,
  Engineering: Code2,
  Marketing: Megaphone,
};

const howItWorks = [
  {
    title: "Connect your accounts",
    description:
      "Link your X, LinkedIn, YouTube, Instagram, and Facebook accounts once — more platforms are on the way.",
  },
  {
    title: "Write once, or let AI draft it",
    description:
      "Compose a post and Oyekool adapts it per platform, or generate a starting draft from your saved brand profile.",
  },
  {
    title: "Plan it on the calendar",
    description:
      "Schedule a post for the right time on each platform, or publish immediately — your call, post by post.",
  },
  {
    title: "Track what worked",
    description:
      "See how each post performed on every platform it went out to, in one dashboard instead of five.",
  },
];

export default function HomePage() {
  // Same order as the /blog list and the features list — no date re-sorting here.
  const latestPosts = blogPosts.slice(0, 2);

  return (
    <>
      <JsonLd data={softwareApplicationJsonLd()} />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pb-24 sm:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="text-eyebrow">Social media scheduling & cross-posting</p>
              <h1 className="font-heading mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Write once. Post everywhere.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Oyekool is a cross-posting tool for X, LinkedIn, YouTube, Instagram, and Facebook —
                with more platforms coming soon. Plan your content calendar, draft with AI from
                your brand voice, and publish everywhere from one composer.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/login?mode=signup">
                    Get started for free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/features">
                    <Play className="size-4" />
                    See how it works
                  </Link>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                {platformDefinitions.map((platform) => (
                  <div
                    key={platform.id}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5"
                  >
                    <PlatformIcon platform={platform.id} className="size-4" />
                    <span className="text-xs font-medium text-foreground">{platform.name}</span>
                  </div>
                ))}
                <span className="text-xs text-muted-foreground">+ {upcomingPlatforms.join(", ")} soon</span>
              </div>
            </div>

            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-blue-400/25 blur-3xl"
              />
              <div className="overflow-hidden rounded-lg border border-border">
                <Image
                  src="/hero-create-campaign.png"
                  alt="A post composed once in Oyekool going out to LinkedIn, Instagram, X, Facebook, and YouTube"
                  width={1355}
                  height={1161}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeading
            eyebrow="Who it's for"
            title="Built for anyone posting the same message to more than one platform."
            description="Oyekool fits a solo creator's weekly rhythm just as well as a team managing several brand accounts."
          />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {useCases.map(({ icon: Icon, label }, index) => {
              const color = getBlockColor(index);
              return (
                <div
                  key={label}
                  className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-4 py-6 text-center"
                >
                  <div className={cn("flex size-16 items-center justify-center rounded-xl", color.bg)}>
                    <Icon className={cn("size-8", color.fg)} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeading
            eyebrow="How it works"
            title="One draft. Every platform. No duplicate work."
            description="Connect your accounts, write once, and let Oyekool handle the per-platform adapting and sending."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, index) => (
              <div key={step.title} className="rounded-lg border border-border bg-card p-5">
                <span className="text-eyebrow">Step {index + 1}</span>
                <h3 className="font-heading mt-2 text-[15px] font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* One post, many platforms */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeading
            eyebrow="One draft, every platform"
            title="A single post reaches every platform you pick — adapted, not just duplicated."
            description="Write it once. Oyekool shapes it for X, LinkedIn, YouTube, Instagram, and Facebook before it goes out."
          />
          <div className="mt-10">
            <WorkflowMap />
          </div>
        </div>
      </section>

      {/* Composer preview */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-eyebrow">One composer</p>
            <h2 className="font-heading mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Write it once. Fine-tune it per platform. Send or schedule it.
            </h2>
            <ul className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground">
              {[
                "One draft, adapted automatically for each platform's format and length",
                "Attach media once — it carries across every platform you post to",
                "Schedule a different send time per platform, or publish instantly",
                "AI drafts a starting point from your saved brand profile, you stay in control",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <Button className="mt-7" asChild>
              <Link href="/login?mode=signup">
                Get started for free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm font-medium text-foreground">Composer preview</span>
              <span className="text-xs text-muted-foreground">Draft</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p className="text-foreground">
                &ldquo;We just shipped dark mode. Here&apos;s the before/after.&rdquo;
              </p>
              <div className="rounded-md bg-block-violet-bg p-3">
                <p className="text-xs font-medium text-block-violet-fg">→ X</p>
                <p className="mt-1">Shortened to the sharpest line, image attached, posting now.</p>
              </div>
              <div className="rounded-md bg-block-sky-bg p-3">
                <p className="text-xs font-medium text-block-sky-fg">→ LinkedIn</p>
                <p className="mt-1">Expanded with context on why it shipped, scheduled for 9am.</p>
              </div>
              <div className="rounded-md bg-block-emerald-bg p-3">
                <p className="text-xs font-medium text-block-emerald-fg">→ Instagram</p>
                <p className="mt-1">Caption trimmed, before/after image as the visual, scheduled for 7pm.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <p className="text-eyebrow">Platforms</p>
          <h2 className="font-heading mx-auto mt-3 max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Five platforms today. More on the way.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-muted-foreground">
            X, LinkedIn, YouTube, Instagram, and Facebook are live. {upcomingPlatforms.join(", ")} are
            next on the roadmap.
          </p>
          <Button variant="outline" className="mt-7" asChild>
            <Link href="/channels">
              See all channels
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Mid-page CTA */}
      <section className="border-b border-border bg-block-violet-fg/85">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center sm:py-16">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Stop logging into five apps to post the same update.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-white/80">
            Connect your accounts, write once, and let Oyekool handle the rest — scheduling,
            adapting, and tracking.
          </p>
          <Button size="lg" variant="accent" className="mt-7" asChild>
            <Link href="/login?mode=signup">
              Get started for free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Explore more: features + blog */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeading eyebrow="Explore more" title="Features and Blog" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestPosts.flatMap((post, index) => [
              <PromoCard
                key={post.slug}
                href={`/blog/${post.slug}`}
                color={post.color}
                icon={blogCategoryIcons[post.category] ?? FileText}
                image={post.thumbnail}
                eyebrow={post.category}
                title={post.title}
                description={post.description}
              />,
              exploreFeatures[index] && (
                <PromoCard key={exploreFeatures[index].title} {...exploreFeatures[index]} />
              ),
            ])}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Write once. Schedule it. Post everywhere.
          </h2>
          <Button size="lg" className="mt-7" asChild>
            <Link href="/login?mode=signup">
              Get started for free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
