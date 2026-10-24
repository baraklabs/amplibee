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
  /** Dark background of the generated share image. */
  tone: string
  /** Optional real images: the share image (1200x630 jpg) and a smaller card thumbnail (webp). Without them the card draws one. */
  image?: string
  thumb?: string
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
    image: '/features/product-visibility-score-og.jpg',
    thumb: '/features/product-visibility-score-thumb.webp',
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
      { q: 'Do directory listings help SEO?', a: 'A listing is a page on another site that names your product and links to it. That gives search engines and AI assistants another place that confirms you exist, which improves your odds of ranking.' },
      { q: 'Can I submit to directories for free?', a: 'Yes. The plan gives you a submission page for each directory, and you can submit yourself at no cost.' },
      { q: 'Can someone submit my product to directories for me?', a: 'Yes. Paid plans include directory submissions, covering 150+ directories.' },
    ],
    keywords: ['directory submission', 'startup directories', 'product launch directories', 'where to list a SaaS', 'submit to Product Hunt alternatives'],
    blogs: ['where-to-list-a-new-saas', 'social-content-plan-for-a-launch'],
    tone: '#4a3410',
    image: '/features/directory-listings-og.jpg',
    thumb: '/features/directory-listings-thumb.webp',
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
      { q: 'Does fixing the gaps improve my ranking?', a: 'It improves your odds. The plan shows the work that moves your own score, and each fix makes you easier to find in search and in AI answers.' },
      { q: 'How often should I run the check?', a: 'After each batch of fixes. The check recalculates everything from live requests.' },
      free,
    ],
    keywords: ['website visibility gaps', 'SEO gap analysis', 'fix list for startups', 'visibility audit', 'launch checklist'],
    blogs: ['technical-basics', 'where-to-list-a-new-saas'],
    tone: '#1f2a5c',
    image: '/features/gap-finder-2-og.jpg',
    thumb: '/features/gap-finder-2-thumb.webp',
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
    blogs: ['where-to-list-a-new-saas', 'how-to-get-chatgpt-to-suggest-your-product'],
    tone: '#4d1f2e',
    image: '/features/competitor-comparison-3-og.jpg',
    thumb: '/features/competitor-comparison-3-thumb.webp',
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
    image: '/features/technical-seo-audit-og.jpg',
    thumb: '/features/technical-seo-audit-thumb.webp',
  },
  {
    slug: 'ai-visibility-tracking',
    name: 'AI visibility',
    tagline: 'ChatGPT, Gemini, Perplexity',
    headline: 'AI visibility tracking: is your product named by ChatGPT, Gemini and Perplexity?',
    summary: 'Buyers now ask assistants which product to pick. Amplibee tracks the same questions across Google Search, ChatGPT, Perplexity and Gemini, and shows the gaps that keep a product from being named.',
    updated: UPDATED,
    answer: 'On plans that include it, Amplibee asks the questions your buyers ask in Google Search, ChatGPT, Perplexity and Gemini every day and shows whether your product is named. It also checks what makes that more likely: structured data on your site, directory listings and mentions from real people, which improves your odds of being named.',
    sections: [
      { h: 'How does AI visibility tracking work?', body: ['The AI visibility page runs your prompts across the tools your buyers use, every day, and shows whether you are named and how that changes.'] },
      { h: 'Which tools are tracked?', body: ['Google Search, ChatGPT, Perplexity and Gemini, and more.'] },
      { h: 'What decides whether an assistant names you?', body: ['Answer engines read your page, the directories and the mentions from other people. Amplibee checks all three: machine-readable facts on your site, listings on the directories those tools read, and mentions on places like Hacker News and GitHub.'] },
      { h: 'Will fixing the gaps get me named?', body: ['It improves your odds. Amplibee shows whether you are named today, the gaps that make that less likely and the plan to close them.'] },
    ],
    faq: [
      { q: 'How do I get my product mentioned by ChatGPT?', a: 'Publish machine-readable facts about the product, be listed on the directories assistants read, and earn mentions from real people. Amplibee checks each of these, and each one improves your odds of being named.' },
      { q: 'What is generative engine optimization (GEO)?', a: 'It is making your product easy for AI assistants to find, understand and name. In practice that means clear facts on your own site, listings elsewhere and real mentions.' },
      { q: 'How do I check if ChatGPT recommends my brand?', a: 'Use AI visibility tracking. It asks the questions your buyers ask and shows whether you are named in each tool.' },
      { q: 'Which AI tools does Amplibee track?', a: 'Google Search, ChatGPT, Perplexity and Gemini, and more.' },
      { q: 'Is AI visibility tracking on every plan?', a: 'It is a plan feature, with a limit on the number of prompts tracked each day. The plans page lists what each plan includes.' },
    ],
    keywords: ['AI visibility', 'generative engine optimization', 'GEO', 'answer engine optimization', 'AEO', 'ChatGPT brand mentions', 'get recommended by ChatGPT'],
    blogs: ['how-to-get-chatgpt-to-suggest-your-product', 'technical-basics'],
    tone: '#3b1f5c',
    image: '/features/ai-visibility-tracking-og.jpg',
    thumb: '/features/ai-visibility-tracking-thumb.webp',
  },
  {
    slug: 'content-planner',
    name: 'Content planner',
    tagline: 'Social posts and blog posts',
    headline: 'Content planner for X, LinkedIn, Facebook, Product Hunt and blog posts',
    summary: 'Get posts for X, LinkedIn, Facebook and Product Hunt, and blog posts for your site, each curated for your product and your application, so your product shows up where buyers look.',
    updated: UPDATED,
    answer: 'The content planner gives you posts for the platforms where buyers look, X, LinkedIn, Facebook and Product Hunt, and blog posts for your own site. Each one is curated for your product and your application, so it talks about what you actually built and who it is for, not generic marketing copy.',
    sections: [
      {
        h: 'Which platforms does the content planner cover?',
        body: ['The places where founders and buyers discover products, and your own blog.'],
        bullets: ['X: short posts and threads about what you shipped', 'LinkedIn: posts for founders, teams and buyers', 'Facebook: posts for communities and pages', 'Product Hunt: the launch post and the first comment', 'Your blog: posts that answer what buyers search for'],
      },
      { h: 'Are the posts generic?', body: ['No. Each post is curated for your product and your application, using what the product does, who it is for and how it compares with others in its category. A post for Product Hunt reads differently from one for LinkedIn, and both are about your product.'] },
      { h: 'How does it help your visibility?', body: ['Posts on the platforms buyers use give people, search engines and AI assistants more places that name your product and link to it. A steady plan beats a single launch day.'] },
      { h: 'Can someone write the blog posts for me?', body: ['Yes. Paid plans include blog posts written for you, curated for your product. The plans page lists how many.'] },
    ],
    faq: [
      { q: 'What should a SaaS post on X and LinkedIn?', a: 'What you shipped, a real example of a customer problem you solved, and what the product does and who it is for. The planner curates them for your product and each platform.' },
      { q: 'How do I plan a Product Hunt launch?', a: 'Plan the launch post, the first comment and the posts on other platforms around launch day. The planner curates each one for your product.' },
      { q: 'Does posting on social platforms help visibility?', a: 'It gives people and search engines more places that name your product and link to it, which improves your odds of ranking and of being named.' },
      { q: 'Which platforms can I plan content for?', a: 'X, LinkedIn, Facebook and Product Hunt, plus blog posts for your own site.' },
      { q: 'Can Amplibee write the content?', a: 'Paid plans include blog posts written for you. The plans page lists how many.' },
    ],
    keywords: ['content planner for startups', 'social media planner for SaaS', 'LinkedIn post planner', 'X post planner', 'Product Hunt launch plan', 'Facebook post planner', 'blog post ideas for SaaS'],
    blogs: ['social-content-plan-for-a-launch', 'where-to-list-a-new-saas'],
    tone: '#27303f',
    image: '/features/content-planner-og.jpg',
    thumb: '/features/content-planner-thumb.webp',
  },
]

export const getFeature = (slug: string) => FEATURES.find((f) => f.slug === slug)

export const featureImage = (f: Feature) => f.image ?? `/features/${f.slug}/opengraph-image`

/** The smaller picture on cards: the thumbnail when there is one. */
export const featureThumb = (f: Feature) => f.thumb ?? featureImage(f)

export const featureMonthYear = (f: Feature) => new Date(f.updated).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** Minutes to read a feature page, at about 220 words a minute, never less than 1. */
export function featureMinutes(f: Feature): number {
  const words = [f.answer, ...f.sections.flatMap((s) => [s.h, ...s.body, ...(s.bullets ?? [])]), ...f.faq.flatMap((x) => [x.q, x.a])].join(' ').split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}
