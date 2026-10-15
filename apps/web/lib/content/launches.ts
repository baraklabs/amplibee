// Detail pages for products launched with Amplibee, at /launches/<slug>.
// Everything here was read from the product's own public website. Update `updated` when you change an entry.

export interface LaunchSection {
  /** Heading, written as a question or a plain label. */
  h: string
  /** A direct answer first, so search snippets and AI answers can quote it. */
  a: string
  more?: string[]
  bullets?: string[]
}

export interface Launch {
  slug: string
  name: string
  domain: string
  url: string
  /** The one-liner shown on the card. */
  tagline: string
  category: string
  /** Page <title> without the site suffix, and the meta description (aim for 150 to 160 characters). */
  title: string
  description: string
  keywords: string[]
  logo: string
  /** Alt text for the thumbnail and share image: public/launches/<slug>-og.jpg (1200x630) and <slug>-thumb.webp (800x420). */
  imageAlt: string
  /** YYYY-MM-DD */
  updated: string
  /** YYYY-MM-DD: when the product launched (domain registration or repository creation date). */
  launched: string
  intro: string
  facts: { label: string; value: string }[]
  sections: LaunchSection[]
  faq: { q: string; a: string }[]
  /** Other ways to get the same job done, and how this product compares. Keep every claim checkable. */
  compare: {
    intro: string
    /** This product's own row in the table. */
    self: { bestFor: string; tradeoff: string }
    alternatives: { name: string; url?: string; what: string; bestFor: string; tradeoff: string }[]
    verdict: string
  }
  /** schema.org SoftwareApplication fields */
  app: { type: string; category: string; os?: string; price?: string; featureList: string[]; sameAs?: string[] }
  sources: { label: string; url: string }[]
}

export const LAUNCHES: Launch[] = [
  {
    slug: 'nativeship',
    name: 'NativeShip',
    domain: 'nativeship.io',
    url: 'https://nativeship.io/',
    tagline: 'Launch your SaaS official n8n integration',
    category: 'Developer tools',
    title: 'NativeShip: launch your SaaS’s official n8n integration',
    description: 'NativeShip turns your OpenAPI spec into a publish-ready n8n community node, then ships every release to npm from your own GitHub. Features, pricing, alternatives and FAQ.',
    keywords: ['NativeShip', 'n8n integration', 'n8n community node', 'n8n node generator', 'OpenAPI to n8n', 'publish n8n node to npm', 'SaaS integrations', 'n8n for SaaS', 'NativeShip alternatives', 'NativeShip vs n8n-openapi-node', 'NativeShip vs HTTP Request node', 'build n8n node by hand'],
    logo: '/customers/nativeship-logo.png',
    imageAlt: 'NativeShip home page: “Launch your n8n integration. Give your customers a simple way to connect your product with n8n.”',
    updated: '2026-10-15',
    launched: '2026-09-09',
    intro: 'NativeShip helps SaaS companies launch and maintain an official n8n integration, so customers can drag your product into their workflows instead of wiring up a generic HTTP Request node.',
    facts: [
      { label: 'What it is', value: 'n8n community node generator and publisher' },
      { label: 'Made for', value: 'SaaS companies with an API' },
      { label: 'You provide', value: 'An OpenAPI 3 specification' },
      { label: 'You get', value: 'A publish-ready npm package' },
      { label: 'Pricing', value: 'One-time payment, listed at $199 for one node' },
      { label: 'Launched', value: 'September 2026' },
      { label: 'Website', value: 'nativeship.io' },
    ],
    sections: [
      {
        h: 'What is NativeShip?',
        a: 'NativeShip is a service that generates, publishes and maintains an official n8n integration for your SaaS product.',
        more: [
          'n8n is a workflow automation tool. When a product has its own n8n node, its customers can use it as a trigger or an action next to Slack, Google Sheets, Gmail and thousands of other apps. NativeShip does the integration work so your team does not have to build and maintain the node by hand.',
          'Your customers never need to know NativeShip exists. They see your product as an n8n node.',
        ],
      },
      {
        h: 'Who is NativeShip for?',
        a: 'It is built for SaaS companies that want to offer an n8n integration without taking on the full work of building and maintaining one.',
        more: ['It fits teams whose customers already ask questions like “Do you support n8n?”, “Can I connect this to n8n?” or “Is your API available as an n8n node?”.'],
      },
      {
        h: 'How does NativeShip work?',
        a: 'You upload an OpenAPI 3 specification, shape how the node looks, and publish it to npm from your own GitHub repository.',
        bullets: [
          'Import your API: upload the file, paste the document or point NativeShip at its URL. The operations, parameters and authentication in the spec become the node. No SDK, sample code or source access is needed.',
          'Shape the node: rename resources, reorder operations, hide what users do not need and write every label, with a live preview of how the node looks inside n8n.',
          'Generate the package: a build job reads your spec, compiles the node package and validates it against n8n’s community node guidelines.',
          'Publish from your own GitHub: connect GitHub and npm once. After that each release takes one click, and you review the exact package and version before anything goes out.',
          'Keep a record: every version links to its npm package, Git tag and workflow run, so you always know what shipped and when.',
        ],
      },
      {
        h: 'What does the generated n8n node include?',
        a: 'A complete, publish-ready npm package that follows n8n’s official community node guidelines.',
        bullets: [
          'The required package structure, with node and credential files and the n8n-nodes- package prefix',
          'package.json, the compiled node and credential files, and the metadata n8n reads',
          'Resources and operations taken from your API, with labels you control',
          'GitHub integration for releases and version history',
        ],
        more: ['You can publish under your own npm account with npm publish, keep the package private, or push it to GitHub first.'],
      },
      {
        h: 'How much does NativeShip cost?',
        a: 'NativeShip is a one-time payment, not a subscription. At the time of writing it is listed at $199 for one n8n node, with three build jobs included.',
        more: [
          'There is no recurring charge, no seats and nothing to cancel later. Importing or re-importing your OpenAPI document does not use a build job, so you can get the spec right before you spend one. Check nativeship.io/pricing for the current price.',
        ],
      },
      {
        h: 'Why launch an n8n integration at all?',
        a: 'An official node puts your product inside workflows your customers build themselves, which makes it easier to adopt and harder to replace.',
        more: ['You do not have to build every workflow your customers need. You give them the building blocks, and they combine your product with the other tools they already use.'],
      },
    ],
    faq: [
      { q: 'What is NativeShip?', a: 'NativeShip helps SaaS companies launch and maintain integrations for n8n, so their customers can use their product in n8n workflows.' },
      { q: 'Who is NativeShip for?', a: 'SaaS companies that want to offer an n8n integration without taking on all the work of building and maintaining one themselves.' },
      { q: 'Do I need to build the n8n integration myself?', a: 'No. NativeShip handles the integration work, so your team does not have to build everything from scratch.' },
      { q: 'What do I need to create an n8n node with NativeShip?', a: 'An OpenAPI 3 specification of your API. Upload the file, paste the document or point NativeShip at its URL. No SDK, sample code or access to your source is needed.' },
      { q: 'Can NativeShip work with my existing API?', a: 'Yes. NativeShip uses your existing API, as described in your OpenAPI specification, to create the n8n integration.' },
      { q: 'What is an n8n community node?', a: 'An npm package that adds your product to n8n as a first-class node, so people can drag it onto a workflow instead of using a generic HTTP Request node.' },
      { q: 'Does NativeShip follow n8n’s guidelines?', a: 'Yes. Generated packages follow n8n’s official community node guidelines, including the package structure, file layout, naming and the n8n-nodes- prefix.' },
      { q: 'Can I publish the node to npm?', a: 'Yes. You get a publish-ready npm package. Publish it under your own npm account, keep it private, or push it to GitHub first. NativeShip can also publish releases from your own GitHub repository.' },
      { q: 'Will the integration stay up to date when my product changes?', a: 'NativeShip is designed to keep your integration aligned with changes to your product and API. Re-import your spec and publish a new version when your API changes.' },
      { q: 'Do my customers need to know NativeShip?', a: 'No. NativeShip works behind the scenes. Your customers use your product as an n8n integration.' },
      { q: 'Is NativeShip a subscription?', a: 'No. It is a one-time payment, listed at $199 at the time of writing, with no recurring charge.' },
      { q: 'What are the alternatives to NativeShip?', a: 'You can build the n8n node by hand from n8n’s official starter template, use the open-source n8n-openapi-node library to generate node properties from an OpenAPI spec and publish the package yourself, or leave customers to call your API with n8n’s built-in HTTP Request node.' },
      { q: 'How does NativeShip compare with building an n8n node by hand?', a: 'NativeShip generates and validates the package from your OpenAPI 3 spec and can publish releases from your GitHub, so you write less code and maintain less. A hand-built node gives more control over unusual behaviour that a spec cannot describe.' },
      { q: 'What is a build job?', a: 'One full generation run: NativeShip reads your specification, compiles the node package and validates the result. Importing your OpenAPI document does not use one.' },
    ],
    compare: {
      intro: 'There are three common ways to get a SaaS product into n8n. They differ in how much you build and maintain yourself.',
      self: { bestFor: 'Teams that have an OpenAPI 3 spec and want a published node without building the package themselves', tradeoff: 'Needs an OpenAPI spec, and it is a paid, one-time purchase' },
      alternatives: [
        {
          name: 'Build the node by hand',
          url: 'https://github.com/n8n-io/n8n-nodes-starter',
          what: 'Start from n8n’s official starter template and write the node, credentials and packaging yourself.',
          bestFor: 'Teams that want full control over every field and behaviour',
          tradeoff: 'The most engineering time, and you keep the node in sync with your API yourself',
        },
        {
          name: 'n8n-openapi-node (open-source library)',
          url: 'https://github.com/devlikeapro/n8n-openapi-node',
          what: 'An MIT-licensed library that turns an OpenAPI v3 spec into node properties.',
          bestFor: 'Developers comfortable wiring up and publishing an npm package themselves',
          tradeoff: 'You still create and publish the n8n-nodes package, define credentials by hand, and only first-level request body fields are generated',
        },
        {
          name: 'The HTTP Request node',
          url: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/',
          what: 'n8n’s built-in node that calls any API. Your customers set it up themselves.',
          bestFor: 'One-off workflows where no official node exists',
          tradeoff: 'Customers must read your API docs and wire each call. Your product does not appear as a node they can search for',
        },
      ],
      verdict: 'NativeShip sits between building by hand and leaving customers on the HTTP Request node: you keep an official, searchable node without writing and packaging it yourself. If you need unusual behaviour that an OpenAPI spec cannot describe, a hand-built node gives you more control.',
    },
    app: {
      type: 'WebApplication',
      category: 'DeveloperApplication',
      os: 'Any (web browser)',
      price: '199',
      featureList: ['Generate an n8n community node from an OpenAPI 3 spec', 'Live preview of the node in n8n', 'Publish to npm from your own GitHub', 'Version history with npm, Git tag and workflow run links', 'Follows n8n community node guidelines'],
    },
    sources: [
      { label: 'NativeShip home page', url: 'https://nativeship.io/' },
      { label: 'NativeShip pricing', url: 'https://nativeship.io/pricing' },
    ],
  },
  {
    slug: 'edgevolume',
    name: 'EdgeVolume',
    domain: 'edgevolume.vercel.app',
    url: 'https://edgevolume.vercel.app/',
    tagline: 'Control your Mac’s volume from your trackpad edge',
    category: 'Mac utilities',
    title: 'EdgeVolume: change your Mac volume from the trackpad edge',
    description: 'EdgeVolume is a free, open-source Mac menu bar app. Slide one finger along the edge of your trackpad to adjust volume. Requirements, install steps, alternatives and FAQ.',
    keywords: ['EdgeVolume', 'Mac volume control', 'trackpad edge volume', 'macOS menu bar app', 'trackpad gestures Mac', 'open source Mac utility', 'adjust volume trackpad', 'EdgeVolume alternatives', 'EdgeVolume vs BetterTouchTool', 'Mac volume keys alternative'],
    logo: '/customers/edgevolume-logo.svg',
    imageAlt: 'EdgeVolume home page: “Volume, at your fingertips”, with a trackpad illustration showing a volume slider along its right edge.',
    updated: '2026-10-15',
    launched: '2026-10-07',
    intro: 'EdgeVolume is a small, free and open-source Mac utility. Start one finger inside the edge of your trackpad and slide up to turn the volume up, or down to bring it back.',
    facts: [
      { label: 'What it is', value: 'Menu bar utility for macOS' },
      { label: 'Gesture', value: 'One finger sliding along the trackpad edge' },
      { label: 'Requires', value: 'macOS 15 or newer' },
      { label: 'Macs', value: 'Apple Silicon (M1 and newer) and Intel' },
      { label: 'Price', value: 'Free and open source' },
      { label: 'Status', value: 'Early access, v0.1.0' },
      { label: 'Launched', value: 'October 2026' },
      { label: 'Website', value: 'edgevolume.vercel.app' },
    ],
    sections: [
      {
        h: 'What is EdgeVolume?',
        a: 'EdgeVolume is a free, open-source Mac app that turns the physical edge of your trackpad into a volume control.',
        more: ['Slide one finger up the edge to raise the output volume and down to lower it. It runs quietly in the menu bar while you work, so there is less reaching for the keyboard.'],
      },
      {
        h: 'How does EdgeVolume work?',
        a: 'You pick an edge, enable gestures, then start one finger inside that edge and move vertically. Lift your finger to finish.',
        bullets: [
          'Pick your edge: left, right or both, with the strip width and sensitivity that feel right.',
          'Slide to adjust: start inside the edge and move up or down.',
          'Keep working: close preferences and leave EdgeVolume running in the menu bar.',
        ],
        more: ['Gestures start paused on each launch, so you turn them on when you want them.'],
      },
      {
        h: 'What are the features?',
        a: 'One-finger control, a choice of left, right or both edges, adjustable sensitivity and strip width, and an open-source codebase.',
        bullets: ['One-finger volume control', 'Left, right or both edges', 'Adjustable sensitivity and strip width', 'Lives in the menu bar', 'Free, with the source on GitHub'],
      },
      {
        h: 'How do I install EdgeVolume on a Mac?',
        a: 'Download the build for your Mac, drag EdgeVolume into Applications, open it and enable gestures.',
        more: [
          'Use the Apple Silicon build for M1, M2, M3, M4 and newer chips, and the Intel build for Intel-based Macs. To check, open the Apple menu, choose About This Mac, and look for “Chip” (Apple Silicon) or “Processor” (Intel). You need macOS 15 or newer. No Rust, Node.js or developer tools are needed.',
          'The early-access app is not notarized, so macOS may block it the first time. After trying to open it, go to System Settings, then Privacy & Security, find the EdgeVolume notice and choose Open Anyway. Only do this for a download you trust.',
        ],
      },
      {
        h: 'Is EdgeVolume safe and what should I know first?',
        a: 'It is experimental. It uses a private macOS touch API to observe touch input, without suppressing cursor movement or macOS gestures.',
        more: ['Compatibility and gesture reliability still need testing across more trackpads. The code is public on GitHub, so you can read it before you run it, and newer fixes land in the source before the public downloads.'],
      },
      {
        h: 'Does EdgeVolume work on Windows?',
        a: 'Not yet. Windows development builds offer audio test buttons and trackpad diagnostics, but physical edge gestures are still in development.',
      },
    ],
    faq: [
      { q: 'What is EdgeVolume?', a: 'A small, free, open-source Mac utility that lets you adjust your volume by sliding one finger along the physical edge of your trackpad.' },
      { q: 'How do I change the volume with EdgeVolume?', a: 'Enable gestures, start one finger inside the trackpad edge and move it up to raise the volume or down to lower it. Lift your finger to finish.' },
      { q: 'Is EdgeVolume free?', a: 'Yes. It is free and open source, with the code on GitHub.' },
      { q: 'Which Macs and macOS versions does EdgeVolume support?', a: 'macOS 15 or newer, on Apple Silicon (M1, M2, M3, M4 and newer) and on Intel-based Macs.' },
      { q: 'How do I know which Mac I have?', a: 'Open the Apple menu and choose About This Mac. A “Chip” line with an Apple M-series name means Apple Silicon. A “Processor” line with Intel means Intel.' },
      { q: 'What if macOS blocks EdgeVolume?', a: 'The early-access app is not notarized. After trying to open it, go to System Settings, then Privacy & Security, find the EdgeVolume notice and choose Open Anyway. Only do this for a download you trust.' },
      { q: 'Can I use the left or right edge, or both?', a: 'Yes. You can choose the left edge, the right edge or both, and set the strip width and sensitivity.' },
      { q: 'Does EdgeVolume work on Windows?', a: 'Not yet. Windows development builds have audio test buttons and trackpad diagnostics, but edge gestures are still in development.' },
      { q: 'Does it interfere with my cursor or other trackpad gestures?', a: 'It observes touch input without suppressing cursor movement or macOS gestures. It uses a private macOS touch API, so reliability still needs testing across more trackpads.' },
      { q: 'What are the alternatives to EdgeVolume?', a: 'The built-in macOS volume keys and menu bar control need nothing installed. BetterTouchTool is a paid app for custom trackpad, mouse and keyboard actions, with a 45-day free trial. EdgeVolume is the lightweight, free and open-source option for one gesture.' },
      { q: 'How does EdgeVolume compare with BetterTouchTool?', a: 'EdgeVolume does one thing, volume from the trackpad edge, and is free and open source. BetterTouchTool covers many gestures and automations but needs a paid licence after its trial, and you set up the volume action yourself.' },
      { q: 'Do I need developer tools to install it?', a: 'No. You do not need Rust, Node.js or any developer tools. Download, drag into Applications, open and enable gestures.' },
    ],
    compare: {
      intro: 'Most people change Mac volume with the keyboard or the menu bar. EdgeVolume adds a different gesture rather than replacing those.',
      self: { bestFor: 'People who like a quick one-finger slide on the trackpad and want a free, open-source option', tradeoff: 'Early access, experimental, macOS 15 or newer, and compatibility across trackpads is still being tested' },
      alternatives: [
        {
          name: 'Keyboard volume keys and the menu bar',
          what: 'The built-in macOS controls: the volume keys, and the sound control in the menu bar or Control Center.',
          bestFor: 'Everyone, with nothing to install',
          tradeoff: 'Needs the keyboard or a trip to the menu bar, and there is no trackpad edge gesture',
        },
        {
          name: 'BetterTouchTool',
          url: 'https://folivora.ai/',
          what: 'A paid Mac app for custom trackpad, mouse and keyboard actions. Release notes list edge-swipe gestures in recent versions.',
          bestFor: 'People who want many custom gestures and automations, not just volume',
          tradeoff: 'Much larger than a single-purpose utility. It has a 45-day free trial, then needs a paid licence, and you set up the volume action yourself',
        },
      ],
      verdict: 'EdgeVolume is the lightweight choice if all you want is volume on the trackpad edge, and it is free and open source. If you already use a gesture tool such as BetterTouchTool, or you need a fully polished app today, that may suit you better.',
    },
    app: {
      type: 'SoftwareApplication',
      category: 'UtilitiesApplication',
      os: 'macOS 15 or later',
      price: '0',
      featureList: ['Adjust volume by sliding one finger along the trackpad edge', 'Left, right or both edges', 'Adjustable sensitivity and strip width', 'Menu bar app', 'Open source'],
      sameAs: ['https://github.com/reveuse12/edge-volume'],
    },
    sources: [
      { label: 'EdgeVolume home page', url: 'https://edgevolume.vercel.app/' },
      { label: 'EdgeVolume on GitHub', url: 'https://github.com/reveuse12/edge-volume' },
    ],
  },
  {
    slug: 'infibis',
    name: 'InfiBis',
    domain: 'infibis.com',
    url: 'https://www.infibis.com/',
    tagline: 'AI-powered business management for MSMEs',
    category: 'Business software',
    title: 'InfiBis: GST billing, inventory, POS and accounting with an AI copilot',
    description: 'InfiBis is a cloud platform for Indian MSMEs: GST billing, POS, multi-store inventory, CRM, accounting and payroll with an AI copilot. Features, alternatives and FAQ.',
    keywords: ['InfiBis', 'GST billing software', 'MSME software India', 'POS and inventory software', 'AI business copilot', 'cloud accounting India', 'WhatsApp invoice', 'multi-store inventory', 'InfiBis alternatives', 'InfiBis vs TallyPrime', 'InfiBis vs Zoho', 'InfiBis vs Odoo'],
    logo: '/customers/infibis-logo.png',
    imageAlt: 'InfiBis home page: “Less Artificial. More Intelligent.” with the line “POS, GST Billing, Multi-Store Inventory, CRM & Double-Entry Accounting orchestrated by an autonomous AI Copilot”.',
    updated: '2026-10-15',
    launched: '2024-10-16',
    intro: 'InfiBis is a cloud business platform for Indian MSMEs. It puts POS, GST billing, multi-store inventory, CRM, accounting and payroll in one app, with an AI copilot that flags dead stock, cashflow risks and next steps.',
    facts: [
      { label: 'What it is', value: 'Cloud business management platform' },
      { label: 'Made for', value: 'Indian MSMEs, retailers and distributors' },
      { label: 'Covers', value: 'POS, GST billing, inventory, CRM, accounting, HRM' },
      { label: 'AI', value: 'Copilot for stock, cashflow and sales alerts' },
      { label: 'Trial', value: '14-day free trial' },
      { label: 'Launched', value: 'October 2024' },
      { label: 'Website', value: 'infibis.com' },
    ],
    sections: [
      {
        h: 'What is InfiBis?',
        a: 'InfiBis is an AI-powered business management platform for Indian MSMEs that combines POS, GST billing, inventory, CRM, accounting and payroll in one cloud app.',
        more: [
          'It is built to replace a stack of separate tools, such as a billing app, an inventory sheet, an accounting package and a payroll tool. Because the modules share one database, a sale at the counter updates stock, tax and the books together.',
        ],
      },
      {
        h: 'Who is InfiBis for?',
        a: 'It is made for small and medium Indian businesses, especially retailers, distributors and multi-store brands that need GST-ready billing and stock control.',
        more: ['It suits owners who want one place to see revenue, margins, stock and dues, without hiring a consultant to configure an ERP.'],
      },
      {
        h: 'What can InfiBis do?',
        a: 'It covers the day-to-day running of a small business across nine areas.',
        bullets: [
          'Dashboard: a daily view of revenue, margins and alerts with AI-generated insights.',
          'Billing and invoicing: GST-ready invoices with CGST, SGST and IGST split by item HSN code, recurring billing, credit and debit notes, payment tracking and WhatsApp delivery.',
          'Point of sale: counter billing with barcode scanning, UPI and cash payments, instant stock deduction, 58mm and 80mm thermal receipts and A4 bills.',
          'Inventory: stock across warehouses and counters, reorder alerts, dead-stock detection, and batch and expiry tracking.',
          'CRM and sales pipeline: customers, leads and follow-ups, with lifetime value and retention tracking.',
          'Accounting: double-entry books, live profit and loss, expenses, cash flow forecasting, a balance sheet and GST return reports.',
          'HRM and payroll: attendance, leave and monthly payroll with PF, ESIC and TDS, plus salary slips.',
          'Smart retail: demand forecasting and multi-store support.',
          'Reports: sales trends, product velocity, inventory ageing and customer cohorts, exportable to Excel or PDF.',
        ],
      },
      {
        h: 'What is the InfiBis AI Copilot?',
        a: 'The AI Copilot watches your invoicing, stock, accounts and customer payments and suggests what to do next.',
        more: [
          'Examples on the InfiBis site include a warning that a product will run out in a few days, a prompt to send a discount to repeat buyers, and reminders about overdue payments and GST filing dates. Each alert comes with a recommended action, such as raising a purchase order.',
        ],
      },
      {
        h: 'How does InfiBis handle GST?',
        a: 'Invoices calculate CGST, SGST and IGST per item from its HSN code, and the platform includes GST return-ready reports.',
        more: ['Its site lists reconciliation for GSTR-1 and GSTR-3B. Have your accountant check the reports against your own filing process before you rely on them.'],
      },
      {
        h: 'How much does InfiBis cost?',
        a: 'InfiBis offers a 14-day free trial. Check infibis.com/pricing for current plans and prices.',
      },
    ],
    faq: [
      { q: 'What is InfiBis used for?', a: 'Running a small business in one place: counter billing, GST invoices, stock, customers, accounts and payroll, with an AI copilot that points out risks and next steps.' },
      { q: 'Is InfiBis made for Indian businesses?', a: 'Yes. It is built for Indian MSMEs, with GST-ready invoicing, HSN-based tax splits, UPI payments and PF, ESIC and TDS in payroll.' },
      { q: 'Does InfiBis have a free trial?', a: 'Yes. It offers a 14-day free trial. See infibis.com/pricing for plans after the trial.' },
      { q: 'Can I send invoices on WhatsApp?', a: 'Yes. InfiBis can send a GST invoice and a PDF link to a customer on WhatsApp in one click.' },
      { q: 'Does InfiBis support multiple stores and warehouses?', a: 'Yes. It tracks stock across warehouses and counters, with reorder alerts, dead-stock detection and batch and expiry tracking.' },
      { q: 'What does the InfiBis POS support?', a: 'Barcode scanning, UPI and cash payments, instant stock deduction, and 58mm and 80mm thermal receipt printers as well as A4 bills. It also lists offline sync.' },
      { q: 'Does InfiBis include accounting and payroll?', a: 'Yes. It includes double-entry accounting with live profit and loss, a balance sheet and GST reports, plus attendance, leave and payroll with PF, ESIC, TDS and salary slips.' },
      { q: 'What is the InfiBis AI Copilot?', a: 'A feature that audits invoicing, stock, accounts and customer payments and recommends actions, such as reordering a low-stock item or following up on overdue payments.' },
      { q: 'What are the alternatives to InfiBis?', a: 'Common alternatives for Indian small businesses are TallyPrime, the Zoho business apps and Odoo. They differ in whether they are desktop or cloud software, how much setup they need and how many modules come in one product.' },
      { q: 'How does InfiBis compare with TallyPrime, Zoho and Odoo?', a: 'InfiBis puts POS, billing, inventory, CRM, accounting and payroll in one cloud product with an AI copilot. TallyPrime is a long-established accounting package, Zoho offers a suite of separate apps, and Odoo is a modular ERP that can be customised heavily.' },
      { q: 'Can I export reports?', a: 'Yes. Its reports and analytics can be exported to Excel or PDF.' },
    ],
    compare: {
      intro: 'Indian small businesses usually choose between an accounting package, a suite of separate apps and a customisable ERP. InfiBis aims to cover the whole job in one product.',
      self: { bestFor: 'Small retailers and distributors that want POS, GST billing, stock, accounts and payroll in one cloud app', tradeoff: 'A newer product, so check that its features and reports match how you work during the free trial' },
      alternatives: [
        {
          name: 'TallyPrime',
          url: 'https://tallysolutions.com/',
          what: 'A long-established accounting and business management package, widely used by Indian businesses and accountants.',
          bestFor: 'Businesses and accountants who already know Tally and mainly need accounting and GST compliance',
          tradeoff: 'Built around accounting. Billing, stock, CRM and payroll workflows may need extra setup or add-ons',
        },
        {
          name: 'Zoho (Books, Inventory and related apps)',
          url: 'https://www.zoho.com/in/',
          what: 'A suite of cloud apps for accounting, inventory, CRM and more, with India GST support.',
          bestFor: 'Teams that want to pick and connect individual apps from one vendor',
          tradeoff: 'Several separate apps and subscriptions to set up and connect',
        },
        {
          name: 'Odoo',
          url: 'https://www.odoo.com/',
          what: 'A modular open-source ERP with apps for sales, inventory, accounting, HR and more.',
          bestFor: 'Businesses that want deep customisation and have someone to configure it',
          tradeoff: 'More setup, and India-specific GST and local needs may need configuration or a partner',
        },
      ],
      verdict: 'InfiBis is the simplest fit if you want billing, stock, accounts and payroll running together quickly. If your accountant already works in Tally, or you need heavy customisation, TallyPrime or Odoo may suit you better. Try the 14-day free trial before deciding.',
    },
    app: {
      type: 'WebApplication',
      category: 'BusinessApplication',
      os: 'Any (web browser)',
      featureList: ['GST-ready billing and invoicing', 'Point of sale with barcode scanning and UPI', 'Multi-store inventory with reorder alerts and batch tracking', 'CRM and sales pipeline', 'Double-entry accounting with live profit and loss', 'HRM and payroll with PF, ESIC and TDS', 'AI copilot with stock and cashflow alerts', 'WhatsApp invoice delivery'],
    },
    sources: [{ label: 'InfiBis home page', url: 'https://www.infibis.com/' }],
  },
]

/** Share image (also the page thumbnail source) and the small WebP thumbnail. */
export function launchImages(slug: string): { og: string; thumb: string } {
  return { og: `/launches/${slug}-og.jpg`, thumb: `/launches/${slug}-thumb.webp` }
}

export function getLaunch(slug: string): Launch | undefined {
  return LAUNCHES.find((l) => l.slug === slug)
}

export function launchSlugForDomain(domain: string): string | undefined {
  return LAUNCHES.find((l) => l.domain === domain)?.slug
}
