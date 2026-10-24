// Features at /features and /features/<slug>: one page per thing Amplibee does.
// Each page answers the questions people type into Google or ask an AI assistant, answer first, then the detail.
// Only describe what the product does today. The sources are the report, the dashboard pages, the plans and the home page.

export interface Feature {
  slug: string
  /** Short label, shown above the title on cards and used as the title of the share image. */
  name: string
  /** Shown under the name on the share image. */
  tagline: string
  /** The page heading. Written the way people search for it. */
  headline: string
  /** Two sentences for the card and the meta description. */
  summary: string
  /** YYYY-MM-DD */
  updated: string
  /** The direct answer, shown first on the page and in structured data, so a snippet or an AI answer can quote it. */
  answer: string
  /** Headings are questions; each section opens with its answer. */
  sections: { h: string; body: string[]; bullets?: string[] }[]
  /** Questions people search for. Shown on the page and as FAQ structured data. */
  faq: { q: string; a: string }[]
  /** Search terms for the meta keywords. */
  keywords: string[]
  /** Slugs of the blog posts that go deeper. */
  blogs: string[]
  /** Dark background of the share image. */
  tone: string
}

const UPDATED = '2026-10-24'
const free = { q: 'Is it free to try?', a: 'Yes. The visibility check is free. Enter your website and you get your score and your gaps. Paid plans add the work Amplibee does for you.' }

export const FEATURES: Feature[] = [
  {
    slug: 'product-visibility-score',
    name: 'Visibility score',
    tagline: 'One number out of 100',
    headline: 'Product visibility score: how findable is your product online?',
    summary: 'Enter your website and get a score out of 100 for how visible your product is. It is built from directories, search, mentions and page basics, with every gap named.',
    updated: UPDATED,
    answer: 'Amplibee scores how visible your product is online out of 100. The score combines four parts: directory listings, search indexing, mentions and technical SEO. Every point you are missing is tied to a named gap with a fix.',
    sections: [
      { h: 'What is a product visibility score?', body: ['It is one number that says how easy your product is to find and trust online. A high score means buyers, search engines and AI assistants have plenty of places and facts to find you with.'] },
      {
        h: 'What goes into the score?',
        body: ['Four parts, each out of 100, then combined.'],
        bullets: ['Directories: whether you are listed where buyers look', 'Search: whether your site is indexed', 'Mentions: Hacker News stories and GitHub repositories that mention you', 'Technical SEO: robots.txt, sitemap, Open Graph tags, structured data and other page basics'],
      },
      { h: 'How is it calculated?', body: ['Checks are deterministic and use public information only. The score is recalculated from live requests each time you run a check.'] },
      { h: 'Where do the missing points go?', body: ['Each gap shows what is wrong and the points the score would gain if you fixed it, so you can see exactly where the rest of the 100 went.'] },
    ],
    faq: [
      { q: 'What is a good visibility score?', a: 'There is no pass mark. The score is most useful as a measure of progress: run a check, fix the biggest gaps, run it again and watch it rise. Comparing it with your competitors shows how you stand.' },
      { q: 'How do I check how visible my website is online?', a: 'Enter your website on the Amplibee home page. It checks directories, search indexing, mentions and page basics, then gives you a score out of 100 and a list of gaps.' },
      { q: 'How is the visibility score calculated?', a: 'From four parts: directory listings, search indexing, mentions and technical SEO. Each part is scored out of 100 from public information, then combined.' },
      { q: 'How do I improve my visibility score?', a: 'Fix the gaps in the order listed. Each gap shows the points it would add, so the biggest gain comes first.' },
      free,
    ],
    keywords: ['product visibility score', 'website visibility checker', 'online visibility check', 'brand visibility score', 'free visibility check'],
    blogs: ['technical-basics', 'where-to-list-a-new-saas'],
    tone: '#0f3d33',
  },
  {
    slug: 'directory-listings',
    name: 'Directory listings',
    tagline: 'Check, plan and submit',
    headline: 'Directory submission: find where your product is listed and where it is not',
    summary: 'Amplibee checks the directories that matter for your listing and turns the missing ones into a launch plan, with a submission page for each. Submit yourself, or let us do it on a paid plan.',
    updated: UPDATED,
    answer: 'Amplibee checks directories such as Product Hunt, AlternativeTo, SaaSHub and G2 for your listing, shows which are missing and gives you the submission page for each. You can submit them yourself for free, or let Amplibee submit to 150+ directories on a paid plan.',
    sections: [
      { h: 'Which directories does Amplibee check?', body: ['Directories for products and founders, communities, review sites and developer platforms, such as Product Hunt, Hacker News, AlternativeTo, SaaSHub, G2 and DEV Community.'] },
      { h: 'How do I see where I am listed?', body: ['The directories page lists every directory with a status: listed, not found or not checked yet. Some directories cannot be checked automatically, and Amplibee says so instead of guessing.'] },
      { h: 'What is the launch plan?', body: ['It lists the directories to submit to, ranked by the points each would add, with the submission page for each one. The missing listings become a to-do list.'] },
      { h: 'Can Amplibee submit for me?', body: ['Yes. Submit with the links in the plan, or let Amplibee do 150+ directory submissions for you on a paid plan. See the plans page for what each includes.'] },
    ],
    faq: [
      { q: 'Which directories should a new SaaS submit to?', a: 'Start with one review directory such as G2 or Capterra, one alternatives directory such as AlternativeTo or SaaSHub, one launch site such as Product Hunt, and a developer community if it fits. The launch plan ranks them for your product.' },
      { q: 'How do I find out if my product is listed on a directory?', a: 'Run an Amplibee check. The directories page shows listed, not found or not checked yet for each one.' },
      { q: 'Do directory listings help SEO?', a: 'A listing is a page on another site that names your product and links to it. That gives search engines and AI assistants another place that confirms you exist. No tool can promise a ranking.' },
      { q: 'Can I submit to directories for free?', a: 'Yes. The plan gives you a submission page for each directory, and you can submit yourself at no cost.' },
      { q: 'Can someone submit my product to directories for me?', a: 'Yes. Paid plans include directory submissions, covering 150+ directories.' },
    ],
    keywords: ['directory submission', 'startup directories', 'product launch directories', 'where to list a SaaS', 'submit to Product Hunt alternatives'],
    blogs: ['where-to-list-a-new-saas', 'first-mentions'],
    tone: '#4a3410',
  },
  {
    slug: 'gap-finder',
    name: 'Gap finder',
    tagline: 'Fixes ranked by points',
    headline: 'Find and fix the gaps that hold your visibility back',
    summary: 'Every gap Amplibee finds shows what is wrong and the points your score would gain if you fixed it. The plan puts the biggest gain first.',
    updated: UPDATED,
    answer: 'Amplibee lists every gap in your visibility, from missing directory listings to a missing sitemap, and shows the points each fix would add to your score. The plan is ordered by impact, so you start with the change that matters most.',
    sections: [
      { h: 'What is a gap?', body: ['A gap is one specific thing that is missing or broken, such as no listing on a directory, no structured data on the homepage or a blocked folder in robots.txt.'] },
      { h: 'How are gaps ranked?', body: ['By impact: the points the score would gain if the gap were fixed. The biggest gain comes first, with a severity label beside it.'] },
      { h: 'What does each gap tell me?', body: ['What we found, why it matters and the action to take. Every gap maps to one action, and for page gaps that is a short guide.'] },
      { h: 'How do I know it worked?', body: ['Run the check again after each fix. The score and every gap are recalculated from live requests, and the analytics page keeps the readings so you can see the trend.'] },
    ],
    faq: [
      { q: 'How do I find out what is wrong with my website’s visibility?', a: 'Run an Amplibee check. It lists each gap with a severity and the points fixing it would add.' },
      { q: 'What should I fix first?', a: 'The gap at the top of the list. The plan is ranked by points gained, so the biggest gain comes first.' },
      { q: 'Does fixing every gap guarantee a higher ranking?', a: 'No. The plan shows the work that moves your own score. It does not promise a result in search or in AI answers.' },
      { q: 'How often should I run the check?', a: 'After each batch of fixes. The check recalculates everything from live requests.' },
      free,
    ],
    keywords: ['website visibility gaps', 'SEO gap analysis', 'fix list for startups', 'visibility audit', 'launch checklist'],
    blogs: ['technical-basics', 'where-to-list-a-new-saas'],
    tone: '#1f2a5c',
  },
  {
    slug: 'competitor-comparison',
    name: 'Competitors',
    tagline: 'Rank, mentions, page basics',
    headline: 'Competitor comparison: see who is ahead and by how much',
    summary: 'Add your competitors and see their domain rank, Hacker News stories, GitHub mentions and page basics next to yours.',
    updated: UPDATED,
    answer: 'Amplibee checks your competitors the same way it checks you: domain rank, Hacker News stories, GitHub mentions and page basics such as structured data and the Open Graph image. The numbers sit side by side, so you know who is ahead and by how much.',
    sections: [
      { h: 'What does Amplibee check on a competitor?', body: ['The same things it checks on you, so the figures are comparable.'], bullets: ['Domain rank', 'Hacker News stories', 'GitHub mentions', 'Page checks passed, including structured data and the Open Graph image'] },
      { h: 'How do I add competitors?', body: ['Name the products your buyers compare you with. Each one is checked the same way as your own site.'] },
      { h: 'How do I keep tracking them?', body: ['The competitors page shows their figures from your latest check. Run a new check to refresh them, and the analytics page draws a trend once there are readings from two different days.'] },
      { h: 'Does it read private data?', body: ['No. Checks use public information only.'] },
    ],
    faq: [
      { q: 'How do I find out who my competitors are online?', a: 'Name the products your buyers compare you with and Amplibee checks each one.' },
      { q: 'How do I compare my website with a competitor’s?', a: 'Add the competitor to your check. You see domain rank, Hacker News stories, GitHub mentions and page checks next to yours.' },
      { q: 'How do I see a competitor’s figures change?', a: 'Run a new check. Figures on the competitors page come from your latest check, and a competitor added after it shows a dash until you run one.' },
      { q: 'Is competitor research legal?', a: 'Amplibee uses public information only, the same pages and public sources anyone can open.' },
      free,
    ],
    keywords: ['competitor comparison tool', 'competitor analysis for startups', 'compare websites', 'domain rank comparison', 'competitor research'],
    blogs: ['first-mentions', 'where-to-list-a-new-saas'],
    tone: '#4d1f2e',
  },
  {
    slug: 'technical-seo-audit',
    name: 'Site audit',
    tagline: 'robots, sitemap, Open Graph',
    headline: 'Technical SEO audit: robots.txt, sitemap, Open Graph and structured data',
    summary: 'Amplibee runs the page checks that search engines, answer engines and link previews depend on, and says what to change for each one that fails.',
    updated: UPDATED,
    answer: 'Amplibee audits the page basics that search engines, answer engines and link previews depend on: HTTPS, title, meta description, canonical link, robots.txt, sitemap.xml, Open Graph and Twitter tags, JSON-LD, heading order, mobile viewport, language and image alt text.',
    sections: [
      {
        h: 'What does the site audit cover?',
        body: ['It looks at the things on your homepage that decide how it is crawled, understood and shared.'],
        bullets: ['HTTPS, page title, meta description and canonical link', 'robots.txt, sitemap.xml and whether the page is set to noindex', 'Open Graph tags, the Open Graph image and whether it loads, and the Twitter card', 'JSON-LD structured data', 'Heading order, mobile viewport, page language and image alt text'],
      },
      { h: 'Why do these checks matter?', body: ['Search engines read robots.txt and the sitemap to find your pages. Link previews use Open Graph. Answer engines use structured data for facts about your product. Missing ones make you harder to find or less clear when shared.'] },
      { h: 'What happens when a check fails?', body: ['It becomes a gap that says what is wrong, the points fixing it would add and a short guide to the fix.'] },
      { h: 'Can it catch mistakes before launch?', body: ['Yes. Founders have found a robots.txt that blocked a folder by mistake and a missing sitemap before launch day instead of after.'] },
    ],
    faq: [
      { q: 'How do I check my robots.txt and sitemap?', a: 'Run an Amplibee check. Both are page checks, along with the canonical link and whether the page is set to noindex.' },
      { q: 'What is an Open Graph image and why do I need one?', a: 'It is the picture shown when your link is shared on social sites and in chat apps. Without one, shared links show less than they could. Amplibee checks that it is set and that it loads.' },
      { q: 'What is JSON-LD structured data?', a: 'Machine-readable facts on your page that give search engines and answer engines a clear description of the product.' },
      { q: 'Why do heading order and alt text matter?', a: 'Screen readers and crawlers use heading order to read a page, and images without alt text are skipped by screen readers and image search.' },
      free,
    ],
    keywords: ['technical SEO audit', 'robots.txt checker', 'sitemap checker', 'Open Graph checker', 'JSON-LD checker', 'SEO audit tool'],
    blogs: ['technical-basics', 'what-an-og-image-is'],
    tone: '#0e3f4a',
  },
  {
    slug: 'ai-visibility-tracking',
    name: 'AI visibility',
    tagline: 'ChatGPT, Gemini, Perplexity',
    headline: 'AI visibility tracking: is your product named by ChatGPT, Gemini and Perplexity?',
    summary: 'Buyers now ask assistants which product to pick. Amplibee tracks the same questions across Google Search, ChatGPT, Perplexity and Gemini, and shows the gaps that keep a product from being named.',
    updated: UPDATED,
    answer: 'On plans that include it, Amplibee asks the questions your buyers ask in Google Search, ChatGPT, Perplexity and Gemini every day and shows whether your product is named. It also checks what makes that more likely: structured data on your site, directory listings and mentions from real people. No tool can promise a citation.',
    sections: [
      { h: 'How does AI visibility tracking work?', body: ['The AI visibility page runs your prompts across the tools your buyers use, every day, and shows whether you are named and how that changes.'] },
      { h: 'Which tools are tracked?', body: ['Google Search, ChatGPT, Perplexity and Gemini, and more.'] },
      { h: 'What decides whether an assistant names you?', body: ['Answer engines read your page, the directories and the mentions from other people. Amplibee checks all three: machine-readable facts on your site, listings on the directories those tools read, and mentions on places like Hacker News and GitHub.'] },
      { h: 'Does Amplibee promise a citation?', body: ['No. No tool can. It shows whether you are named today, the gaps that make that less likely and the plan to close them.'] },
    ],
    faq: [
      { q: 'How do I get my product mentioned by ChatGPT?', a: 'Publish machine-readable facts about the product, be listed on the directories assistants read, and earn mentions from real people. Amplibee checks each of these. Nobody can guarantee a citation.' },
      { q: 'What is generative engine optimization (GEO)?', a: 'It is making your product easy for AI assistants to find, understand and name. In practice that means clear facts on your own site, listings elsewhere and real mentions.' },
      { q: 'How do I check if ChatGPT recommends my brand?', a: 'Use AI visibility tracking. It asks the questions your buyers ask and shows whether you are named in each tool.' },
      { q: 'Which AI tools does Amplibee track?', a: 'Google Search, ChatGPT, Perplexity and Gemini, and more.' },
      { q: 'Is AI visibility tracking on every plan?', a: 'It is a plan feature, with a limit on the number of prompts tracked each day. The plans page lists what each plan includes.' },
    ],
    keywords: ['AI visibility', 'generative engine optimization', 'GEO', 'answer engine optimization', 'AEO', 'ChatGPT brand mentions', 'get recommended by ChatGPT'],
    blogs: ['how-answer-engines-pick-products', 'technical-basics'],
    tone: '#3b1f5c',
  },
  {
    slug: 'mentions-and-campaigns',
    name: 'Mentions',
    tagline: 'Hacker News, GitHub, creators',
    headline: 'Get your product mentioned by real people',
    summary: 'Amplibee measures your mentions on Hacker News and GitHub, then drafts a brief for a mentions campaign with creators, at a budget you set.',
    updated: UPDATED,
    answer: 'Amplibee counts the Hacker News stories and public GitHub repositories that mention your product, compares them with your competitors, and drafts a mentions campaign: a brief and a budget you set, carried out by creators who are paid to post, write about or engage with your product.',
    sections: [
      { h: 'How are mentions measured?', body: ['Amplibee counts Hacker News stories and public GitHub repositories that mention your product, and shows the same figures for your competitors.'] },
      { h: 'What is a mentions campaign?', body: ['A draft brief for an article or post about your product, with a link to your site and what the product does and who it is for. You set the starting budget and can edit the brief.'] },
      { h: 'Who writes the mentions?', body: ['Creators who are paid to post, write about or engage with your product.'] },
      { h: 'Is a result promised?', body: ['No. A campaign gets your product in front of people. It does not promise a result.'] },
    ],
    faq: [
      { q: 'How do I get my startup mentioned online?', a: 'Start with the places that already talk about products like yours, such as Hacker News and GitHub, then ask creators and communities to cover it. Amplibee measures where you stand and drafts the brief for a campaign.' },
      { q: 'Why do mentions matter for AI assistants?', a: 'Answer engines can only cite what real people have written about you. Mentions from real people are what they can point to.' },
      { q: 'Can I set my own budget?', a: 'Yes. The campaign starts from a suggested budget that you set.' },
      { q: 'Does Amplibee fake mentions?', a: 'No. Campaigns use creators who are paid to post, write about or engage with your product, and the posts are theirs.' },
    ],
    keywords: ['get mentioned online', 'brand mentions', 'Hacker News mentions', 'GitHub mentions', 'creator campaigns for startups'],
    blogs: ['first-mentions', 'how-answer-engines-pick-products'],
    tone: '#4a2f12',
  },
  {
    slug: 'content-planner',
    name: 'Content planner',
    tagline: 'Comparison pages and posts',
    headline: 'Content planner: comparison pages, blog posts and launch posts',
    summary: 'Amplibee turns your competitor list into content ideas, moves them from idea to published on a board, and on a paid plan writes the blog posts for you.',
    updated: UPDATED,
    answer: 'The content planner builds ideas from your competitor list: a comparison page for each competitor, a best-alternatives page, a blog post and a launch announcement. Ideas move across a board from ideas to drafting, scheduled and published, and paid plans include blog posts written for you.',
    sections: [
      {
        h: 'What does the content planner suggest?',
        body: ['It builds ideas from the competitors you add.'],
        bullets: ['A comparison page for each competitor: “your product vs competitor: which is right for you?”', 'A “best alternatives” page', 'A blog post on how the product helps customers, with a real example', 'A launch announcement post on what it does and who it is for'],
      },
      { h: 'How does the board work?', body: ['Each idea moves from ideas to drafting, scheduled and published, so you can see what is planned and what is done.'] },
      { h: 'Can someone write the posts for me?', body: ['Yes. Paid plans include blog posts written for you, and you can ask for one from any idea on the board. The plans page lists how many.'] },
    ],
    faq: [
      { q: 'What content should a SaaS publish for SEO?', a: 'Start with comparison pages against your competitors, a best-alternatives page and posts that show how the product solves a real problem. The planner suggests these from your competitor list.' },
      { q: 'Where do comparison page ideas come from?', a: 'From the competitors you add. Each one becomes a “you vs them” idea.' },
      { q: 'Can Amplibee write the content?', a: 'Paid plans include blog posts written for you. The plans page lists how many.' },
      { q: 'What kinds of content can I plan?', a: 'Blog posts, comparison pages and social posts, each moved from idea to published.' },
    ],
    keywords: ['content planner for startups', 'comparison page ideas', 'SaaS blog topics', 'alternatives page', 'content calendar'],
    blogs: ['where-to-list-a-new-saas', 'first-mentions'],
    tone: '#27303f',
  },
]

export const getFeature = (slug: string) => FEATURES.find((f) => f.slug === slug)

export const featureImage = (f: Feature) => `/features/${f.slug}/opengraph-image`

export const featureMonthYear = (f: Feature) => new Date(f.updated).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** Minutes to read a feature page, at about 220 words a minute, never less than 1. */
export function featureMinutes(f: Feature): number {
  const words = [f.answer, ...f.sections.flatMap((s) => [s.h, ...s.body, ...(s.bullets ?? [])]), ...f.faq.flatMap((x) => [x.q, x.a])].join(' ').split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}
