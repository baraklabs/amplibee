import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

const title = "About";
const description =
  "Amplibee was built because launching something well shouldn't mean rewriting the same update six times. Here's why, and how we think about the product.";

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ title, description, path: "/about", type: "AboutPage" }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <p className="text-eyebrow">About</p>
          <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            We got tired of rewriting the same launch post six times.
          </h1>

          <div className="mt-8 flex flex-col gap-5 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              Every launch — a new feature, a Product Hunt post, a GitHub release — turns into the
              same manual work: write it for X, rewrite it for LinkedIn, expand it for a blog,
              format it again for a newsletter. The ideas don&apos;t change. The busywork does.
            </p>
            <p>
              Amplibee exists to remove that busywork without removing your voice from the
              content. You write the source once. We adapt it for each platform&apos;s format and
              audience, you review and edit before anything goes out, and then it publishes to the
              accounts you choose.
            </p>
            <p>
              We built it around three constraints we think matter: you should always be able to
              connect more than one account per platform, you should be able to use your own AI
              provider key instead of paying us a markup on tokens, and nothing should publish
              without your say-so unless you turn that off yourself.
            </p>
            <p>
              Amplibee is built by a small team who ships in public. If you have feedback,{" "}
              <a href="/contact" className="font-medium text-foreground underline underline-offset-4">
                tell us
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
