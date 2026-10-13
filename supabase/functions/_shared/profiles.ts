/**
 * Hand-written research for our own sites. A brand-new site has little for the research and competitor steps to read
 * or find, so these fill in only what is missing: the product description and the competitor list. Nothing here is a
 * measurement. Scores, ranks, mentions and page checks always come from the live scan.
 */
export interface Profile {
  title: string
  description: string
  one_liner: string
  headings: string[]
  /** The first three are scanned and compared; the rest are the extra names shown blurred until the report is unlocked. */
  competitors: string[]
}

export const PROFILES: Record<string, Profile> = {
  'amplibee.com': {
    title: 'Amplibee: get your product launch on auto-pilot',
    description: 'Amplibee researches your product, maps where competitors are listed, finds the gaps and launches your product for you. The visibility check is free.',
    one_liner: 'A free visibility check for founders: directories, search indexing, mentions and page basics, compared with your competitors.',
    headings: ['Get your product launch on auto-pilot', 'How the check works', 'What you get', 'Questions founders ask'],
    competitors: ['ahrefs.com', 'semrush.com', 'otterly.ai', 'peec.ai', 'similarweb.com', 'ubersuggest.com', 'seranking.com', 'mangools.com', 'moz.com', 'seobility.net'],
  },
  'doculigent.com': {
    title: 'Doculigent: intelligent document processing',
    description: 'Doculigent reads invoices, contracts and forms, pulls out the fields that matter and sends clean data to the tools your team already uses.',
    one_liner: 'AI document processing that turns invoices, contracts and forms into structured data.',
    headings: ['Turn documents into structured data', 'Extract fields from any layout', 'Review and approve in one place', 'Connect to your tools', 'Pricing'],
    competitors: ['docsumo.com', 'nanonets.com', 'rossum.ai', 'klippa.com', 'veryfi.com', 'parseur.com', 'docparser.com', 'affinda.com', 'abbyy.com', 'extracta.ai'],
  },
  'oyekool.com': {
    title: 'Oyekool: creator campaigns for brands',
    description: 'Oyekool is a marketplace where brands pay creators to post, write about or engage with their product. Set a brief and a budget, approve the work, pay when it is done.',
    one_liner: 'A marketplace where brands pay creators to post about their product.',
    headings: ['Get mentioned by real people', 'Post a brief, set a budget', 'Approve the work, then pay', 'For creators', 'Pricing'],
    competitors: ['billo.app', 'insense.pro', 'collabstr.com', 'popularpays.com', 'aspire.io', 'grin.co', 'upfluence.com', 'modash.io', 'trend.io', 'joinbrands.com'],
  },
  'baraklabs.com': {
    title: 'Baraklabs: a small studio building focused software products',
    description: 'Baraklabs designs, builds and runs small software products, including Amplibee, Doculigent and Oyekool.',
    one_liner: 'A product studio that builds and runs focused software tools.',
    headings: ['Products', 'Amplibee', 'Doculigent', 'Oyekool', 'About', 'Contact'],
    competitors: ['toptal.com', 'thoughtbot.com', 'netguru.com', 'eleken.co', 'ustwo.com', 'bairesdev.com', 'andela.com', 'turing.com', 'x-team.com', '8thlight.com'],
  },
}

export const profileFor = (domain: string | null | undefined): Profile | null => (domain ? PROFILES[domain.toLowerCase().replace(/^www\./, '')] ?? null : null)
