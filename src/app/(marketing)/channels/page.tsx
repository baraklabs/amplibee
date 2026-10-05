import type { Metadata } from "next";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { upcomingPlatforms } from "@/lib/platforms/registry";
import type { ReactNode } from "react";

export const metadata: Metadata = pageMetadata({
  title: "Channels",
  description:
    "Every platform Oyekool can schedule and cross-post to today — X, LinkedIn, YouTube, Instagram, and Facebook — and what's coming next.",
  path: "/channels",
});

const channels: { icon: ReactNode; name: string; description: string; goodFor: string }[] = [
  {
    icon: <PlatformIcon platform="x" className="size-8" />,
    name: "X",
    description:
      "Short posts and threads, scheduled or sent instantly. Oyekool trims your draft to a sharp, scannable version shaped for a fast-moving feed.",
    goodFor: "Announcements, quick updates, build-in-public threads",
  },
  {
    icon: <PlatformIcon platform="linkedin" className="size-8" />,
    name: "LinkedIn",
    description:
      "Longer posts with context — the same draft, expanded with the why behind it, formatted for a feed that rewards a bit more substance.",
    goodFor: "B2B updates, company news, professional audiences",
  },
  {
    icon: <PlatformIcon platform="youtube" className="size-8" />,
    name: "YouTube",
    description:
      "Schedule video and Shorts uploads with a title and description tuned for discovery, not just a caption pasted from somewhere else.",
    goodFor: "Product demos, tutorials, long-form and short-form video",
  },
  {
    icon: <PlatformIcon platform="instagram" className="size-8" />,
    name: "Instagram",
    description:
      "Posts, Stories, and Reels built around your media — the caption supports the visual, with hashtags tuned for the platform.",
    goodFor: "Visual products, behind-the-scenes content, Reels",
  },
  {
    icon: <PlatformIcon platform="facebook" className="size-8" />,
    name: "Facebook",
    description:
      "Posts and Stories for your Page, with a slightly warmer, more explained tone than a quick X post.",
    goodFor: "Community updates, local business posts, Page audiences",
  },
];

export default function ChannelsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Channels", path: "/channels" },
        ])}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 pb-8 pt-10 text-center sm:pb-10 sm:pt-12">
          <h1 className="font-heading mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            One post, shaped for every channel it goes out to.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            A good post looks different on every platform. Oyekool&apos;s composer adapts the same
            draft per channel — you can still fine-tune each version yourself.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-6 pb-10 pt-8 sm:pb-12 sm:pt-10">
          <div className="grid gap-4 sm:grid-cols-2">
            {channels.map((channel) => (
              <div
                key={channel.name}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-5"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  {channel.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-[15px] font-semibold text-foreground">
                      {channel.name}
                    </h2>
                    <Badge variant="success">Live</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{channel.description}</p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Good for: {channel.goodFor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-4xl px-6 py-12 text-center sm:py-16">
          <p className="text-eyebrow">Coming soon</p>
          <h2 className="font-heading mx-auto mt-3 max-w-lg text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            More platforms are on the roadmap.
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {upcomingPlatforms.map((platform) => (
              <span
                key={platform}
                className="inline-flex items-center rounded-full border border-dashed border-border px-3 py-1.5 text-sm font-medium text-muted-foreground"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
