import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowRight,
  Rocket,
  GitBranch,
  Megaphone,
  Newspaper,
  FileText,
  Users,
  Link2,
  Wand2,
  Play,
  Workflow,
  Key,
  TrendingUp,
  Code2,
  Users2,
  Link as LinkIcon,
  GitMerge,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowMap } from "@/components/marketing/workflow-map";
import { SectionHeading } from "@/components/marketing/section-heading";
import { PromoCard } from "@/components/marketing/promo-card";
import { JsonLd } from "@/components/seo/json-ld";
import { softwareApplicationJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/config";
import { getBlockColor } from "@/lib/block-colors";
import { getLatestPosts } from "@/lib/blog/posts";
import { FEATURE_LIST } from "@/lib/features-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
});

const useCases = [
  { icon: Rocket, label: "Product launches" },
  { icon: GitBranch, label: "GitHub stars" },
  { icon: Megaphone, label: "Product Hunt launches" },
  { icon: FileText, label: "Blog posts" },
  { icon: Newspaper, label: "Announcements" },
  { icon: Wand2, label: "New features" },
  { icon: Users, label: "Founder updates" },
  { icon: Link2, label: "Marketing campaigns" },
];

const featureIcons: Record<string, typeof FileText> = {
  "content-transformation-engine": Sparkles,
  "content-profiles": Wand2,
  "bring-your-own-ai-key": Key,
  "multiple-accounts-per-platform": Users2,
  "auto-generated-backlinks": LinkIcon,
  workflows: Workflow,
  "manual-approval": ShieldCheck,
  "quick-edits": GitMerge,
};

const exploreFeatures = FEATURE_LIST.slice(0, 2).map((feature) => ({
  href: `/features/${feature.slug}`,
  color: feature.color,
  icon: featureIcons[feature.slug] ?? Workflow,
  image: feature.thumbnail,
  eyebrow: "Feature",
  title: feature.title,
  description: feature.description,
}));

const blogCategoryIcons: Record<string, typeof FileText> = {
  Growth: TrendingUp,
  Product: Wand2,
  Engineering: Code2,
  Marketing: Megaphone,
};

export default function HomePage() {
  const latestPosts = getLatestPosts(2);

  return (
    <>
      <JsonLd data={softwareApplicationJsonLd()} />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pb-24 sm:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="text-eyebrow">Marketing operating system for launches</p>
              <h1 className="font-heading mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Marketing muscle for your products.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Publish once, turn it into platform-native posts, build backlinks, and get influencers to promote it.
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

              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
                <div>
                  <dt className="text-eyebrow">Network reach</dt>
                  <dd className="font-heading mt-1 text-2xl font-semibold text-foreground">
                    {siteConfig.stats.users}{" "}
                    <span className="text-base font-normal text-muted-foreground">users</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-eyebrow">Amplification</dt>
                  <dd className="font-heading mt-1 text-2xl font-semibold text-foreground">
                    {siteConfig.stats.influencers}{" "}
                    <span className="text-base font-normal text-muted-foreground">influencers</span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-blue-400/25 blur-3xl"
              />
              <div className="overflow-hidden rounded-lg border border-border">
                <Image
                  src="/hero-workflow.png"
                  alt="One post fans out to X, LinkedIn, Facebook, and YouTube, then rolls up into analytics"
                  width={1355}
                  height={1160}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Boost Your Posts */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeading
            eyebrow="Use cases"
            title="Get your launch in front of more eyes when it matters."
            description="Amplibee works anywhere you'd otherwise be manually rewriting the same update for every channel."
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

      {/* Multi-Platform Reach */}
      <section id="integrations" className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeading
            eyebrow="Multi-platform reach"
            title="One post. Multiple platforms."
            description="Connect multiple accounts and choose exactly which platforms each source should flow into."
          />
          <div className="mt-10">
            <WorkflowMap />
          </div>
        </div>
      </section>

      {/* Auto Cross-Posting */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-eyebrow">Auto cross-post, free</p>
            <h2 className="font-heading mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Publish once and let Amplibee create platform-specific versions for the channels
              you choose.
            </h2>
            <ul className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground">
              {[
                "Pick a source and one or more destinations",
                "Review an AI-generated, platform-native draft",
                "Edit anything before it goes out",
                "Publish now, schedule, or save as a draft",
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
                &ldquo;Shipped v2 of our onboarding flow — 40% faster signup, fewer drop-offs.&rdquo;
              </p>
              <div className="rounded-md bg-block-violet-bg p-3">
                <p className="text-xs font-medium text-block-violet-fg">→ LinkedIn version</p>
                <p className="mt-1">
                  More context on the problem, why it mattered, and what changed under the hood.
                </p>
              </div>
              <div className="rounded-md bg-block-emerald-bg p-3">
                <p className="text-xs font-medium text-block-emerald-fg">→ Medium version</p>
                <p className="mt-1">Expanded into a short write-up with headings and a walkthrough.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Backlinks */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeading
            eyebrow="Auto-generated backlinks"
            title="Turn one launch into content that links back to you."
            description="Generated posts on Medium, Substack, and LinkedIn can link back to your website, launch page, GitHub repo, or Product Hunt page — with anchor text and UTMs you control."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-4">
            {[
              { label: "Canonical URL", desc: "Where the content originally lives" },
              { label: "Destination URL", desc: "Where the backlink points to" },
              { label: "Anchor text", desc: "Exactly how the link reads" },
              { label: "UTM parameters", desc: "Track what each post drives" },
            ].map((field, index) => {
              const color = getBlockColor(index + 2);
              return (
                <div key={field.label} className={cn("rounded-md p-4", color.bg)}>
                  <p className={cn("text-sm font-medium", color.fg)}>{field.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{field.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Network */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <p className="text-eyebrow">Influencer campaigns</p>
          <h2 className="font-heading mx-auto mt-3 max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Want more reach? Run an influencer campaign to {siteConfig.stats.influencers} real creators who post genuinely to their own audience.
          </h2>
          <Button variant="outline" className="mt-7" asChild>
            <Link href="/network">
              Explore influencer campaigns
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Mid-page CTA */}
      <section className="border-b border-border bg-block-violet-fg/85">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center sm:py-16">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Your next launch deserves more than one post.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-white/80">
            Connect an account, write it once, and let Amplibee adapt it everywhere.
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
            Create once. Adapt intelligently. Publish everywhere.
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
