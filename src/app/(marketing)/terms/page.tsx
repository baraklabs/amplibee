import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms governing your use of Oyekool.",
  path: "/terms",
});

const sections = [
  {
    title: "Using Oyekool",
    body: "You're responsible for the accuracy and legality of any content you draft, schedule, or publish through Oyekool, and for disclosing sponsored or promotional content as required by each platform you post to and by applicable law.",
  },
  {
    title: "Connected accounts",
    body: "When you connect a social account, you authorize Oyekool to publish and schedule posts to it on your behalf, within the permissions each platform's own API grants. You can disconnect an account at any time, which revokes that access going forward.",
  },
  {
    title: "AI-generated content",
    body: "A post drafted using an AI provider you configure is a suggested starting point, not a guarantee of accuracy — review it before it publishes. Oyekool doesn't verify claims, facts, or figures produced by the AI provider.",
  },
  {
    title: "Bring Your Own Key",
    body: "When you use your own AI provider API key, usage and billing for that provider is between you and them, subject to their terms. We are not responsible for AI provider outages, rate limits, or costs.",
  },
  {
    title: "Platform compliance",
    body: "You're responsible for complying with each connected platform's own terms of service and content policies. Oyekool doesn't control what a platform shows, removes, or how it ranks content — a post that becomes unavailable on the platform it was published to is outside our control.",
  },
  {
    title: "Account termination",
    body: "You may delete your account at any time. We may suspend accounts that violate these terms, including abusive automation, attempts to manipulate engagement, or use that violates a connected platform's own policies.",
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
