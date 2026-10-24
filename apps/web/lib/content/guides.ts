import type { QA } from './faq.ts'

export interface GuideSection extends QA {
  /** A bullet may open with a bold lead-in written as **Lead.** and then the rest. */
  bullets?: string[]
  code?: string
  table?: { head: string[]; rows: string[][] }
}

export interface Guide {
  slug: string
  title: string
  description: string
  updated: string
  intro: string
  /** A short box near the top that gives the whole answer. Quoted by answer engines. */
  summary?: string
  sections: GuideSection[]
  /** Closing questions, shown as an accordion and as FAQ structured data. When absent, every section is a question. */
  faq?: QA[]
  sources: { label: string; url: string }[]
  /** Optional real images: the share image (1200x630 jpg) and a smaller card thumbnail (webp). Without them the card draws one. */
  image?: string
  thumb?: string
}

const UPDATED = '2026-10-10'

export const GUIDES: Guide[] = [
  {
    slug: 'where-to-list-a-new-saas',
    image: '/blog/where-to-list-a-new-saas-og.jpg',
    thumb: '/blog/where-to-list-a-new-saas-thumb.webp',
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
    sources: [],
  },
  {
    slug: 'how-to-get-chatgpt-to-suggest-your-product',
    image: '/blog/how-to-get-chatgpt-to-suggest-your-product-og.jpg',
    thumb: '/blog/how-to-get-chatgpt-to-suggest-your-product-thumb.webp',
    title: 'How to get ChatGPT to recommend your product',
    description: 'How ChatGPT decides which products to recommend, and five steps that make yours more likely to be named: crawler access, a clear page, listings, mentions and answers to buyer questions.',
    updated: UPDATED,
    intro: 'Someone asks ChatGPT for the best tool for a job, and it names a few products, but your product was not in the suggestion. You can make your product easier to find, confirm and trust, which is what it works from.',
    summary: 'ChatGPT recommends products it can find and confirm. It works from what the model learned in training and from pages it searches for when it answers. To be named, let its crawlers in, say plainly what your product is, get listed where buyers look, earn mentions from real people and answer the questions buyers ask. Each step reduces the odds that ChatGPT leaves you out.',
    sections: [
      {
        q: 'How does ChatGPT decide which products to recommend?',
        a: 'No vendor publishes its full recipe, so treat any exact formula as a guess. Two sources are documented, and each asks something different of you.',
        table: {
          head: ['Where the answer comes from', 'What it means for you'],
          rows: [
            ['Training: what the model learned before it was released', 'Be described clearly and mentioned widely, over time'],
            ['Search: pages fetched at the moment of the question', 'Be indexed, crawlable and clear on the page itself'],
          ],
        },
        more: ['Both sources favour products that are easy to find and that other pages confirm. Everything below comes from that.'],
      },
      {
        q: 'Step 1: Let the crawlers in',
        a: 'If a crawler cannot read your site, it cannot use it. Check your robots.txt and allow the ones you want.',
        bullets: [
          '**OAI-SearchBot.** OpenAI\'s crawler for search results.',
          '**GPTBot.** OpenAI\'s crawler for training data.',
          '**Google-Extended.** Google\'s control for its generative products such as Gemini.',
          '**Sitemap.** List it in robots.txt so crawlers find every page.',
        ],
        code: 'User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nSitemap: https://example.com/sitemap.xml',
        more: ['Check each vendor\'s current documentation first, because names and behaviour change.'],
      },
      {
        q: 'Step 2: Say plainly what your product is',
        a: 'Put one sentence on your homepage that says what the product is and who it is for. Assistants quote plain statements.',
        bullets: [
          '**Write for a reader who knows nothing.** Name the product, the job it does and the buyer it is for.',
          '**Add structured data.** JSON-LD gives crawlers the same facts in a machine-readable form.',
          '**Keep names identical.** Use the same product name and description on your site, directories and profiles.',
          '**Keep it in text.** Facts inside images or behind scripts can be missed.',
        ],
      },
      {
        q: 'Step 3: Get listed where buyers look',
        a: 'Directories and review sites are pages that name your product and link to it. They give an assistant a second place to confirm you exist.',
        bullets: [
          '**Review sites.** The ones buyers in your category use.',
          '**Alternatives directories.** Pages that list products next to their competitors.',
          '**Launch sites.** A launch leaves a page behind that stays online.',
        ],
        more: ['Amplibee checks directories for your listing and gives you the submission page for each one that is missing.'],
      },
      {
        q: 'Step 4: Earn mentions from real people',
        a: 'Pages written by other people are the strongest confirmation. Give them something specific to mention.',
        bullets: [
          '**A clear launch.** A before and after that is easy to quote.',
          '**Original numbers.** Data other writers can cite.',
          '**Communities.** Post where the rules allow it, and answer comments yourself.',
          '**Creators.** If you pay, agree on disclosure and ask for a post you can link to.',
        ],
      },
      {
        q: 'Step 5: Answer the questions buyers ask',
        a: 'Buyers ask assistants for comparisons and alternatives. Pages that answer those questions directly are easy to use.',
        bullets: [
          '**Comparison pages.** Your product against a named competitor, with honest trade-offs.',
          '**Alternatives pages.** The options in your category and who each one suits.',
          '**FAQ sections.** Short, direct answers under question headings.',
          '**Pricing.** State it. Assistants skip what they cannot find.',
        ],
      },
      {
        q: 'What does not work?',
        a: 'Shortcuts tend to be ignored or to backfire.',
        bullets: [
          '**Paying for a guaranteed spot.** Promises like this are not something to rely on, and they do not improve your odds.',
          '**Fake reviews and fake mentions.** They break the rules of the sites that host them and do not hold up.',
          '**Hidden text and keyword stuffing.** Written for crawlers, useful to no one.',
          '**Posting the same promotion everywhere.** Communities remove it.',
          '**Blocking crawlers and expecting citations.** A blocked page is not a source.',
        ],
      },
      {
        q: 'How do you measure whether it is working?',
        a: 'Check once a month, in the same way each time, and compare.',
        bullets: [
          '**Ask the questions buyers ask.** In a fresh chat: "What is the best tool for [job]?", "What are the alternatives to [competitor]?", "[Your product] vs [competitor]".',
          '**Note whether you are named.** And which competitors are.',
          '**Repeat each question.** Answers change from one chat to the next, so look for the pattern.',
          '**Track the inputs.** Directory listings, mentions and page checks. These are what you control.',
        ],
        more: ['On plans that include it, Amplibee AI visibility tracking asks these questions every day across Google Search, ChatGPT, Perplexity and Gemini and shows whether you are named.'],
      },
    ],
    faq: [
      { q: 'Can I pay to be recommended by ChatGPT?', a: 'There is no paid spot in ChatGPT\'s answers. What improves your odds is making your product easier to find, confirm and trust. Be wary of anyone who sells a placement.' },
      { q: 'Do I need an llms.txt file?', a: 'It is a proposal for a plain text file at /llms.txt that describes your site for language models. It is not a formal standard and support varies by vendor. It costs little to publish, but do not expect it to change what assistants say.' },
      { q: 'How long does it take?', a: 'There is no fixed time. Changes show up as your pages are indexed and as mentions and listings build up. Measure monthly and look at the trend.' },
      { q: 'Should I allow GPTBot?', a: 'If you want to be cited and are comfortable with your content being used for training, yes. You can allow OAI-SearchBot, which is for search results, and decide on GPTBot separately.' },
      { q: 'Does ChatGPT recommend the same products every time?', a: 'No. Answers vary between chats and over time, which is why you should repeat a question and look at the pattern.' },
    ],
    sources: [],
  },
  {
    slug: 'what-an-og-image-is',
    image: '/blog/what-an-og-image-is-og.jpg',
    thumb: '/blog/what-an-og-image-is-thumb.webp',
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
    sources: [],
  },
  {
    slug: 'technical-basics',
    image: '/blog/technical-basics-og.jpg',
    thumb: '/blog/technical-basics-thumb.webp',
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
    sources: [],
  },
  {
    slug: 'social-content-plan-for-a-launch',
    image: '/blog/social-content-plan-for-a-launch-og.jpg',
    thumb: '/blog/social-content-plan-for-a-launch-thumb.webp',
    title: 'A content plan for X, LinkedIn, Facebook and Product Hunt',
    description: 'What a new product should post on X, LinkedIn, Facebook and Product Hunt, how often, and how to plan it so the posts keep going after launch day.',
    updated: '2026-10-24',
    intro: 'A launch is one day. Visibility is built by what you post before and after it. This guide shows what to put on each platform and how to plan it so you keep going.',
    sections: [
      {
        q: 'What should a new product post on social platforms?',
        a: 'Post four kinds of things: what you shipped, a real example of a problem the product solved, what the product does and who it is for, and what you learned while building it. Every post should say something a reader can use and link to a page that shows the product.',
        more: ['Do not repeat one announcement on every platform. Change the opening and the length to fit each place, and keep the facts the same.'],
      },
      {
        q: 'What works on X?',
        a: 'Short posts and threads that show something specific: a screenshot, a number, a before and after. A thread that walks through what you built and why is easier to share than a single link. Reply to people who ask about the problem you solve, and link only when it answers them.',
      },
      {
        q: 'What works on LinkedIn?',
        a: 'Longer posts written by a person, not a page, that tell what happened: the problem, what you tried, what you shipped and what changed. Name the buyer you built it for. Put the link in a comment or at the end, and answer comments yourself.',
      },
      {
        q: 'What works on Facebook?',
        a: 'Posts for communities and groups where your buyers already talk. Read each group\'s rules first, since many limit self-promotion. Share what you built and ask a real question. A post on your own page is a place for people to confirm you exist, not a way to reach strangers.',
      },
      {
        q: 'How do I plan a Product Hunt launch?',
        a: 'Prepare the listing before the day: a clear tagline, a short description, screenshots and a first comment that tells the story of why you built it. Plan the posts on other platforms around launch day so people have somewhere to go from each one. Product Hunt publishes a launch guide that covers the listing.',
        more: ['Answer every comment on the day yourself. Afterwards, keep the listing: it stays online as a page that names your product.'],
      },
      {
        q: 'How do I keep posting after launch day?',
        a: 'Plan a few weeks ahead. Aim for a small number of posts you can keep up, such as two or three a week across your platforms, and reuse one idea in a different shape for each. The Amplibee content planner gives you posts curated for your product and your application, one set for each platform, so you are not starting from a blank page.',
      },
      {
        q: 'Does posting on social platforms help visibility?',
        a: 'It gives people and search engines more pages that name your product and link to it, and it gives you something to point mentions at. It improves your odds of ranking and of being named by an AI assistant. Treat it as one part of the plan, next to directory listings, mentions and the basics on your own site.',
      },
    ],
    sources: [],
  },
]

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug)
