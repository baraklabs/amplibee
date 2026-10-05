export interface FeatureFaqItem {
  question: string;
  answer: string;
}

export interface FeatureItem {
  slug: string;
  title: string;
  description: string;
  color: string;
  body: string[];
  faq?: FeatureFaqItem[];
  thumbnail?: string;
}

export const FEATURE_LIST: FeatureItem[] = [
  {
    slug: "cross-posting-composer",
    title: "Cross-posting composer",
    description:
      "Write a post once and Oyekool adapts it for X, LinkedIn, YouTube, Instagram, and Facebook — the right length, format, and media per platform — then publish everywhere at once or schedule it for later.",
    color: "#4f46e5",
    thumbnail: "/images/features/cross-posting-composer/write-once-post-everywhere-og.png",
    body: [
      "The composer is one editor with a preview per platform: a thread-shaped draft for X, a longer post with context for LinkedIn, a caption with hashtags for Instagram, a title and description for a YouTube video or short, and a post for your Facebook Page. Edit the shared draft once, then fine-tune each platform's version without starting over.",
      "Attach images or video once and Oyekool handles the per-platform differences — aspect ratio, caption length limits, and link handling — so you're not manually resizing or rewriting for each network. Pick which connected accounts a post goes out to, right from the composer.",
      "Publish immediately, or hand it to the [content calendar](/features/content-calendar) to go out at the time you actually want. Either way, it's the same draft — nothing gets rewritten behind your back between scheduling and publishing.",
    ],
    faq: [
      {
        question: "Do I have to write a separate post for every platform?",
        answer:
          "No. Write one draft in the composer and Oyekool adapts it per platform — you can still edit each platform's version individually before it goes out.",
      },
      {
        question: "Which platforms can I post to?",
        answer:
          "X, LinkedIn, YouTube, Instagram, and Facebook today, with more platforms on the way. Pick any combination of your connected accounts per post.",
      },
      {
        question: "Can I post images and video, not just text?",
        answer:
          "Yes — attach media once in the composer and it carries across every platform you post to, adapted to each one's format.",
      },
      {
        question: "What happens if I only want a post to go to some platforms?",
        answer:
          "Select only the connected accounts you want for that specific post — every post can target a different combination of platforms.",
      },
    ],
  },
  {
    slug: "brand-profile",
    title: "Brand profile",
    description:
      "Save your brand's voice, audience, and key facts once. Every AI-drafted post reuses it, instead of you re-explaining who you are and what you post about every time.",
    color: "#0284c7",
    thumbnail: "/images/features/brand-profile/a-profile-every-draft-reuses-og.png",
    body: [
      "A brand profile is a saved description of your product, business, or personal brand: who it's for, your tone of voice, and facts that should stay consistent across posts — product names, pricing, launch dates, links you post often.",
      "Set it up once under Settings, and every AI-drafted caption or post pulls from it automatically. Run a separate profile per brand or client if you manage more than one set of accounts, each with its own voice and facts, without cross-contaminating tone between them.",
      "This is also where you keep the specific angle that makes your content worth posting — what you actually do, who it's for — so AI drafts lead with something real instead of generic marketing language.",
    ],
    faq: [
      {
        question: "What is a brand profile used for?",
        answer:
          "It's a saved description of your voice, audience, and key facts that every AI-drafted post reuses, so you're not re-explaining your brand every time you write a post.",
      },
      {
        question: "Can I manage more than one brand or client?",
        answer:
          "Yes — create a separate brand profile per brand or client, and pick which one a draft pulls from when you generate a post.",
      },
      {
        question: "Does the profile keep facts accurate over time?",
        answer:
          "You keep it accurate by updating the profile when facts change — AI uses whatever is currently saved there, so update it before your next campaign if details have moved.",
      },
    ],
  },
  {
    slug: "connected-accounts",
    title: "Connected accounts",
    description:
      "Connect your X, LinkedIn, YouTube, Instagram, and Facebook accounts once, then post or schedule to any of them from one place — no more logging into five apps.",
    color: "#059669",
    thumbnail: "/images/features/connected-accounts/connect-once-post-everywhere-og.png",
    body: [
      "[Connected accounts](/channels) is where you link each social account you post from. Connect as many accounts per platform as you need — a personal X account and a company Page, for example — and every one shows up as a destination in the composer and calendar.",
      "Each connection shows its status at a glance: connected and healthy, or needing reauthorization if a token expired. Disconnect an account any time, and nothing that's already been published changes — it only stops new posts from being sent there.",
      "More platforms are being added beyond the current five — see [channels](/channels) for what's live today and what's coming soon.",
    ],
    faq: [
      {
        question: "How many accounts can I connect?",
        answer:
          "As many as your plan allows across X, LinkedIn, YouTube, Instagram, and Facebook — including more than one account on the same platform, like a personal profile and a company Page.",
      },
      {
        question: "What happens if a connection expires?",
        answer:
          "Oyekool flags it as needing reauthorization. Posts scheduled to that account wait until you reconnect, instead of silently failing.",
      },
      {
        question: "Does disconnecting an account delete my past posts?",
        answer:
          "No. Disconnecting only stops future posts from going to that account — anything already published stays exactly as it is on the platform itself.",
      },
      {
        question: "What platforms are coming next?",
        answer:
          "TikTok, Threads, Pinterest, and Mastodon are on the public roadmap. See [channels](/channels) for the current list and what's next.",
      },
    ],
  },
  {
    slug: "post-analytics",
    title: "Post analytics",
    description:
      "See how every post performed on every platform it went out to — in one dashboard, instead of switching between five native analytics tabs.",
    color: "#db2777",
    thumbnail: "/images/features/post-analytics/one-dashboard-every-platform-og.png",
    body: [
      "Once a cross-posted update goes out, Oyekool pulls back performance per platform for that specific post — so you can see how the same piece of content did on X versus LinkedIn versus Instagram, side by side.",
      "This is what makes it possible to tell which platforms and formats are actually working for your audience, instead of guessing from memory across five different apps. Use it to decide what to post more of, and where.",
      "Analytics roll up per post and per platform, so you can compare a single update's reach everywhere it was shared, or look at a platform's trend over your last several weeks of posts.",
    ],
    faq: [
      {
        question: "Do I still need to check each platform's own analytics?",
        answer:
          "Not for a quick read on how a post did — Oyekool pulls the key numbers back into one dashboard per post and per platform, side by side.",
      },
      {
        question: "Can I compare performance across platforms for the same post?",
        answer:
          "Yes — since each cross-posted update is tracked per platform, you can see directly whether a given post did better on X, LinkedIn, Instagram, YouTube, or Facebook.",
      },
      {
        question: "Does analytics work for scheduled posts too?",
        answer:
          "Yes — once a scheduled post publishes, its performance is tracked the same way a post sent immediately would be.",
      },
    ],
  },
  {
    slug: "content-calendar",
    title: "Content calendar",
    description:
      "Plan a week or a month of posts across every connected platform in one visual calendar, instead of juggling reminders and separate native schedulers.",
    color: "#9333ea",
    thumbnail: "/images/features/content-calendar/plan-your-whole-month-og.png",
    body: [
      "The calendar is where scheduled posts live: drag a draft to a new day or time, see at a glance which platforms each slot is going out to, and spot gaps in your posting rhythm before they happen instead of after.",
      "Every scheduled post is still the same editable draft from the [composer](/features/cross-posting-composer) — reschedule it, tweak the copy, add or remove platforms, or pull it back to draft, right up until it publishes.",
      "You can plan more than one campaign or theme at a time — a product-launch week and your regular weekly content, both visible on the same calendar, color-coded so you can tell them apart at a glance.",
    ],
    faq: [
      {
        question: "Can I see what's scheduled across all my platforms at once?",
        answer:
          "Yes — the calendar shows every scheduled post across every connected account in one view, with each slot showing which platforms it targets.",
      },
      {
        question: "Can I reschedule a post after it's been added to the calendar?",
        answer:
          "Yes — drag it to a new date and time, or open it to edit the copy, media, or target platforms. Nothing publishes until the scheduled time arrives.",
      },
      {
        question: "What happens if I need to pull a scheduled post back?",
        answer:
          "Move it back to draft any time before it publishes — it won't go out until you schedule or publish it again.",
      },
    ],
  },
  {
    slug: "team-approvals",
    title: "Team approvals",
    description:
      "Draft, review, and approve posts before they go out — so a team can collaborate on content without anyone accidentally publishing something unreviewed.",
    color: "#4f46e5",
    thumbnail: "/images/features/team-approvals/review-before-it-goes-live-og.png",
    body: [
      "When a teammate drafts a post, it can move through a review step before it's allowed to publish or schedule — a second set of eyes on copy, media, and which accounts it's going out to.",
      "This is a deliberate workflow, not an afterthought: it's what keeps a shared set of accounts from getting an off-brand or unreviewed post published by mistake, especially with multiple people drafting content for the same brand.",
      "Every draft shows its status — draft, in review, approved, or scheduled — so everyone on the team knows what's about to go out and what still needs a look.",
    ],
    faq: [
      {
        question: "Can anyone on the team publish immediately?",
        answer:
          "That depends on their role — you can require review before publishing for some teammates while trusted admins publish directly, depending on how your workspace is set up.",
      },
      {
        question: "What happens if a draft gets rejected in review?",
        answer:
          "It goes back to the author with feedback instead of publishing, so they can revise and resubmit it.",
      },
      {
        question: "Does this work across all connected platforms?",
        answer:
          "Yes — review and approval apply to the post as a whole, before it goes out to whichever platforms it targets.",
      },
    ],
  },
];

export function getFeature(slug: string): FeatureItem | undefined {
  return FEATURE_LIST.find((f) => f.slug === slug);
}
