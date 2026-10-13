import type { QA } from './faq.ts'

export interface GuideSection extends QA {
  code?: string
}

export interface Guide {
  slug: string
  title: string
  description: string
  updated: string
  intro: string
  sections: GuideSection[]
  sources: { label: string; url: string }[]
}

const UPDATED = '2026-10-10'

export const GUIDES: Guide[] = [
  {
    slug: 'where-to-list-a-new-saas',
    title: 'Where to list a new SaaS',
    description: 'Which directories and communities are worth an hour of a founder\'s time, and how to fill in each listing.',
    updated: UPDATED,
    intro: 'A listing is a page on someone else\'s site that names your product and links to it. This guide covers which ones to start with and how to fill them in.',
    sections: [
      {
        q: 'Where should a new SaaS be listed first?',
        a: 'Start with five places: one review directory buyers use, such as G2 or Capterra, one alternatives directory, such as AlternativeTo or SaaSHub, one launch site, such as Product Hunt or BetaList, one community, such as a Show HN post, and one place for your audience, such as DevHunt or StackShare for developer tools.',
        more: [
          'Listings help in two ways. People who compare software find you where they already look, and each listing is a page on another site that names and links to your product.',
          'A handful of complete profiles is a better use of time than thirty empty ones.',
        ],
      },
      {
        q: 'How do I fill in a listing so it helps?',
        a: 'Use the same name, one-line description and URL everywhere. Write the description for a buyer, not a search engine: who the product is for, what it does and what it costs. Add a logo, a screenshot or short demo, and link to the exact page you want visitors to land on.',
        more: [
          'Identical facts across listings make it easier for people and for crawlers to tell that the pages describe one product. Keep a short text file with your name, one-liner, long description, pricing summary and links, and paste from it.',
        ],
      },
      {
        q: 'Which listings can wait?',
        a: 'Skip directories that charge for placement without showing traffic, accept every submission without review, or have not published anything recently. Look at whether real products from your category are listed and whether the site is still active before you spend time. A listing on a dead site adds a link, not an audience.',
        more: ['Revisit the list every quarter. Directories close, change their rules and start charging.'],
      },
      {
        q: 'How does Amplibee check directories?',
        a: 'For each directory in our list we try the public profile address when it follows a pattern we have confirmed, and we look for the directory in search results for your domain. Some directories block automated requests, so they show as not confirmed.',
      },
    ],
    sources: [
      { label: 'Hacker News: Show HN rules', url: 'https://news.ycombinator.com/showhn.html' },
      { label: 'Google Search Central: Creating helpful, reliable, people-first content', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content' },
    ],
  },
  {
    slug: 'first-mentions',
    title: 'How to get your first mentions',
    description: 'Practical ways a new product earns its first mentions from communities, writers and creators, and how to tell whether they are working.',
    updated: UPDATED,
    intro: 'A mention is a page outside your own site that names your product or links to it. New products have few, and the first ones are the hardest to get.',
    sections: [
      {
        q: 'How does a new product get its first mentions?',
        a: 'Give writers something specific to mention: a launch with a clear before and after, a free tool, original numbers, or a comparison they can quote. Then tell the people who already cover your category in a short message that links to it. Send material, and keep the pitch to two sentences.',
        more: [
          'Start with the people who wrote about your closest competitors. Their pages show what they like to cover. A message that points to a gap in what they wrote is more useful to them than a message about your product.',
        ],
      },
      {
        q: 'Where can I post about my product without breaking rules?',
        a: 'Read each community\'s rules first. Hacker News has a Show HN format for things people can try. Many subreddits limit self-promotion and expect other contributions from you. Post what you built and what you learned, answer comments yourself, and never ask friends to vote, which most sites treat as manipulation.',
        more: ['One honest post in the right place does more than the same post in ten places. Wait for replies before you post again.'],
      },
      {
        q: 'Should I pay creators to write or post about my product?',
        a: 'Paid posts are one option once the free routes are moving. Choose creators whose readers match your buyers, write a clear brief, and agree on disclosure. Advertising rules in many countries, including the FTC endorsement guides in the United States, require paid posts to be labelled.',
        more: ['Ask for a post you can link to and measure. Do not pay for votes, fake reviews or anything that hides the payment.'],
      },
      {
        q: 'How do I know the mentions are working?',
        a: 'Track three numbers each week: pages that mention your domain, referral visits to your site, and new directory or review listings. The Amplibee mentions check counts Hacker News stories, GitHub READMEs and web pages that name your domain. Run it again after a month and compare with your first result.',
      },
    ],
    sources: [
      { label: 'Hacker News guidelines', url: 'https://news.ycombinator.com/newsguidelines.html' },
      { label: 'US Code of Federal Regulations: 16 CFR Part 255, FTC endorsement guides', url: 'https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255' },
    ],
  },
  {
    slug: 'what-an-og-image-is',
    title: 'What an OG image is',
    description: 'The OG image is the picture that appears when someone shares your link. What size it should be, which tags to set, and how to test it.',
    updated: UPDATED,
    intro: 'Open Graph is a set of meta tags that tell other sites how to show your page when it is shared. The image is the part people notice most.',
    sections: [
      {
        q: 'What is an OG image?',
        a: 'An OG image is the picture in the preview card that appears when someone shares your link on LinkedIn, X, Slack or a messaging app. You set it with an og:image meta tag in the page head, defined by the Open Graph protocol. Without one, many apps show a blank card or pick whatever image they find.',
      },
      {
        q: 'What size should it be?',
        a: 'Use 1200 by 630 pixels, a ratio of about 1.91 to 1, as a JPEG or PNG, and keep text and logos away from the edges because apps crop. Meta\'s sharing documentation recommends at least this size for large link previews. Serve the file over HTTPS at an address that does not need a login.',
        more: ['Keep the file small. A preview image that is slow to fetch can be skipped by the app that requested it.'],
      },
      {
        q: 'Which tags do I need?',
        a: 'Set og:title, og:description, og:url and og:image. For X, add twitter:card with the value summary_large_image so the large image shows. Use absolute URLs, not relative paths. Then test by pasting your link into a private message to yourself, because each app caches previews.',
        code: '<meta property="og:title" content="Acme: invoices that chase themselves">\n<meta property="og:description" content="Send invoices and chase late payers.">\n<meta property="og:url" content="https://acme.example/">\n<meta property="og:image" content="https://acme.example/og.png">\n<meta name="twitter:card" content="summary_large_image">',
      },
      {
        q: 'Why does my preview look wrong after I fixed it?',
        a: 'Apps cache previews, often for days. Use each platform\'s own debugging or preview tool to ask for a fresh fetch, or share the link with a harmless query string added. Amplibee reads the live tags and requests the image address, so a fixed page shows as fixed the next time you run the check.',
      },
    ],
    sources: [
      { label: 'The Open Graph protocol', url: 'https://ogp.me/' },
      { label: 'Meta for Developers: Sharing best practices', url: 'https://developers.facebook.com/docs/sharing/webmasters' },
    ],
  },
  {
    slug: 'how-answer-engines-pick-products',
    title: 'How answer engines pick products',
    description: 'What is documented about how chat assistants and answer engines choose which products to name, and what you can do about it.',
    updated: UPDATED,
    intro: 'People now ask assistants which tool to buy. This guide separates what vendors have documented from what is guesswork.',
    sections: [
      {
        q: 'How do answer engines choose which products to name?',
        a: 'No vendor publishes its full recipe, so treat any exact formula as a guess. What is documented: assistants draw on what a model learned in training and, for many questions, on pages fetched from a search index at answer time. Products that are easy to find, clearly described and mentioned on trusted pages give them more to use.',
        more: ['That is why this tool measures indexing, mentions and page clarity. They matter to search engines and to assistants alike.'],
      },
      {
        q: 'Should I allow chatbot crawlers in robots.txt?',
        a: 'If you want to be cited, yes. OpenAI documents GPTBot for training data and OAI-SearchBot for search results, and Google documents Google-Extended as a control for its generative products. Blocking a crawler removes that source. Allow the ones you want and list your sitemap in robots.txt.',
        more: ['Check each vendor\'s current documentation before you decide. Names and behaviour change.'],
      },
      {
        q: 'What is llms.txt and do I need it?',
        a: 'The llms.txt file is a proposal for a plain text file at /llms.txt that describes a site and links to its key pages for language models. It is not a formal standard and support varies by vendor. It costs little to publish, so add one, but do not expect it to change what assistants say.',
      },
      {
        q: 'What can I do that works whichever system answers?',
        a: 'State plainly what the product is, who it is for and what it costs, on a page that crawlers can read without running scripts. Add structured data. Get listed and reviewed on sites that buyers trust. Keep names and descriptions identical everywhere. These steps also help search engines and people.',
      },
    ],
    sources: [
      { label: 'OpenAI: Overview of OpenAI crawlers', url: 'https://platform.openai.com/docs/bots' },
      { label: 'Google Search Central: Google crawlers and fetchers', url: 'https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers' },
      { label: 'The llms.txt proposal', url: 'https://llmstxt.org/' },
    ],
  },
  {
    slug: 'technical-basics',
    title: 'Technical SEO basics for a new site',
    description: 'The titles, descriptions, sitemap, robots.txt, structured data and speed targets that a new product site should have before launch.',
    updated: UPDATED,
    intro: 'Most of the technical checks in Amplibee come down to a short list. This guide explains each item and how to meet it.',
    sections: [
      {
        q: 'What should every homepage have?',
        a: 'Every homepage needs a unique title of 10 to 65 characters, a meta description of 50 to 160 characters, one h1, a canonical link and a viewport tag. These tell search engines and people what the page is. Each one takes minutes to add in most site builders and frameworks.',
        more: ['Search engines may rewrite titles and snippets, but a good source gives them a better starting point.'],
      },
      {
        q: 'How do sitemap.xml and robots.txt work?',
        a: 'A sitemap.xml lists the pages you want crawled, and robots.txt tells crawlers what they may fetch and where the sitemap is. Publish both at the root of your domain, then submit the sitemap in Google Search Console. A single Disallow: / line blocks the whole site, so check it before launch.',
      },
      {
        q: 'What is structured data and which type should I use?',
        a: 'Structured data is JSON-LD in the page that states facts in a format machines read: who publishes the site and what the product is. Start with Organization and WebSite on the homepage, and SoftwareApplication if you sell software. Validate it with Google\'s Rich Results Test before you ship.',
      },
      {
        q: 'How fast should the page be?',
        a: 'Aim for a mobile Largest Contentful Paint under 2.5 seconds, which Google\'s web.dev guidance calls good. Compress images, serve fonts from your own domain, and delay scripts that the first screen does not need. Amplibee reads the score from Google PageSpeed Insights and reports the largest content time.',
      },
    ],
    sources: [
      { label: 'Google Search Central: Build and submit a sitemap', url: 'https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview' },
      { label: 'Google Search Central: Introduction to robots.txt', url: 'https://developers.google.com/search/docs/crawling-indexing/robots/intro' },
      { label: 'Google Search Central: Introduction to structured data', url: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data' },
      { label: 'web.dev: Largest Contentful Paint', url: 'https://web.dev/articles/lcp' },
    ],
  },
]

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug)
