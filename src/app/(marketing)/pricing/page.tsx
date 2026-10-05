import Link from "next/link";
import type { Metadata } from "next";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd, pricingJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description:
    "Start free with auto cross-posting for one destination. Upgrade for unlimited workflows, more connected accounts, and network amplification.",
  path: "/pricing",
});

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Try cross-posting on your next launch.",
    features: [
      "1 workflow",
      "2 connected accounts",
      "Auto cross-post to 1 destination",
      "BYOK AI (your own API key)",
      "Manual approval only",
    ],
    cta: "Get started for free",
    href: "/login?mode=signup",
    highlighted: false,
  },
  {
    name: "Builder",
    price: "$19",
    period: "/ month",
    description: "For solo founders shipping regularly.",
    features: [
      "Unlimited workflows",
      "Up to 10 connected accounts",
      "Cross-post to all supported platforms",
      "Content profiles & saved brand voice",
      "Scheduling",
      "Auto-generated backlinks",
    ],
    cta: "Get started for free",
    href: "/login?mode=signup",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/ month",
    description: "For small teams running multiple launches.",
    features: [
      "Everything in Builder",
      "Unlimited connected accounts",
      "Multiple content profiles per brand",
      "Priority network placement",
      "Shared workspace",
    ],
    cta: "Talk to us",
    href: "/contact",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "What does 'Bring Your Own Key' mean for billing?",
    answer:
      "Amplibee's plans cover the product itself. AI generation calls use your own OpenAI, Anthropic, or OpenRouter API key, billed directly by that provider — we don't mark up token usage.",
  },
  {
    question: "Can I change plans later?",
    answer: "Yes, upgrade or downgrade at any time from Settings → Billing. Changes apply immediately.",
  },
  {
    question: "Is there a limit on posts per month?",
    answer:
      "No artificial post caps. Limits are on workflows and connected accounts, not on how much you publish.",
  },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Pricing", path: "/pricing" },
          ]),
          pricingJsonLd(plans),
          faqJsonLd(faqs),
        ]}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <p className="text-eyebrow">Pricing</p>
          <h1 className="font-heading mx-auto mt-3 max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Simple pricing. Bring your own AI key.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-muted-foreground">
            You pay Amplibee for the product. You pay your AI provider for generation, at their
            rates, with your own key.
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "flex flex-col rounded-lg border p-6",
                  plan.highlighted ? "border-primary shadow-sm" : "border-border",
                )}
              >
                {plan.highlighted && (
                  <span className="mb-3 inline-flex w-fit items-center rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                    Most popular
                  </span>
                )}
                <h3 className="font-heading text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-semibold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <Button
                  className="mt-6"
                  variant={plan.highlighted ? "primary" : "outline"}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Pricing questions
          </h2>
          <div className="mt-8 divide-y divide-border">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-5">
                <h3 className="font-heading text-[15px] font-semibold text-foreground">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <Button size="lg" asChild>
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
