import type { Metadata } from "next";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { DevToIcon, YouTubeIcon, InstagramIcon } from "@/components/marketing/social-icons";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export const metadata: Metadata = pageMetadata({
  title: "Platforms",
  description:
    "Where Amplibee publishes today — X, LinkedIn, Medium, Substack, and Dev.to — and what's coming next.",
  path: "/platforms",
});

const available: { icon: ReactNode; name: string; description: string }[] = [
  {
    icon: <PlatformIcon platform="x" className="size-5 text-foreground" />,
    name: "X",
    description: "Publish and schedule directly via the X API, with analytics where available.",
  },
  {
    icon: <PlatformIcon platform="linkedin" className="size-5 text-[#0A66C2]" />,
    name: "LinkedIn",
    description: "Publish to a personal profile or a company page you manage.",
  },
  {
    icon: <PlatformIcon platform="medium" className="size-5 text-foreground" />,
    name: "Medium",
    description: "Generate a formatted article and publish via a Medium integration token.",
  },
  {
    icon: <PlatformIcon platform="substack" className="size-5 text-[#FF6719]" />,
    name: "Substack",
    description: "Generate a newsletter-formatted draft to paste into Substack's editor.",
  },
  {
    icon: <DevToIcon className="size-5" />,
    name: "Dev.to",
    description: "Generate a developer-audience version of your post, formatted for Dev.to.",
  },
];

const comingSoon: { icon: ReactNode; name: string }[] = [
  { icon: <YouTubeIcon className="size-5" />, name: "YouTube" },
  { icon: <InstagramIcon className="size-5" />, name: "Instagram" },
];

export default function PlatformsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Platforms", path: "/platforms" },
        ])}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <p className="text-eyebrow">Platforms</p>
          <h1 className="font-heading mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            One post, adapted for every platform you publish to.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Connect multiple accounts per platform and choose exactly where each post goes.
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <div className="grid gap-4 sm:grid-cols-2">
            {available.map((platform) => (
              <div
                key={platform.name}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-5"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  {platform.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-[15px] font-semibold text-foreground">
                      {platform.name}
                    </h2>
                    <Badge variant="success">Available</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{platform.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <p className="text-eyebrow">Coming soon</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {comingSoon.map((platform) => (
              <div
                key={platform.name}
                className={cn(
                  "flex items-center gap-2.5 rounded-md border border-dashed border-border px-4 py-3 opacity-70",
                )}
              >
                {platform.icon}
                <span className="text-sm font-medium text-foreground">{platform.name}</span>
                <Badge variant="outline">Coming soon</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
