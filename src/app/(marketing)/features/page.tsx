import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/marketing/section-heading";
import { WorkflowMap } from "@/components/marketing/workflow-map";
import { SplitCard } from "@/components/marketing/split-card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { FEATURE_LIST } from "@/lib/features-data";

const title = "Features";
const description =
  "Multi-account platform connections, an AI transformation engine, BYOK, visual workflows, and auto-generated backlinks, in one place.";

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path: "/features",
  eyebrow: "Features",
});

export default function FeaturesPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ title, description, path: "/features", type: "CollectionPage" }),
          itemListJsonLd(FEATURE_LIST.map((f) => ({ name: f.title, path: `/features/${f.slug}` }))),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
          ]),
        ]}
      />

      <section id="integrations">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pb-20 sm:pt-10">
          <h1 className="font-heading mx-auto max-w-4xl text-center text-3xl font-semibold tracking-tight text-foreground">
            Everything a product needs.
            <br />
            Post everywhere. Get influencers to promote your product.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-[15px] leading-relaxed text-muted-foreground">
            Publish once, automatically create platform-native posts, and connect with influencers who can
  help get your product in front of more people — organically.
          </p>

          <div className="mt-12 flex flex-col gap-6">
            {FEATURE_LIST.map((feature) => (
              <SplitCard
                key={feature.slug}
                href={`/features/${feature.slug}`}
                color={feature.color}
                image={feature.thumbnail}
                title={feature.title}
                description={feature.description}
                cta="Read more"
                className="sm:h-56"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeading
            eyebrow="How it flows"
            title="Pick a source. Pick destinations. Review, then publish."
            description="A workflow is just a source account, one or more destination platforms, and an approval step in between."
          />
          <div className="mt-10">
            <WorkflowMap />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            See it work on your next launch.
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
