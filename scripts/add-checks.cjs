// One-off edit: adds four homepage checks (lang, image_alt, indexable, og_type) and updates the copy that counts them.
const fs = require('fs')
const edit = (file, fn) => {
  const before = fs.readFileSync(file, 'utf8')
  const after = fn(before)
  if (after === before) console.log('UNCHANGED', file)
  fs.writeFileSync(file, after)
}

edit('supabase/functions/_shared/technical.ts', (s) =>
  s.replace(
    "  const links = [...page.links, ...i.aboutLinks]",
    `  add('lang', !!page.lang, page.lang ? \`Page language is \${page.lang}.\` : 'No lang attribute on the html tag.', page.lang)

  const missingAlt = page.imgNoAlt
  add('image_alt', missingAlt === 0, missingAlt === 0 ? (page.imgCount ? 'Every image has alt text.' : 'No images to check.') : \`\${missingAlt} of \${page.imgCount} images have no alt text.\`, missingAlt)

  const noindex = /(^|[\\s,])noindex([\\s,]|$)/i.test(page.robotsMeta ?? '')
  add('indexable', !noindex, noindex ? 'A robots meta tag says noindex.' : 'No noindex tag.', noindex ? 'noindex' : null)

  add('og_type', !!page.og['og:type'], page.og['og:type'] ? \`og:type is \${page.og['og:type']}.\` : 'No og:type.', page.og['og:type'] ?? null)

  const links = [...page.links, ...i.aboutLinks]`,
  ),
)

edit('supabase/functions/_shared/scoring.config.ts', (s) => s.replace("      viewport: 4,\n", "      viewport: 4,\n      lang: 3,\n      image_alt: 4,\n      indexable: 8,\n      og_type: 2,\n"))

edit('supabase/functions/_shared/gaps.ts', (s) =>
  s
    .replace(
      "        case 'viewport':",
      `        case 'lang':
          drafts.push({ ...base, id: 'lang', fix_ref: 'technical-basics', message: 'Your homepage html tag has no lang attribute, so screen readers and search engines have to guess the language of the page.' })
          break
        case 'image_alt':
          drafts.push({ ...base, id: 'image_alt', fix_ref: 'technical-basics', message: \`\${n(Number(v))} \${Number(v) === 1 ? 'image' : 'images'} on your homepage \${Number(v) === 1 ? 'has' : 'have'} no alt text, so screen readers skip them and image search cannot read them.\` })
          break
        case 'indexable':
          drafts.push({ ...base, id: 'indexable', baseSeverity: 'high', fix_ref: 'technical-basics', message: 'Your homepage has a noindex robots tag, so search engines are told to leave it out of results.' })
          break
        case 'og_type':
          drafts.push({ ...base, id: 'og_type', fix_ref: 'what-an-og-image-is', message: 'Your homepage has no og:type tag, so link previews cannot tell whether it is a website or an article.' })
          break
        case 'viewport':`,
    )
    .replace("  viewport: 'Add the viewport meta tag',", "  viewport: 'Add the viewport meta tag',\n  lang: 'Set the lang attribute on the html tag',\n  image_alt: 'Add alt text to every image',\n  indexable: 'Remove the noindex tag from the homepage',\n  og_type: 'Add an og:type tag',"),
)

edit('supabase/tests/scoring.test.ts', (s) =>
  s
    .replace('<img src="b.png">', '<img src="b.png" alt="Dashboard">')
    .replace('<meta property="og:url" content="https://acme.test/">', '<meta property="og:url" content="https://acme.test/"><meta property="og:type" content="website">')
    .replace("expect(failed).toEqual(expect.arrayContaining(['https', 'title', 'description', 'canonical', 'og_image', 'sitemap', 'robots', 'structured_data', 'headings', 'viewport']))", "expect(failed).toEqual(expect.arrayContaining(['https', 'title', 'description', 'canonical', 'og_image', 'sitemap', 'robots', 'structured_data', 'headings', 'viewport', 'lang', 'og_type']))")
    .replace("expect(p.imgNoAlt).toBe(1)", "expect(p.imgNoAlt).toBe(0)"),
)

edit('apps/web/app/methodology/page.tsx', (s) => s.replace("'Thirteen homepage checks and mobile speed'", "`${Object.keys(SCORING.technical.checkWeights).length} homepage checks and mobile speed`"))
edit('apps/web/lib/content/steps.ts', (s) => s.replace('13 technical basics on your homepage', '17 technical basics on your homepage'))
edit('apps/web/lib/content/methodology.ts', (s) =>
  s.replace(
    "Open Graph tags, the OG image and whether it loads, twitter:card, sitemap.xml, robots.txt, JSON-LD, heading order and the viewport tag.",
    "Open Graph tags, the OG image, twitter:card, sitemap.xml, robots.txt, JSON-LD, heading order, the viewport tag, page language, image alt text, noindex and og:type.",
  ),
)
console.log('done')
