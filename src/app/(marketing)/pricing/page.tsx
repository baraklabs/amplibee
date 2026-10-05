import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd, pricingJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { PricingPlans, type PricingPlan } from "./pricing-plans";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description:
    "Free with 3 connected accounts and 10 scheduled posts a month. Plus unlocks 10 accounts, unlimited posts, and AI drafting for $15/month. Business gets unlimited accounts, seats, and approvals for $49/month.",
  path: "/pricing",
});

const plans: PricingPlan[] = [
  {
    name: "Free",
    monthly: 0,
    yearlyMonthly: null,
    yearlyBilled: null,
    description: "Try cross-posting with your first few accounts.",
    features: [
      "3 connected accounts",
      "10 scheduled posts / month",
      "Content calendar",
      "1 user",
    ],
    cta: "Get started for free",
    href: "/login?mode=signup",
    highlighted: false,
  },
  {
    name: "Plus",
    monthly: 15,
    yearlyMonthly: 13,
    yearlyBilled: 150,
    description: "For creators and small teams posting every week.",
    features: [
      "Everything in Free",
      "10 connected accounts",
      "Unlimited scheduled posts",
      "AI post drafting from your brand profile",
      "Post analytics across every platform",
      "3 team seats",
    ],
    cta: "Get started for free",
    href: "/login?mode=signup",
    highlighted: true,
  },
  {
    name: "Business",
    monthly: 49,
    yearlyMonthly: 41,
    yearlyBilled: 490,
    description: "For agencies and teams managing multiple brands.",
    features: [
      "Everything in Plus",
      "Unlimited connected accounts",
      "Unlimited team seats",
      "Team approval workflows",
      "Multiple brand profiles",
      "Priority support",
    ],
    cta: "Get started for free",
    href: "/login?mode=signup",
    highlighted: false,
  },
];

const plansForJsonLd = plans.map((plan) => ({
  name: plan.name,
  price: `$${plan.monthly}`,
  description: plan.description,
}));

const faqs = [
  {
    question: "What counts as a connected account?",
    answer:
      "Each individual account you link — your personal X account and a company Page both count separately, even on the same platform. Disconnecting an account frees up the slot immediately.",
  },
  {
    question: "What happens if I hit my scheduled-post limit on Free?",
    answer:
      "You can still publish immediately, but new posts won't schedule for later until the next month's allowance refreshes or you upgrade — nothing already scheduled gets cancelled.",
  },
  {
    question: "Can I change plans later?",
    answer: "Yes, upgrade or downgrade at any time from Settings → Billing. Changes apply immediately, including your new account and scheduled-post limits.",
  },
  {
    question: "Do all platforms count the same toward my connected-account limit?",
    answer:
      "Yes — X, LinkedIn, YouTube, Instagram, and Facebook accounts all count the same way against your plan's connected-account limit, regardless of platform.",
  },
  {
    question: "Is there a limit on team seats on the Free plan?",
    answer:
      "Free is single-user. Plus includes 3 team seats, and Business includes unlimited seats with team approval workflows for shared accounts.",
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
          pricingJsonLd(plansForJsonLd),
          faqJsonLd(faqs),
        ]}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pb-6 pt-10 text-center sm:pb-8 sm:pt-12">
          <h1 className="font-heading mx-auto max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Simple plans that scale with how much you post.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-muted-foreground">
            Every plan includes a connected-account limit and a scheduled-post allowance — no
            per-post fees, no surprise charges.
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-6 sm:pb-20 sm:pt-8">
          <PricingPlans plans={plans} />
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Two things every plan is built around
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="font-heading text-[15px] font-semibold text-foreground">Connected accounts</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                How many social accounts you can link at once, across X, LinkedIn, YouTube,
                Instagram, and Facebook combined. Disconnect one any time to free up the slot.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="font-heading text-[15px] font-semibold text-foreground">Scheduled posts</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A monthly allowance for posts scheduled ahead of time on the content calendar.
                Publishing immediately instead of scheduling never spends one.
              </p>
            </div>
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
