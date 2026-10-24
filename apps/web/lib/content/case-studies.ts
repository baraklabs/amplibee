// Case studies at /case-studies and /case-studies/<slug>: one per use case.
// Each walks through what Amplibee does for that job, using a real stored check (data/sample-report.json) of a well-known
// product. Every number is read from that file, so a study can never disagree with the data. The product's name is
// left out, and every page says it is a real check and not a customer story.
// Only describe what the product does today. The sources are the report itself, the dashboard pages and the home page.

import sampleData from '../../data/sample-report.json'
import { FIX_LABEL, firstSentence, num } from '../format.ts'

export interface CaseStat {
  value: string
  label: string
}

export interface CaseStudy {
  slug: string
  /** The use case, as a short label. Shown above the title on cards and on the page. */
  kind: string
  /** The use case as the title of the generated thumbnail and share image. */
  name: string
  /** Shown under the name on the generated thumbnail and share image. */
  tagline: string
  /** One line for the card and the page heading. */
  headline: string
  /** Two sentences for the card and the meta description. */
  summary: string
  /** YYYY-MM-DD */
  updated: string
  /** The direct answer shown first on the page and in the structured data, so a search snippet or an AI answer can quote it. */
  answer: string
  stats: CaseStat[]
  /** Headings are questions; each section opens with its answer. */
  sections: { h: string; body: string[]; bullets?: string[]; bulletKind?: 'ok' | 'gap' | 'todo' }[]
  /** What people ask about the study. Shown on the page and as FAQ structured data. */
  faq: { q: string; a: string }[]
  /** Slugs of the blog posts that go deeper on this use case. */
  blogs: string[]
  /** Optional thumbnail and share image paths (1200x630 ratio). Without them the card draws one from the name and tagline. */
  thumb?: string
  image?: string
}

/** What a card or page shows about a study. */
export interface CaseFacts {
  name: string
  sub: string
  stats: CaseStat[]
}

interface Competitor {
  domain: string
  rank: number | null
  hn: number | null
  github: number | null
  tech_passed: number | null
  tech_total: number | null
  structured_data: boolean | null
}
interface Sample {
  taken_at: string
  report: {
    score: number | null
    sub_scores: Record<string, number | null>
    gaps: { id: string; category: string; impact: number; message: string }[]
    self: Competitor
    competitors: Competitor[]
    plan: { gap_id: string; title: string; fix_type: string }[]
    directories: { name: string; status: string }[]
  }
  technical: { id: string; pass: boolean }[]
}

const sample = sampleData as unknown as Sample
const r = sample.report
const self = r.self

const monthYear = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const pts = (n: number) => `+${Number(n.toFixed(1))}`
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

const TECH_LABEL: Record<string, string> = {
  https: 'HTTPS',
  title: 'Page title',
  description: 'Meta description',
  canonical: 'Canonical link',
  og_tags: 'Open Graph tags',
  og_image: 'Open Graph image',
  og_image_reachable: 'Open Graph image loads',
  twitter_card: 'Twitter card',
  sitemap: 'sitemap.xml',
  robots: 'robots.txt',
  structured_data: 'JSON-LD structured data',
  headings: 'Heading order',
  viewport: 'Mobile viewport',
  lang: 'Page language',
  image_alt: 'Image alt text',
  indexable: 'Indexable, no noindex tag',
  og_type: 'Open Graph type',
}
const label = (id: string) => TECH_LABEL[id] ?? id

const passed = sample.technical.filter((t) => t.pass)
const failed = sample.technical.filter((t) => !t.pass)
const techGaps = r.gaps.filter((g) => g.category === 'technical')
const techPoints = sum(techGaps.map((g) => g.impact))
const allPoints = sum(r.gaps.map((g) => g.impact))
const dirGap = r.gaps.find((g) => g.id === 'directories')
const rivals = r.competitors
const rivalRanks = rivals.map((c) => c.rank).filter((n): n is number => n !== null)
const outMentions = rivals.filter((c) => self.hn !== null && c.hn !== null && self.hn > c.hn).length
const when = monthYear(sample.taken_at)
const score = r.score === null ? 'no score' : `${r.score} out of 100`
const subs = Object.entries(r.sub_scores).map(([k, v]) => `${k.charAt(0).toUpperCase()}${k.slice(1)}: ${v ?? '-'} of 100`)

const WHAT = `This walkthrough uses a real check of a well-known project management tool, run on ${when}, with the name left out. It is not a customer story.`
const SKIPPED = 'Search indexing, web mention and speed checks were skipped for this run, so the score rests on the page, directory, rank and mention checks only.'
const runIt = { q: 'Can I run the same check on my product?', a: 'Yes. The visibility check is free. Enter your website and you get your score and your gaps.' }

const compLine = (c: Competitor, i: number) =>
  `Competitor ${'ABC'[i]}: domain rank ${c.rank === null ? 'not in the top 100,000' : num(c.rank)}, ${c.hn === null ? 'no' : num(c.hn)} Hacker News stories, ${c.github === null ? 'no' : num(c.github)} GitHub mentions, ${c.tech_passed} of ${c.tech_total} page checks passed`

const STUDIES: CaseStudy[] = [
  {
    slug: 'site-audit-robots-og-seo',
    kind: 'Site audit',
    name: 'Site audit',
    tagline: `${passed.length} of ${sample.technical.length} page checks passed`,
    headline: `What a site audit found: ${passed.length} of ${sample.technical.length} page checks passed`,
    summary: `A project management tool’s homepage passed ${passed.length} of ${sample.technical.length} page checks, including robots.txt, sitemap.xml and its Open Graph image. The ${failed.length} it failed are listed with the points each one is worth.`,
    updated: sample.taken_at,
    answer: `Amplibee ran ${sample.technical.length} page checks on the homepage of a well-known project management tool. It passed ${passed.length}, including robots.txt, sitemap.xml, the canonical link and the Open Graph image, and failed ${failed.length}: ${failed.map((t) => label(t.id)).join(', ')}.`,
    stats: [
      { value: `${passed.length}/${sample.technical.length}`, label: 'page checks passed' },
      { value: String(failed.length), label: 'page gaps found' },
      { value: pts(techPoints), label: 'points available from page fixes' },
    ],
    sections: [
      { h: 'What is this check?', body: [WHAT, SKIPPED] },
      {
        h: 'What does the page check cover?',
        body: [`It looks at ${sample.technical.length} things on the homepage that search engines, answer engines and link previews depend on: ${sample.technical.map((t) => label(t.id)).join(', ')}.`],
      },
      { h: 'What passed?', body: [`${passed.length} checks passed, so the basics were in place.`], bullets: passed.map((t) => label(t.id)), bulletKind: 'ok' },
      {
        h: 'What failed, and what is each gap worth?',
        body: ['Each gap says what is wrong and shows the points the score would gain if you fixed it.'],
        bullets: techGaps.map((g) => `${firstSentence(g.message)} (${pts(g.impact)} points)`),
        bulletKind: 'gap',
      },
      {
        h: 'What does the plan say to do?',
        body: ['Every gap maps to one action. For page gaps that is a short guide.'],
        bullets: r.plan.filter((p) => techGaps.some((g) => g.id === p.gap_id)).map((p) => `${p.title} (${FIX_LABEL[p.fix_type] ?? p.fix_type})`),
        bulletKind: 'todo',
      },
    ],
    faq: [
      { q: 'Does Amplibee check robots.txt and the sitemap?', a: 'Yes. robots.txt and sitemap.xml are two of the page checks, along with the canonical link and whether the page is set to noindex.' },
      { q: 'Which Open Graph tags does it check?', a: 'The Open Graph tags, the Open Graph image and whether it loads, the Open Graph type and the Twitter card. Missing ones make shared links show less than they could.' },
      { q: 'Why does JSON-LD matter?', a: 'Without it, search engines and answer engines get no machine-readable facts about the product.' },
      { q: 'Why do heading order and alt text matter?', a: 'Screen readers and crawlers use heading order to read a page, and images without alt text are skipped by screen readers and image search.' },
      runIt,
    ],
    blogs: ['technical-basics', 'what-an-og-image-is'],
  },
  {
    slug: 'competitor-research',
    kind: 'Competitor research',
    name: 'Competitors',
    tagline: `${rivals.length} competitors compared`,
    headline: `${rivals.length} competitors compared: rank, mentions and page checks`,
    summary: `A project management tool was set beside ${rivals.length} competitors. Each was checked for domain rank, Hacker News stories, GitHub mentions and page basics, so it was clear who is ahead and by how much.`,
    updated: sample.taken_at,
    answer: `Amplibee checked ${rivals.length} competitors of a well-known project management tool for domain rank, mentions and page basics. The tool ranked ${num(self.rank ?? 0)}, against ${num(Math.min(...rivalRanks))} to ${num(Math.max(...rivalRanks))} for the competitors, and had more Hacker News stories than ${outMentions} of them.`,
    stats: [
      { value: String(rivals.length), label: 'competitors compared' },
      { value: `${outMentions} of ${rivals.length}`, label: 'competitors out-mentioned on Hacker News' },
      { value: `${num(self.rank ?? 0)}`, label: `domain rank, against ${num(Math.min(...rivalRanks))} to ${num(Math.max(...rivalRanks))}` },
    ],
    sections: [
      { h: 'What is this check?', body: [WHAT, SKIPPED] },
      {
        h: 'What does Amplibee check on a competitor?',
        body: ['The same things it checks on you, so the numbers sit side by side: domain rank, Hacker News stories, GitHub mentions and page basics.'],
      },
      {
        h: 'What did the comparison show?',
        body: [`The tool itself: domain rank ${num(self.rank ?? 0)}, ${num(self.hn ?? 0)} Hacker News stories, ${num(self.github ?? 0)} GitHub mentions, ${self.tech_passed} of ${self.tech_total} page checks passed. The competitors:`],
        bullets: rivals.map(compLine),
      },
      {
        h: 'Where was the product ahead, and where behind?',
        body: [
          `It had more Hacker News stories than ${outMentions} of ${rivals.length} competitors, and passed more page checks than ${rivals.filter((c) => (c.tech_passed ?? 0) < (self.tech_passed ?? 0)).length} of them.`,
          `All ${rivals.length} competitors had a better domain rank, and ${rivals.filter((c) => (c.tech_passed ?? 0) > (self.tech_passed ?? 0)).length} passed more page checks.`,
        ],
      },
      {
        h: 'How do you keep tracking competitors?',
        body: ['Add the products your buyers compare you with, and the competitors page shows their figures from your latest check. Run a new check to refresh them, and the analytics page draws a trend once there are readings from two different days.'],
      },
    ],
    faq: [
      { q: 'What does Amplibee check on a competitor?', a: 'Domain rank, Hacker News stories, GitHub mentions and page basics such as structured data and the Open Graph image.' },
      { q: 'How many competitors can I compare?', a: 'You name the competitors. Each one is checked the same way as your own site.' },
      { q: 'How do I see a competitor’s figures change?', a: 'Run a new check. Figures on the competitors page come from your latest check, and a competitor added after it shows a dash until you run one.' },
      { q: 'Does it read private data?', a: 'No. Checks use public information only.' },
      runIt,
    ],
    blogs: ['first-mentions', 'where-to-list-a-new-saas'],
  },
  {
    slug: 'rank-among-competitors',
    kind: 'Ranking plan',
    name: 'Ranking plan',
    tagline: `${r.gaps.length} gaps ranked by points gained`,
    headline: `A plan to catch the competitors: ${r.gaps.length} gaps ranked by points gained`,
    summary: `After comparing a project management tool with its competitors, Amplibee ranked its ${r.gaps.length} gaps by the points each would add. Together they are worth ${pts(allPoints)} points.`,
    updated: sample.taken_at,
    answer: `Amplibee turned the gaps found on a well-known project management tool into a plan, ranked by the points each fix would add. The ${r.gaps.length} gaps are worth ${pts(allPoints)} points, and the biggest single one, directory listings, is worth ${pts(r.gaps[0]?.impact ?? 0)}.`,
    stats: [
      { value: r.score === null ? '-' : String(r.score), label: 'visibility score out of 100' },
      { value: String(r.gaps.length), label: 'gaps ranked' },
      { value: pts(allPoints), label: 'points on offer in total' },
    ],
    sections: [
      { h: 'What is this check?', body: [WHAT, SKIPPED] },
      {
        h: 'Where did the product stand?',
        body: [`It scored ${score}. The score is made of four parts, each out of 100.`],
        bullets: subs,
      },
      {
        h: 'What should come first?',
        body: ['The plan is ordered by impact. Each line is one gap and the points the score would gain if you fixed it.'],
        bullets: r.gaps.map((g) => `${firstSentence(g.message)} (${pts(g.impact)} points)`),
        bulletKind: 'todo',
      },
      {
        h: 'Why do directory listings come first?',
        body: [dirGap ? dirGap.message : 'Directory listings gave the largest single gain.', 'They are also the work Amplibee can do for you on a paid plan.'],
      },
      {
        h: 'How do you know the plan is working?',
        body: ['Run the check again after each fix. The score and every gap are recalculated from live requests, and the analytics page keeps the readings so you can see the trend.'],
      },
    ],
    faq: [
      { q: 'How are gaps ranked?', a: 'By impact: the points the score would gain if the gap were fixed. The biggest gain comes first.' },
      { q: 'Does fixing every gap guarantee a higher rank than my competitors?', a: 'No. The plan shows the work that moves your own score, next to competitor figures. It does not promise a result.' },
      { q: 'Can Amplibee do the work?', a: 'You can submit to the directories yourself, or let Amplibee do it on a paid plan.' },
      { q: 'How often should I run the check?', a: 'After each batch of fixes. The check recalculates everything from live requests.' },
      runIt,
    ],
    blogs: ['where-to-list-a-new-saas', 'technical-basics'],
  },
  {
    slug: 'get-cited-by-ai-assistants',
    kind: 'AI visibility',
    name: 'AI citations',
    tagline: 'ChatGPT, Gemini, Perplexity',
    headline: 'Getting named by ChatGPT, Gemini and other AI assistants',
    summary: 'Buyers now ask assistants which product to pick. Amplibee tracks the same questions across Google Search, ChatGPT, Perplexity and Gemini, and finds the gaps that keep a product from being named.',
    updated: sample.taken_at,
    answer: 'To be named by ChatGPT, Gemini and other assistants, a product needs machine-readable facts on its own site, listings on the directories those tools read, and mentions from other people. Amplibee checks all three and tracks whether assistants name you when buyers ask.',
    stats: [
      { value: '4', label: 'search surfaces tracked' },
      { value: techGaps.some((g) => g.id === 'structured_data') ? 'Missing' : 'Found', label: 'JSON-LD on the homepage' },
      { value: `${num(self.hn ?? 0)}`, label: 'Hacker News stories linking to it' },
    ],
    sections: [
      { h: 'What is this check?', body: [WHAT, SKIPPED] },
      {
        h: 'How does Amplibee track AI visibility?',
        body: ['On plans that include it, the AI visibility page asks the same questions your buyers ask in the tools they use, every day, and shows whether you are named. The tools are Google Search, ChatGPT, Perplexity and Gemini, and more.'],
      },
      {
        h: 'What on your own site decides whether you are named?',
        body: ['Answer engines read the page. In this check the homepage had no JSON-LD structured data.', r.gaps.find((g) => g.id === 'structured_data')?.message ?? 'Structured data gives answer engines machine-readable facts about the product.'],
      },
      {
        h: 'What do directories and mentions add?',
        body: [
          dirGap ? firstSentence(dirGap.message) : 'Listings give buyers and crawlers a second place to find you.',
          `Outside the site, ${num(self.hn ?? 0)} Hacker News stories and ${num(self.github ?? 0)} public GitHub repositories mention the product. Mentions from real people are what answer engines can cite.`,
        ],
      },
      {
        h: 'Does Amplibee promise a citation?',
        body: ['No. No tool can. It shows you whether you are named today, the gaps that make that less likely and the plan to close them.'],
      },
    ],
    faq: [
      { q: 'Which AI tools does Amplibee track?', a: 'Google Search, ChatGPT, Perplexity and Gemini, and more.' },
      { q: 'What can I do to be cited by ChatGPT or Gemini?', a: 'Publish machine-readable facts about the product, be listed on the directories assistants read, and earn mentions from real people. Amplibee checks each of these.' },
      { q: 'What is JSON-LD?', a: 'Structured data on your page that gives search engines and answer engines machine-readable facts about the product.' },
      { q: 'Is AI visibility tracking on every plan?', a: 'It is a plan feature, with a limit on the number of prompts tracked each day. The plans page lists what each plan includes.' },
      runIt,
    ],
    blogs: ['how-answer-engines-pick-products', 'technical-basics'],
  },
  {
    slug: 'missing-platforms-content-plan',
    kind: 'Content plan',
    name: 'Content plan',
    tagline: dirGap ? '4 of 17 listings confirmed' : 'Platforms and posts',
    headline: 'Finding the platforms you are missing and planning posts to fill them',
    summary: 'Amplibee showed which directories a project management tool was missing, then the content planner turned the competitor list into comparison pages, a blog post and a launch post.',
    updated: sample.taken_at,
    answer: `${dirGap ? firstSentence(dirGap.message) : 'Amplibee shows which directories you are missing.'} The content planner then suggests what to publish: a comparison page for each competitor, a best-alternatives page, a blog post and a launch post.`,
    stats: [
      { value: '17', label: 'directories checked' },
      { value: '4', label: 'listings confirmed' },
      { value: '12', label: 'could not be confirmed automatically' },
    ],
    sections: [
      { h: 'What is this check?', body: [WHAT, SKIPPED] },
      {
        h: 'Which platforms was the product missing?',
        body: [dirGap ? dirGap.message : 'The directories page shows, for each directory, whether you are listed, not found or not checked yet.'],
      },
      {
        h: 'How do you see them?',
        body: ['The directories page lists every directory with a status: listed, not found or not checked yet. Each one has a submission page, so the missing ones turn into a to-do list.'],
      },
      {
        h: 'What does the content planner suggest?',
        body: ['It builds ideas from your competitor list and shows them as a board that moves from ideas to drafting, scheduled and published.'],
        bullets: [
          'A comparison page for each competitor: “your product vs competitor: which is right for you?”',
          'A “best alternatives” page',
          'A blog post on how the product helps customers, with a real example',
          'A launch announcement post on what it does and who it is for',
        ],
        bulletKind: 'todo',
      },
      {
        h: 'Can someone write the posts for you?',
        body: ['Yes. Paid plans include blog posts written for you, and you can ask for one from any idea on the board.'],
      },
    ],
    faq: [
      { q: 'How does Amplibee know which platforms I am missing?', a: 'It checks the directories it knows for your listing. Some cannot be checked automatically, and Amplibee says so instead of guessing.' },
      { q: 'What kinds of content can I plan?', a: 'Blog posts, comparison pages and social posts, each moved from idea to drafting, scheduled and published.' },
      { q: 'Where do comparison page ideas come from?', a: 'From the competitors you add. Each one becomes a “you vs them” idea.' },
      { q: 'Can Amplibee write the content?', a: 'Paid plans include blog posts written for you. The plans page lists how many.' },
      runIt,
    ],
    blogs: ['where-to-list-a-new-saas', 'first-mentions'],
  },
  {
    slug: 'launch-on-directories',
    kind: 'Directory launch',
    name: 'Directories',
    tagline: '17 directories checked',
    headline: 'Launching on the directories that matter, from a ranked list to submitted',
    summary: 'A launch plan lists the directories to submit to, with the submission page for each. A project management tool had 4 of 17 confirmed, and the rest became the to-do list.',
    updated: sample.taken_at,
    answer: `Amplibee checks 17 directories for your listing and turns the missing ones into a launch plan, with a submission page for each. ${dirGap ? firstSentence(dirGap.message) : ''} You can submit yourself, or let Amplibee submit you to 150+ directories on a paid plan.`.trim(),
    stats: [
      { value: '17', label: 'directories checked' },
      { value: '4', label: 'listings confirmed' },
      { value: '150+', label: 'directories we submit to' },
    ],
    sections: [
      { h: 'What is this check?', body: [WHAT, SKIPPED] },
      {
        h: 'What did the check find?',
        body: [dirGap ? dirGap.message : 'It found which directories listed the product and which did not.'],
      },
      {
        h: 'What does the launch plan look like?',
        body: ['The first step of the plan was a directory submission, ranked by the points it would add.', 'It lists the directories to submit to, with the submission page for each.'],
        bullets: r.directories.slice(0, 8).map((d) => d.name),
      },
      {
        h: 'Which directories are checked?',
        body: ['Directories for products and for founders, communities, review sites and developer platforms, such as Product Hunt, Hacker News, AlternativeTo, SaaSHub, G2 and DEV Community.'],
      },
      {
        h: 'Can Amplibee submit for you?',
        body: ['Yes. Submit to the directories yourself using the links in the plan, or let Amplibee do 150+ directory submissions for you on a paid plan.'],
      },
    ],
    faq: [
      { q: 'How many directories does Amplibee check?', a: '17 directories in this check. Submissions on a paid plan cover 150+.' },
      { q: 'What if a directory cannot be checked automatically?', a: 'It is shown as not checked yet, because a listing may exist that the check did not see.' },
      { q: 'Do I have to pay to submit?', a: 'No. The plan gives you a submission page for each directory, and you can submit yourself for free.' },
      { q: 'Which directories come first?', a: 'The plan is ranked by impact, so the biggest gain comes first.' },
      runIt,
    ],
    blogs: ['where-to-list-a-new-saas', 'first-mentions'],
  },
  {
    slug: 'get-mentioned-by-real-people',
    kind: 'Mentions',
    name: 'Mentions',
    tagline: `${num(self.hn ?? 0)} Hacker News stories`,
    headline: 'Getting mentioned by real people: from a brief to a campaign',
    summary: `A project management tool already had ${num(self.hn ?? 0)} Hacker News stories and ${num(self.github ?? 0)} GitHub mentions. Amplibee measures that starting point, then drafts a brief for a mentions campaign.`,
    updated: sample.taken_at,
    answer: `Amplibee counts the mentions a product already has, here ${num(self.hn ?? 0)} Hacker News stories and ${num(self.github ?? 0)} public GitHub repositories, then helps you get more by drafting a brief and a suggested budget for a mentions campaign that you can change.`,
    stats: [
      { value: num(self.hn ?? 0), label: 'Hacker News stories' },
      { value: num(self.github ?? 0), label: 'GitHub repositories mention it' },
      { value: '$60', label: 'suggested starting budget, yours to change' },
    ],
    sections: [
      { h: 'What is this check?', body: [WHAT, SKIPPED] },
      {
        h: 'How are mentions measured?',
        body: [`Amplibee looks up public sources. For this product ${num(self.hn ?? 0)} Hacker News stories link to the domain, and ${num(self.github ?? 0)} public GitHub repositories mention it in a README.`],
      },
      {
        h: 'Why do mentions matter?',
        body: ['Mentions from real people are a signal search engines and answer engines can see, and they are the hardest part for a new product to earn.'],
      },
      {
        h: 'What does a mentions campaign involve?',
        body: ['Amplibee drafts a brief that says what the product does and who it is for, with a suggested starting budget. In the example the budget was $60, and you set the final price.'],
      },
      {
        h: 'Where does the campaign fit in the plan?',
        body: ['A mentions campaign is one of the action types in a launch plan, next to guides, directory submissions, review collection and content.'],
      },
    ],
    faq: [
      { q: 'Where do mention counts come from?', a: 'Public sources: Hacker News stories that link to the domain, and public GitHub repositories that mention it.' },
      { q: 'What does a mentions campaign cost?', a: 'Amplibee suggests a starting budget in the brief, $60 in the example, and you set the final price.' },
      { q: 'Does it guarantee mentions?', a: 'No. It prepares the brief and runs the campaign. It does not promise a result.' },
      { q: 'Do mentions help with AI assistants?', a: 'Mentions from real people are something answer engines can cite. See how answer engines pick products.' },
      runIt,
    ],
    blogs: ['first-mentions', 'how-answer-engines-pick-products'],
  },
  {
    slug: 'track-your-score',
    kind: 'Score tracking',
    name: 'Score tracking',
    tagline: r.score === null ? 'Visibility score' : `Score ${r.score} out of 100`,
    headline: 'Tracking a visibility score from one check to the next',
    summary: `A project management tool scored ${score}, made of four parts. Amplibee keeps each reading, so after a second check on a different day the analytics page draws the trend.`,
    updated: sample.taken_at,
    answer: `Amplibee scores a product out of 100 from four parts: discoverability, buzz, trust and technical. Each reading is saved to your account, and once there are readings from two different days the analytics page draws a line so you can see whether your fixes worked. This product scored ${score}.`,
    stats: [
      { value: r.score === null ? '-' : String(r.score), label: 'visibility score out of 100' },
      { value: String(Object.keys(r.sub_scores).length), label: 'parts make the score' },
      { value: '2', label: 'days of readings to draw a trend' },
    ],
    sections: [
      { h: 'What is this check?', body: [WHAT, SKIPPED] },
      {
        h: 'What is in the score?',
        body: [`It scored ${score}. Four parts make one number out of 100.`],
        bullets: subs,
      },
      {
        h: 'How is the score tracked over time?',
        body: ['Each check records a reading in your account. The analytics page shows one reading as a number, and draws a line once there are readings from two different days.'],
      },
      {
        h: 'What should you do between checks?',
        body: ['Work through the plan in order of points gained, then run the check again. The score and every gap are recalculated from live requests.'],
        bullets: r.gaps.slice(0, 3).map((g) => `${firstSentence(g.message)} (${pts(g.impact)} points)`),
        bulletKind: 'todo',
      },
      {
        h: 'How do competitors fit in?',
        body: ['The competitors page shows each competitor’s figures from your latest check, so a new check moves your numbers and theirs together.'],
      },
    ],
    faq: [
      { q: 'What does the visibility score measure?', a: 'Four parts: discoverability, buzz, trust and technical. Each is out of 100, and together they make one number out of 100.' },
      { q: 'Where are my readings saved?', a: 'In your account, so you can come back and compare.' },
      { q: 'When does the trend line appear?', a: 'Once there are readings from two different days.' },
      { q: 'Why might my score change without a fix?', a: 'The check recalculates from live requests, so changes on other sites, such as new mentions, can move it.' },
      runIt,
    ],
    blogs: ['technical-basics', 'how-answer-engines-pick-products'],
  },
]

export const CASE_STUDIES: CaseStudy[] = STUDIES

/** Each study gets its own dark color for its generated thumbnail and share image. */
export const TONES = ['#0f3d33', '#4a3410', '#1f2a5c', '#4d1f2e', '#0e3f4a', '#3b1f5c', '#27303f', '#3a4010']
export const caseTone = (s: CaseStudy) => TONES[Math.max(0, CASE_STUDIES.indexOf(s)) % TONES.length]

export const getFacts = (s: CaseStudy): CaseFacts => ({ name: s.name, sub: s.kind, stats: s.stats })

export const getCaseStudy = (slug: string) => CASE_STUDIES.find((s) => s.slug === slug)

/** Month and year of a study, for the meta line. */
export const caseMonthYear = (s: CaseStudy) => monthYear(s.updated)

/** Minutes to read a study, at about 220 words a minute, never less than 1. */
export function readMinutes(s: CaseStudy): number {
  const words = [s.summary, s.answer, ...s.sections.flatMap((x) => [x.h, ...x.body, ...(x.bullets ?? [])]), ...s.faq.flatMap((f) => [f.q, f.a])].join(' ').split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}

/** A real screenshot, when the study has one. Without it the list draws a card from the name and tagline. */
export const caseThumb = (s: CaseStudy) => s.thumb
/** The share image: the study's own, or the generated card at /case-studies/<slug>/opengraph-image. */
export const caseImage = (s: CaseStudy) => s.image ?? `/case-studies/${s.slug}/opengraph-image`
