import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms governing your use of Amplibee.",
  path: "/terms",
});

const sections = [
  {
    title: "Using Amplibee",
    body: "You must have the right to publish content to any account you connect. You're responsible for what you approve and publish through the product, including compliance with each connected platform's own terms of service.",
  },
  {
    title: "AI-generated content",
    body: "Content generated using an AI provider you configure is a draft, not a guarantee of accuracy or platform compliance. Review generated content before publishing — Amplibee doesn't verify claims, facts, or figures produced by the AI provider.",
  },
  {
    title: "Bring Your Own Key",
    body: "When you use your own AI provider API key, usage and billing for that provider is between you and them, subject to their terms. We are not responsible for AI provider outages, rate limits, or costs.",
  },
  {
    title: "Platform integrations",
    body: "Publishing capabilities depend on what each platform's public API supports. Where a platform doesn't support a capability (for example, scheduling or analytics), Amplibee will say so rather than simulate it.",
  },
  {
    title: "Account termination",
    body: "You may delete your account at any time. We may suspend accounts that violate these terms or misuse connected platform APIs (e.g. spam or automated abuse).",
  },
  {
    title: "Changes",
    body: "We may update these terms as the product evolves. Material changes will be posted on this page.",
  },
];

export default function TermsPage() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <p className="text-eyebrow">Legal</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated September 2026</p>

        <div className="mt-10 flex flex-col gap-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-heading text-lg font-semibold text-foreground">{section.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
