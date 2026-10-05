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
    slug: "content-transformation-engine",
    title: "Content transformation engine",
    description:
      "Write once. Amplibee rewrites it into a platform-native version for each destination — a LinkedIn post, a Medium article with headings, or a Substack newsletter — without just copy-pasting the same text.",
    color: "#4f46e5",
    thumbnail: "/images/features/content-transformation-engine/one-idea-many-platforms-og.png",
    body: [
      "Every platform rewards a different shape of writing. X wants a tight hook. LinkedIn wants context and a personal angle. Medium wants structure and depth. Substack wants a conversational newsletter voice. Posting the same paragraph everywhere ignores all of that, and readers can tell — see [how to automatically post from X and LinkedIn to multiple platforms](/blog/how-to-automatically-post-from-x-linkedin-to-multiple-platforms) for a step-by-step walkthrough.",
      "The transformation engine takes your source post and generates a version tailored to each destination's format and length, while keeping the source as the single source of truth — it doesn't invent facts, numbers, or quotes that weren't in the original.",
      "Every generated version shows up in the composer as an editable draft. Nothing publishes until you've reviewed it, and any manual edits you make are saved back before the post goes out.",
    ],
    faq: [
      {
        question: "How do I turn one blog post into different social media posts automatically?",
        answer:
          "Add the blog post as your source and generate a version for each destination — the engine restructures it into a shorter, platform-shaped post instead of you manually excerpting it by hand.",
      },
      {
        question: "Does AI content repurposing end up sounding generic or robotic?",
        answer:
          "It shouldn't, if it's using your saved content profile (tone, audience, brand voice) on every generation. Without that context, yes — generic prompts produce generic output, which is why the profile step matters.",
      },
      {
        question: "Will the rewritten version add facts or numbers I didn't write?",
        answer:
          "No — the source post stays the single source of truth. The engine restructures length, tone, and format, but it isn't supposed to invent facts, numbers, or quotes that weren't in the original.",
      },
      {
        question: "Can I edit the AI-generated version before it goes out?",
        answer:
          "Yes. Every generated version lands in the composer as an editable draft — nothing publishes until you've reviewed and, if needed, changed it.",
      },
    ],
  },
  {
    slug: "content-profiles",
    title: "Content profiles",
    description:
      "Set your tone, audience, brand voice, formality, and words to avoid once. Save it as a reusable profile so every generated post sounds like you, not a generic AI voice.",
    color: "#0284c7",
    thumbnail: "/images/features/content-profiles/a-profile-your-voice-everywhere-og.png",
    body: [
      "A content profile is a saved configuration — tone, audience, brand voice, formality, preferred CTA style, and specific words or topics to avoid — that gets applied automatically whenever Amplibee generates a post on your behalf.",
      "Instead of re-explaining your voice to the AI every time you write, you set it up once in Settings → Content Preferences and pick which profile to use per post or per workflow. You can save more than one profile if you write in different voices for different accounts.",
      "This is also where the words-to-avoid and topics-to-avoid lists live, so generated content stays on-brand without you having to catch it in every review.",
    ],
    faq: [
      {
        question: "How do I make AI-generated posts sound like me instead of generic AI?",
        answer:
          "Set your tone, audience, brand voice, and formality once as a content profile, then apply it to every generation. That saved context is what stops output from reading like generic AI copy.",
      },
      {
        question: "Can I use different tones for different accounts or platforms?",
        answer:
          "Yes — you can save more than one profile and pick which one to use per post or per workflow, so a company account and a personal account can sound different on purpose.",
      },
      {
        question: "How do I stop AI from using certain words or phrases in my posts?",
        answer:
          "Add them to the words-to-avoid or topics-to-avoid list on your content profile. It's applied automatically on every generation instead of you catching it manually in review.",
      },
      {
        question: "Do I have to re-explain my brand voice every time I generate a post?",
        answer:
          "No. Set it up once in Settings → Content Preferences and every generation that uses that profile applies it automatically.",
      },
    ],
  },
  {
    slug: "bring-your-own-ai-key",
    title: "Bring your own AI key",
    description:
      "Connect OpenAI, Anthropic, or OpenRouter with your own API key. Keys are encrypted at rest and never touch the browser. Pick a default provider and model per profile.",
    color: "#d97706",
    thumbnail: "/images/features/bring-your-own-ai-key/use-your-own-ai-key-og.png",
    body: [
      "Amplibee doesn't resell AI tokens. You connect your own OpenAI, Anthropic, or OpenRouter API key under Settings → AI Providers, choose a default model, and every generation in the product runs on that key directly.",
      "Keys are encrypted with AES-256-GCM before they're stored, and are only decrypted server-side at the moment a request needs to be made — the raw key is never sent back to your browser. Settings only ever shows a masked version.",
      "You can test a connection before saving it, switch providers or models at any time, and mark one provider as the default that new workflows pick up automatically.",
    ],
    faq: [
      {
        question: "Is it cheaper to use my own OpenAI API key instead of a SaaS AI subscription?",
        answer:
          "Usually yes for regular use, since you pay your provider directly at their rates instead of a marked-up token bundle. It also means your cost scales with your own usage, not a fixed tier.",
      },
      {
        question: "Is it safe to give a third-party app my OpenAI or Anthropic API key?",
        answer:
          "It's safe when the key is encrypted at rest and only decrypted server-side at the moment a request is made — that's how it's handled here. The raw key is never sent back to your browser, and settings only ever show a masked version.",
      },
      {
        question: "Can I use Claude or Anthropic instead of OpenAI?",
        answer:
          "Yes — OpenAI, Anthropic, and OpenRouter are all supported. You pick a default provider and model, and can switch at any time.",
      },
      {
        question: "What happens if I switch AI providers later?",
        answer:
          "Nothing breaks — you can add a new key, test the connection, and mark it as the default. New generations pick up the new provider; nothing about your existing content changes.",
      },
    ],
  },
  {
    slug: "multiple-accounts-per-platform",
    title: "Multiple accounts per platform",
    description:
      "Connect several X accounts, a personal LinkedIn profile alongside a company page, or more than one Medium publication — and choose the exact source and destination account per workflow.",
    color: "#059669",
    thumbnail: "/images/features/multiple-accounts-per-platform/manage-multiple-accounts-og.png",
    body: [
      "Most people running a launch aren't posting from a single account. You might have a personal X account and a product account, a personal LinkedIn profile and a company page, or more than one Medium publication.",
      "Amplibee's account model is built around this from the ground up: connect as many accounts per platform as you need, and pick the exact source and destination account when you create a post or set up a workflow — nothing assumes you only have one.",
      "Each connected account shows its own connection status, last sync time, and a reconnect flow if a token expires, so you always know which accounts are actually ready to publish to.",
    ],
    faq: [
      {
        question: "Can I connect two LinkedIn accounts to the same tool?",
        answer:
          "Yes — you can connect as many accounts per platform as you need, including more than one LinkedIn profile or page.",
      },
      {
        question: "How do I post from my personal account and my company page separately?",
        answer:
          "Connect both, then pick the exact source and destination account per post or workflow — nothing assumes you only have one account per platform.",
      },
      {
        question: "Can I manage multiple X or Medium accounts from one dashboard?",
        answer:
          "Yes, for both. Multiple X accounts and more than one Medium publication are supported the same way as multiple LinkedIn accounts.",
      },
      {
        question: "What happens if one of my connected accounts' tokens expires?",
        answer:
          "Each connected account shows its own connection status and last sync time, with a reconnect flow you can run whenever a token expires — the other connected accounts keep working normally.",
      },
    ],
  },
  {
    slug: "auto-generated-backlinks",
    title: "Auto-generated backlinks",
    description:
      "Generated posts can link back to your website, launch page, or GitHub repo, with anchor text, canonical/destination URLs, and UTM parameters you control.",
    color: "#db2777",
    thumbnail: "/images/features/auto-generated-backlinks/turn-content-into-real-reach-og.png",
    body: [
      "Turning one launch into a Medium article, a Substack post, and a LinkedIn post that all link back to your product is genuinely useful — as long as the link doesn't turn the post into keyword-stuffed junk.",
      "When you add a backlink to a post, you set the canonical URL and destination URL explicitly, write your own anchor text, and optionally add UTM parameters — nothing is auto-guessed or generated for you. Read more on how we approach this in [Backlinks without being spammy](/blog/backlinks-without-being-spammy).",
      "Every generated post is written to stand on its own as something worth reading first. The link is secondary to that — if a post wouldn't hold up without the link in it, that's a failure of the generation, not an acceptable trade-off.",
    ],
    faq: [
      {
        question: "Do backlinks from social posts actually help SEO?",
        answer:
          "A backlink from a Medium article or Substack post can help the way any external link does, provided the surrounding content is genuinely worth reading — the link itself doesn't do the work if the post around it is thin.",
      },
      {
        question: "Can I choose exactly where a generated post links to?",
        answer:
          "Yes. You set the canonical URL and destination URL explicitly, and write your own anchor text — nothing is auto-guessed.",
      },
      {
        question: "Is it spammy to add a backlink to every generated post?",
        answer:
          "It's spammy when the link is the only reason the post exists. It isn't when every generated post is a full, readable piece of writing first, with the link as a secondary, natural reference.",
      },
      {
        question: "Do UTM parameters on a backlink affect its SEO value?",
        answer:
          "No — UTMs are optional and scoped per post purely for your own click tracking. They don't change the canonical link or its SEO value.",
      },
    ],
  },
  {
    slug: "workflows",
    title: "Workflows",
    description:
      "Chain a source, AI refinement, an approval step, and one or more destinations into a reusable workflow — manual approval or automatic, immediate or scheduled.",
    color: "#9333ea",
    thumbnail: "/images/features/workflows/build-once-post-on-autopilot-og.png",
    body: [
      "A workflow is a saved pipeline: pick a source (an account or input type), one or more destination platforms and accounts, a content profile for the AI rewrite, and an approval mode — manual or automatic.",
      "Once it's set up, running the workflow again doesn't require reconfiguring anything. New source content flows through the same destinations with the same tone and the same approval step every time.",
      "You choose whether each workflow publishes immediately, on a schedule, or only ever creates drafts for you to publish by hand — the workflow doesn't decide that for you. See [pricing](/pricing) for plan limits on active workflows.",
    ],
    faq: [
      {
        question: "What's the difference between a workflow and just scheduling a post?",
        answer:
          "Scheduling a post sets a time for one piece of content. A workflow saves the whole pipeline — source, destinations, content profile, and approval mode — so the next update runs through the same setup without you rebuilding it.",
      },
      {
        question: "Can I reuse the same posting setup every week without rebuilding it?",
        answer:
          "Yes — that's what a saved workflow is for. New source content flows through the same destinations, tone, and approval step every time you run it.",
      },
      {
        question: "Can a workflow auto-publish without me approving each post?",
        answer:
          "Only if you explicitly turn on automatic approval for that workflow. By default, workflows require manual approval before anything goes out.",
      },
      {
        question: "Can I schedule posts for later instead of publishing immediately?",
        answer:
          "Yes — each workflow can publish immediately, on a schedule, or only create drafts for you to publish by hand; you decide per workflow.",
      },
    ],
  },
  {
    slug: "manual-approval",
    title: "You approve everything",
    description:
      "Nothing publishes without your review unless you explicitly turn on automatic approval. Every generated draft is fully editable first.",
    color: "#4f46e5",
    thumbnail: "/images/features/manual-approval/you-approve-everything-og.png",
    body: [
      "AI-generated content is a draft, not a finished post. By default, every workflow requires manual approval — nothing goes out to a connected account until you've reviewed and, if needed, edited it.",
      "Automatic approval is available for workflows where you've already built enough trust in the output, but it's an explicit opt-in per workflow, not a default behavior.",
      "This applies everywhere content is generated in the product, not just workflows — the composer, quick edits, and refinements all produce editable drafts first.",
    ],
    faq: [
      {
        question: "Will AI publish posts to my accounts without me checking them first?",
        answer:
          "No, not by default. Every workflow requires manual approval unless you explicitly turn on automatic approval — nothing goes out until you've reviewed it.",
      },
      {
        question: "Can I turn off manual approval if I trust the AI output?",
        answer:
          "Yes — automatic approval is available per workflow once you've built enough trust in the output, but it's an explicit opt-in, never a default.",
      },
      {
        question: "What if I want to edit a draft before it goes live?",
        answer:
          "That's the normal flow — every generated draft is fully editable in the composer before it publishes, whether it came from a workflow, a quick edit, or a manual refinement.",
      },
    ],
  },
  {
    slug: "quick-edits",
    title: "Quick edits, not full rewrites",
    description:
      "Shorten, expand, improve the hook, add or remove a CTA, or shift tone with one click — instead of regenerating the whole post from scratch.",
    color: "#0284c7",
    thumbnail: "/images/features/quick-edits/small-changes-big-impact-og.png",
    body: [
      "Most of the time, a generated draft doesn't need a full regeneration — it needs one specific change. Maybe the hook is weak, maybe it's too long, maybe it needs a call to action it doesn't have yet.",
      "The composer's quick-edit actions — shorten, expand, improve the hook, add or remove a CTA, make it more technical or more conversational, shift the tone — make a single targeted change and leave the rest of the post alone.",
      "Each edit is applied on top of your current draft, including any manual changes you've already made, so you never lose work by asking for one more adjustment.",
    ],
    faq: [
      {
        question: "How do I make a generated post shorter without rewriting it from scratch?",
        answer:
          "Use the shorten quick edit — it trims the current draft in place instead of regenerating the whole post.",
      },
      {
        question: "Can I add a call-to-action to an existing draft with one click?",
        answer:
          "Yes — add or remove a CTA is one of the quick-edit actions, applied on top of your current draft.",
      },
      {
        question: "Will a quick edit undo my manual changes to a draft?",
        answer:
          "No. Quick edits apply on top of your current draft, including any manual changes you've already made, so you don't lose work by asking for one more adjustment.",
      },
    ],
  },
  {
    slug: "campaign-brief-generator",
    title: "Campaign brief generator",
    description:
      "Describe your product, app, or GitHub repo and the goal you're chasing. Amplibee drafts suggested talking points and captions per channel that a real influencer can adapt in their own voice — never a script.",
    color: "#4f46e5",
    thumbnail: "/images/features/campaign-brief-generator/one-brief-every-channel-og.png",
    body: [
      "A campaign starts with a brief: what you're promoting (a SaaS product, a mobile app, a GitHub repo, a Product Hunt launch, or a blog post) and what you want out of it — GitHub stars, sign-ups, downloads, awareness, or traffic. The generator takes that and drafts a starting point for each channel: a thread-shaped angle for X, a story-with-context angle for LinkedIn, a talking-point outline for a YouTube mention, a visual-first caption for Instagram.",
      "None of this is meant to be posted as-is. It's a set of talking points and angles an influencer reads, adapts into their own voice, and records or writes themselves — see [why fake engagement kills your launch and what to do instead](/blog/why-fake-engagement-kills-your-launch-and-what-to-do-instead) for why that distinction matters. A brief that reads like a corporate ad gets ignored by the network; one that gives a creator something true and specific to react to gets picked up.",
      "The brief pulls from your [product profile](/features/product-profile) — the same voice, audience, and product facts every time — so you're not re-explaining what you're promoting on every new campaign. Every draft is fully editable before it's published to the network.",
    ],
    faq: [
      {
        question: "Does Amplibee write the influencer's post for them?",
        answer:
          "No. The generator drafts suggested talking points and captions per channel as a starting point. Influencers adapt them into their own words and voice before posting — a script read verbatim isn't genuine, and genuine is the entire point.",
      },
      {
        question: "What can I brief a campaign around?",
        answer:
          "A SaaS product, a mobile app, a GitHub or open-source repo, a Product Hunt launch, or a blog post — plus a goal: GitHub stars, sign-ups, downloads, awareness, or traffic. That goal shapes the angle the generator suggests.",
      },
      {
        question: "Do I need to write the brief myself?",
        answer:
          "No — describe your product and goal and the AI drafts the first version per channel. You can also write it entirely yourself if you'd rather skip generation altogether.",
      },
      {
        question: "Can I edit the generated talking points before a campaign goes live?",
        answer:
          "Yes. Every generated brief is an editable draft — nothing goes out to the network until you've reviewed and, if needed, changed it.",
      },
    ],
  },
  {
    slug: "product-profile",
    title: "Product profile",
    description:
      "Save your product's voice, audience, and key facts once. Every campaign brief you generate afterward reuses it, instead of you re-explaining what you're promoting each time.",
    color: "#0284c7",
    thumbnail: "/images/features/product-profile/a-profile-every-brief-reuses-og.png",
    body: [
      "A product profile is a saved description of what you're promoting: the product or repo, who it's for, what makes it worth a genuine mention, tone, and any facts or numbers that should stay consistent across campaigns — star count, user count, pricing, launch date.",
      "Set it up once under your product's settings, then every campaign brief the AI drafts pulls from it automatically. You can run a GitHub-stars campaign for a repo and a sign-ups campaign for the SaaS product it powers, each with its own profile, without cross-contaminating the voice or facts between them.",
      "This is also where you keep the specific angle that makes your product worth an influencer's time — the actual problem it solves, who it's genuinely useful for — so every generated brief leads with something real instead of generic marketing language.",
    ],
    faq: [
      {
        question: "What is a product profile used for?",
        answer:
          "It's a saved description of your product, audience, tone, and key facts that every campaign brief you generate reuses, so you don't re-explain what you're promoting on every new campaign.",
      },
      {
        question: "Can I run campaigns for more than one product?",
        answer:
          "Yes — create a separate product profile per product, app, or repo, and pick which one a campaign brief pulls from.",
      },
      {
        question: "Does the profile keep facts like star count or pricing accurate?",
        answer:
          "You keep it accurate by updating the profile when facts change — the AI uses whatever is currently saved there, so a stale profile produces a stale brief. Update it before a new campaign if numbers have moved.",
      },
    ],
  },
  {
    slug: "influencer-network",
    title: "Influencer network",
    description:
      "Browse real influencers and creators on X, LinkedIn, YouTube, and Instagram by niche and audience size. Every profile is opted in and posts to their own genuine audience.",
    color: "#059669",
    thumbnail: "/images/features/influencer-network/match-by-niche-and-channel-og.png",
    body: [
      "The [network](/network) is a directory of influencers, creators, and communities who've opted in to discover campaigns. Each profile lists the channels they're active on, their niches, roughly how large their audience is, and — where they've shared it — rate information and a portfolio link.",
      "Product owners browse or get matched by niche; influencers browse or get matched by the campaigns that fit what they already talk about. A developer-tools creator sees GitHub-star campaigns for repos in their niche; a productivity-app reviewer sees SaaS launches in theirs. Nobody is pushed a campaign that doesn't fit their actual audience.",
      "This only works because it's opt-in and niche-matched — an influencer's value is their genuine audience, and a mismatched campaign burns that trust fast. The network is built to protect the fit, not just maximize the number of matches.",
    ],
    faq: [
      {
        question: "How does Amplibee match influencers to campaigns?",
        answer:
          "By niche and channel — an influencer's network profile lists what they cover and where, and campaigns matching that niche surface to them. Product owners can also browse the directory directly by category and audience size.",
      },
      {
        question: "Which channels does the network cover?",
        answer:
          "X, LinkedIn, YouTube, and Instagram — wherever an influencer already has a genuine, engaged audience.",
      },
      {
        question: "Do I have to accept every campaign that matches my niche?",
        answer:
          "No. Matching just means a campaign is surfaced to you as relevant — you choose which ones you actually want to post about.",
      },
      {
        question: "How do I get listed in the network as an influencer?",
        answer:
          "Create a network profile with your niches, channels, and audience size, and opt in to being visible. Product owners then discover you the same way you discover campaigns — by fit, not by cold outreach.",
      },
    ],
  },
  {
    slug: "tracked-campaign-links",
    title: "Tracked campaign links",
    description:
      "Every influencer gets a unique tracked link with UTM parameters, so you can see exactly what each deliverable drove — clicks, sign-ups, or stars — instead of guessing which post worked.",
    color: "#db2777",
    thumbnail: "/images/features/tracked-campaign-links/see-what-each-deliverable-drove-og.png",
    body: [
      "When an influencer joins a campaign, they get their own tracked link back to your product, launch page, or GitHub repo. It's unique to them, carries UTM parameters you control, and lets you see what that specific post, video, or story actually drove.",
      "This is what makes it possible to tell genuine influence apart from noise: instead of one campaign-wide number, you get per-influencer data — which creator's audience actually clicked through, signed up, starred the repo, or downloaded the app. That's useful for the current campaign and for deciding who to work with again.",
      "Influencers submit their deliverable link as proof once they've posted, and the campaign metrics roll up from there — see [reviewing every deliverable](/features/review-every-deliverable) for how that submission gets checked before it counts.",
    ],
    faq: [
      {
        question: "How do I know which influencer actually drove results?",
        answer:
          "Each influencer gets a unique tracked link with UTM parameters, so clicks, sign-ups, downloads, or stars attributed to their link are visible per-influencer, not just as one campaign-wide total.",
      },
      {
        question: "Do influencers need to set up their own tracking?",
        answer:
          "No — the tracked link is generated for them when they join a campaign. They just use that link instead of a plain one when they post.",
      },
      {
        question: "Can I see results per channel, not just per influencer?",
        answer:
          "Yes — since each deliverable is tied to a specific influencer and channel, you can see whether your best results are coming from X threads, LinkedIn posts, YouTube mentions, or Instagram stories.",
      },
    ],
  },
  {
    slug: "campaigns",
    title: "Campaigns",
    description:
      "Brief once, set a goal and a budget type, and reuse the same campaign across every influencer who joins — instead of negotiating and briefing each creator separately.",
    color: "#9333ea",
    thumbnail: "/images/features/campaigns/brief-once-reuse-across-influencers-og.png",
    body: [
      "A campaign is the unit of work in Amplibee: what you're promoting, the goal (GitHub stars, sign-ups, downloads, awareness, or traffic), a budget type (paid, product-only, or revenue-share, depending on what you offer), and the generated or hand-written brief influencers see when they discover it.",
      "Once a campaign is live, any influencer in the network whose niche matches can apply or join, pick up the brief, adapt it in their own voice, and post. You don't re-brief each one individually — the campaign is the single source of truth every participant works from.",
      "You can run more than one campaign at a time — a GitHub-stars campaign for a repo and a separate sign-ups campaign for the product built on it, each with its own goal, brief, and tracked links. See [pricing](/pricing) for plan limits on active campaigns.",
    ],
    faq: [
      {
        question: "What's the difference between a campaign and just messaging influencers directly?",
        answer:
          "A campaign is a saved brief and goal that any matching influencer in the network can discover and join on their own — you're not negotiating and re-briefing each creator individually.",
      },
      {
        question: "Can I run more than one campaign at once?",
        answer:
          "Yes, depending on your plan — for example a GitHub-stars campaign for a repo and a separate sign-ups campaign for the product it powers, each with its own goal and brief.",
      },
      {
        question: "What goals can a campaign target?",
        answer:
          "GitHub stars, sign-ups, downloads, awareness, or traffic. The goal shapes both the AI-generated talking points and what the tracked links measure.",
      },
      {
        question: "Do all influencers on a campaign see the same brief?",
        answer:
          "They see the same starting brief, but each adapts it into their own voice before posting — the brief is a shared starting point, not a script everyone repeats verbatim.",
      },
    ],
  },
  {
    slug: "review-every-deliverable",
    title: "Review every deliverable",
    description:
      "Every submitted post, video, or story is reviewed before it counts toward a campaign — genuine engagement only, never bots, never fake followers, never manipulated numbers.",
    color: "#4f46e5",
    thumbnail: "/images/features/review-every-deliverable/genuine-engagement-only-og.png",
    body: [
      "When an influencer posts about your campaign, they submit the link as proof — a deliverable. Nothing counts toward your campaign's results until that deliverable has been reviewed: is it live, does it genuinely reflect the brief, does it look like a real post to a real audience.",
      "This is a deliberate constraint, not friction for its own sake. The entire value of Amplibee is genuine reach — real people telling their real audience about something worth telling them about. Review is what keeps that promise honest: it's how bought engagement, fake followers, and templated spam get filtered out before they ever show up in your results.",
      "Every deliverable shows its status — submitted, under review, approved, or rejected — so both sides know where a campaign stands. Approved deliverables roll into your campaign metrics via their [tracked link](/features/tracked-campaign-links).",
    ],
    faq: [
      {
        question: "Does every influencer post automatically count toward my campaign?",
        answer:
          "No. Every submitted deliverable is reviewed before it counts — checking that it's live, genuinely reflects the brief, and reads like a real post to a real audience, not a bot or templated spam.",
      },
      {
        question: "How does Amplibee prevent fake engagement or bought followers?",
        answer:
          "By reviewing every deliverable before it counts, and by only working with network profiles that represent genuine audiences. There's no mechanism in the product for buying stars, followers, or engagement directly — the entire model runs through real influencers posting to real audiences.",
      },
      {
        question: "What happens if a deliverable gets rejected?",
        answer:
          "It doesn't count toward the campaign's results, and the influencer can see why so they can fix and resubmit if the issue is fixable — for example, a link that didn't go live yet.",
      },
    ],
  },
];

export function getFeature(slug: string): FeatureItem | undefined {
  return FEATURE_LIST.find((f) => f.slug === slug);
}
