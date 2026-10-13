// All scoring weights and targets live here.
// Weights inside a group are relative: a missing measurement is dropped and the rest are rescaled.

export const SCORING = {
  // Bump when the shape of stored scan data changes. Cached scans with another version are ignored.
  dataVersion: 1,

  // Share of the 0-100 total.
  weights: {
    discoverability: 30,
    buzz: 25,
    trust: 20,
    technical: 25,
  },

  discoverability: {
    directories: 40,
    indexing: 40,
    rank: 20,
    directoriesTarget: 5, // listings that earn full marks
    indexingTarget: 10, // search results for site:domain that earn full marks (the check reads up to 10)
    rankBest: 10_000, // Tranco rank at or above this earns full marks
    rankWorst: 1_000_000, // Tranco rank at or below this earns zero
  },

  buzz: {
    absolute: 70, // own mention volume
    relative: 30, // own volume compared with the strongest competitor
    web: 40,
    hn: 20,
    github: 20,
    social: 20, // Reddit, LinkedIn and X together, full check only
    caps: { web: 10, hn: 5, github: 5, social: 10 },
  },

  trust: {
    profiles: 35, // links to LinkedIn or X profiles on the homepage or about page
    structured: 25, // JSON-LD present
    about: 20, // an about page exists
    reviews: 20, // review-site mentions, full check only
    reviewsTarget: 5,
  },

  technical: {
    checks: 70,
    speed: 30,
    checkWeights: {
      https: 10,
      title: 8,
      description: 8,
      canonical: 6,
      og_tags: 6,
      og_image: 8,
      og_image_reachable: 6,
      twitter_card: 4,
      sitemap: 8,
      robots: 8,
      structured_data: 8,
      headings: 6,
      viewport: 4,
      lang: 3,
      image_alt: 4,
      indexable: 8,
      og_type: 2,
    } as Record<string, number>,
  },

  // Search queries allowed per check.
  queryCaps: { free: 2, full: 30 },

  // Gap severity from estimated point gain.
  severity: { high: 5, medium: 2 },
} as const

export type SubScoreName = 'discoverability' | 'buzz' | 'trust' | 'technical'
