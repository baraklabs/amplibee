import { SCORING } from '../shared/scoring.config.ts'

export interface QA {
  q: string
  a: string
  more?: string[]
}

const w = SCORING.weights

export const FAQ: QA[] = [
  {
    q: 'What does Amplibee check?',
    a: 'Amplibee checks your site and your competitors for directory listings, search indexing, mentions on Hacker News, GitHub and the web, technical SEO such as titles, OG images and sitemaps, and trust signals like an about page. It reads public pages only and changes nothing on your site.',
    more: ['The how it works page lists every step and the limits we apply to each request.'],
  },
  {
    q: 'Will ChatGPT recommend my product?',
    a: 'Answer engines draw on pages they can find and trust, so the check measures those signals: whether search can index your site, where you are listed and mentioned, and whether your pages say plainly what the product is. Fixing the gaps improves your odds.',
  },
  {
    q: 'Does Amplibee submit my product to directories?',
    a: 'It depends on your plan. The free check finds the directories where buyers and your competitors look, checks whether you are already listed, and links each submission page so you can submit yourself. On a paid plan we can handle the submissions for you. See [the pricing page](/pricing) for what each plan includes.',
  },
  {
    q: 'Is the check free?',
    a: 'Yes. The free plan gives you a brand visibility score, domain ranking, 3 gaps, 3 competitors and 2 checks a day, and you can start without an account. Paid plans start at $10 a month, or pay annually and get 2 months free. See [the pricing page](/pricing) for what each plan includes.',
  },
  {
    q: 'How is the score calculated?',
    a: `The score is a weighted sum of four parts: discoverability ${w.discoverability}, buzz ${w.buzz}, technical ${w.technical} and trust ${w.trust}, out of 100. Each part is built from measured numbers, with no model judging your product. A check that could not run is left out and the rest are rescaled.`,
  },
  {
    q: 'Why do I need to sign in?',
    a: 'Signing in unlocks the full report and lets you ask us for more: directory submissions, competitor tracking, or a launch done for you. Unlocking also runs extra search checks for Reddit, LinkedIn, X and review sites, which cost money, so an account keeps automated abuse down. Google sign-in takes one click.',
  },
  {
    q: 'Does the check change my website?',
    a: 'No. Amplibee reads public pages with ordinary GET requests: your homepage, /pricing, /about, sitemap.xml and robots.txt. It identifies itself as AmplibeeBot, follows at most 3 redirects, stops after 2 MB and obeys robots.txt. It never logs in or submits forms. Page speed comes from Google PageSpeed Insights.',
  },
  {
    q: 'Why does a directory show as not confirmed?',
    a: 'Many directories block automated requests or use profile addresses we cannot predict. When a page answers with a bot filter or an unknown address, we mark the directory as not confirmed instead of guessing. Open the directory and search for your product by hand to be sure whether you are listed.',
  },
  {
    q: 'How accurate is the indexing count?',
    a: 'It is an estimate. We run one site: search through a search API and count the results, reading up to 10. Zero results means the site may not be indexed. Ten means at least ten pages were found, not that only ten exist. Google Search Console shows the exact number for sites you own.',
  },
  {
    q: 'What does the campaign button do?',
    a: 'It opens a campaign request with the gap, a draft brief and a suggested budget attached. Want to get mentioned by people to improve your brand visibility? We get it done for you with creators who are paid to post about or engage with your product. You set the final brief and price. No result is promised.',
  },
  {
    q: 'How do I remove my report?',
    a: 'Reply to the report email, or write to us, and name the domain. We hide the public report page once we have handled your request. Finished checks are also deleted automatically after 30 days. To delete an email address, say so in the same message and we will remove it.',
  },
  {
    q: 'Can I check a site that is not mine?',
    a: 'Yes. The check uses only public information, so you can run it on a competitor or a client. Each person gets 2 free checks per day. If you own a site and want its public report hidden, ask us and we will hide it.',
  },
]
