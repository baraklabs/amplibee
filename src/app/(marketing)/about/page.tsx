import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

const title = "About";
const description =
  "Oyekool exists because posting the same update to five platforms by hand is a waste of a founder's or a small team's time. Here's why we built a cross-posting tool instead of five browser tabs.";

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
            We got tired of five browser tabs just to post one update.
          </h1>

          <div className="mt-8 flex flex-col gap-5 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              Every brand, creator, and small team ends up in the same place eventually: an update
              worth sharing, and five different platforms it needs to go out to — each with its
              own app, its own format, and its own login. Writing it once should be enough. For
              most people, it isn&apos;t.
            </p>
            <p>
              Oyekool exists to make writing it once actually be enough. Connect your X, LinkedIn,
              YouTube, Instagram, and Facebook accounts, write a post, and let the composer adapt
              it per platform — the length, the tone, the format — instead of you rewriting it five
              times by hand. Schedule it on a shared calendar, or send it right now.
            </p>
            <p>
              We built the product around three things we think matter: a composer that adapts a
              post per platform instead of just duplicating it, a brand profile so AI-drafted posts
              actually sound like you instead of generic marketing copy, and analytics that show
              you how the same post did across every platform it reached — not five separate tabs
              to check by hand.
            </p>
            <p>
              Oyekool is built by a small team who ships in public. If you have feedback,{" "}
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
