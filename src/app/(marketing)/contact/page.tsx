import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { ContactForm } from "./contact-form";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/config";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Get in touch with the Amplibee team — questions, feedback, or partnership inquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section className="border-b border-border">
      <JsonLd
        data={[
          webPageJsonLd({
            title: "Contact",
            description: "Get in touch with the Amplibee team.",
            path: "/contact",
            type: "ContactPage",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />
      <div className="mx-auto grid max-w-4xl gap-10 px-6 py-16 sm:py-20 md:grid-cols-2">
        <div>
          <p className="text-eyebrow">Contact</p>
          <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-foreground">
            Let&apos;s talk.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Questions about a plan, a platform integration, or something broken — send it over.
          </p>
          <div className="mt-6 flex items-center gap-2.5 text-sm text-muted-foreground">
            <Mail className="size-4" />
            <span>{siteConfig.contactEmail}</span>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
