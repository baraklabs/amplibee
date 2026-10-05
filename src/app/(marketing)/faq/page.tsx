import type { Metadata } from "next";
import { faqs } from "@/lib/faq";
import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description: "Common questions about how Amplibee generates, reviews, and publishes content.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <p className="text-eyebrow">FAQ</p>
          <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-foreground">
            Common questions
          </h1>
          <div className="mt-10 divide-y divide-border">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-5">
                <h2 className="font-heading text-[15px] font-semibold text-foreground">
                  {faq.question}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
