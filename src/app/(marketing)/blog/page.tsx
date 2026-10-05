import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog/posts";
import { formatDate } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { SplitCard } from "@/components/marketing/split-card";

const title = "Blog";
const description =
  "Notes on cross-posting, AI-assisted content, backlinks, growth, and building Amplibee.";

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path: "/blog",
  eyebrow: "Blog",
});

export default function BlogIndexPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ title, description, path: "/blog", type: "CollectionPage" }),
          itemListJsonLd(blogPosts.map((p) => ({ name: p.title, path: `/blog/${p.slug}` }))),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pb-20 sm:pt-10">
          <h1 className="font-heading mx-auto max-w-4xl text-center text-3xl font-semibold tracking-tight text-foreground">
            Learn how SaaS founders grow faster organically,
            <br />
            get more customers, reduce churn, and build better products.
          </h1>

          <div className="mt-12 flex flex-col gap-6">
            {blogPosts.map((post) => (
              <SplitCard
                key={post.slug}
                href={`/blog/${post.slug}`}
                color={post.color}
                image={post.thumbnail}
                eyebrow={post.category}
                title={post.title}
                description={post.description}
                className="sm:h-56"
                meta={
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span aria-hidden="true">·</span>
                    <span>{post.readingTime}</span>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
