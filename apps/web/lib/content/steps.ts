export interface ProcessStep {
  title: string
  short: string
  long: string
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    title: 'Research your product',
    short: 'We read your homepage, /pricing and /about, and you can edit what we found.',
    long: 'We fetch your homepage, /pricing and /about with plain GET requests and read the title, meta description and headings. The one-liner comes from your meta description when there is one. Everything is shown to you and every field is editable before it is used.',
  },
  {
    title: 'Find competitors',
    short: 'You enter your competitor sites. Leave it empty and the comparison is skipped.',
    long: 'You type your competitor domains. Each one goes through the same address checks as your own site. If you leave the list empty, the scan still runs and the competitor comparison is left out of the report.',
  },
  {
    title: 'Scan visibility',
    short: 'Directories, search indexing, mentions, technical SEO, page speed and domain rank.',
    long: 'We check which directories list you, how many pages a site: search returns, how often your domain is mentioned on Hacker News, GitHub and the web, 17 technical basics on your homepage, mobile speed from Google PageSpeed Insights, and your rank in the Tranco list. Each measurement writes its own line to the log.',
  },
  {
    title: 'Score and rank gaps',
    short: 'Four sub-scores make a total out of 100. Each gap gets a severity and an estimate of points.',
    long: 'Discoverability, buzz, trust and technical scores combine into one number out of 100. Each gap is ranked by severity and by the points the score would gain if you fixed it. The score and your top 3 gaps are free.',
  },
  {
    title: 'Plan fixes',
    short: 'Every gap maps to one action: a guide, a directory, a review step, a content task or a campaign.',
    long: 'Each gap is matched to a fix type. Most fixes are free and point to a blog post or a directory submission page. The full gap list, the competitor comparison and the fix plan unlock when you sign in.',
  },
  {
    title: 'Launch',
    short: 'Want to get mentioned by people to improve your brand visibility? We will get it done for you.',
    long: 'Gaps about mentions and reviews can be fixed by creators who post, write or engage. For those, the report offers a campaign with a draft brief and a suggested starting budget, and we get it done for you. You review and change both first, and nothing is bought from this page.',
  },
]
