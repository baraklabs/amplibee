import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { getBlockColor } from "@/lib/block-colors";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Oyekool collects, uses, and protects your data, including connected-account tokens, post content, AI provider keys, and cookies.",
  path: "/privacy",
});

const sections = [
  {
    title: "What we collect",
    body: "Account details (name, email), brand profile data (voice, audience, facts you save), post content and media you draft or schedule, connected-account tokens for the platforms you link, per-post performance data pulled back from those platforms, and usage data needed to operate the product.",
  },
  {
    title: "AI provider API keys",
    body: "Any AI provider API key you add under Bring Your Own Key is encrypted before being stored and is only decrypted server-side at the moment it's needed to draft a post on your behalf. It is never sent to your browser after you save it — settings only ever show a masked version.",
  },
  {
    title: "How we use your data",
    body: "To operate the product: publishing or scheduling your posts to the platforms you connect, generating AI post drafts using the provider you configure, and showing you how each post performed per platform. We do not sell your data.",
  },
  {
    title: "Third-party platforms",
    body: "When you connect an account, Oyekool stores an access token so it can publish or schedule posts to that platform on your behalf. Each platform's own terms and privacy policy apply to what happens there. You can disconnect an account at any time, which revokes our access.",
  },
  {
    title: "Data retention",
    body: "We retain your content and account data as long as your account is active. You can delete individual posts, disconnect an account, or remove a brand profile at any time, or request full account deletion from Settings → Security.",
  },
  {
    title: "Contact",
    body: "Questions about this policy can be sent through the contact page.",
  },
];

const cookieCategories = [
  {
    name: "Strictly necessary",
    detail:
      "Keeps you signed in and protects authenticated pages. Always active — the product doesn't work without these.",
    canDisable: false,
  },
  {
    name: "Analytics",
    detail:
      "Would help us understand usage. Oyekool doesn't currently load any analytics scripts, so choosing to allow this has no effect yet — your preference is saved for if that changes.",
    canDisable: true,
  },
  {
    name: "Marketing",
    detail:
      "Would measure ads and campaigns. Oyekool doesn't currently load any marketing or advertising scripts, so choosing to allow this has no effect yet — your preference is saved for if that changes.",
    canDisable: true,
  },
];

export default function PrivacyPage() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <p className="text-eyebrow">Legal</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated September 2026</p>

        <div className="mt-10 flex flex-col gap-8">
          {sections.slice(0, -1).map((section) => (
            <div key={section.title}>
              <h2 className="font-heading text-lg font-semibold text-foreground">{section.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{section.body}</p>
            </div>
          ))}

          <div id="cookies">
            <h2 className="font-heading text-lg font-semibold text-foreground">Cookies</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              We use a small number of essential cookies to keep the product secure and
              functioning, plus optional analytics and marketing categories you control from{" "}
              <strong className="font-medium text-foreground">Cookie Settings</strong> in the
              footer. We don&apos;t sell data derived from cookies.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {cookieCategories.map((category, index) => {
                const color = getBlockColor(index);
                return (
                  <div key={category.name} className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                          color.bg,
                          color.fg,
                        )}
                      >
                        {category.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {category.canDisable ? "Not currently used" : "Required — can't be disabled"}
                      </span>
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                      {category.detail}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              You can clear cookies at any time from your browser settings — doing so will simply
              sign you out.
            </p>
          </div>

          {sections.slice(-1).map((section) => (
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
