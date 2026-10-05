import type { ChannelId } from "@/lib/channels/types";

/**
 * Illustrative profiles shown on the public network page before real,
 * opted-in influencers fill out the directory. Never rendered as if they
 * were live data — the network page labels this row as an example.
 */
export interface SeedInfluencer {
  name: string;
  photo: string;
  category: "influencer" | "creator" | "community";
  niches: string[];
  platforms: ChannelId[];
  rating: number;
  reviewCount: number;
  audienceSize: number;
}

export const seedInfluencers: SeedInfluencer[] = [
  {
    name: "Chris Walker",
    photo: "https://randomuser.me/api/portraits/men/44.jpg",
    category: "influencer",
    niches: ["dev tools", "cybersecurity", "open source"],
    platforms: ["x", "youtube"],
    rating: 4.9,
    reviewCount: 214,
    audienceSize: 128000,
  },
  {
    name: "Lauren Mitchell",
    photo: "https://randomuser.me/api/portraits/women/32.jpg",
    category: "creator",
    niches: ["SaaS", "startups", "indie hacking"],
    platforms: ["x", "linkedin"],
    rating: 4.8,
    reviewCount: 176,
    audienceSize: 64000,
  },
  {
    name: "Wei Zhang",
    photo: "https://randomuser.me/api/portraits/men/68.jpg",
    category: "influencer",
    niches: ["AI", "productivity", "business software"],
    platforms: ["linkedin", "youtube"],
    rating: 5.0,
    reviewCount: 98,
    audienceSize: 41000,
  },
  {
    name: "Sophie Bennett",
    photo: "https://randomuser.me/api/portraits/women/75.jpg",
    category: "creator",
    niches: ["design", "no-code", "web apps"],
    platforms: ["instagram", "youtube"],
    rating: 4.7,
    reviewCount: 152,
    audienceSize: 89000,
  },
  {
    name: "Aarav Mehta",
    photo: "https://randomuser.me/api/portraits/men/21.jpg",
    category: "influencer",
    niches: ["mobile apps", "consumer tech", "gadgets"],
    platforms: ["instagram", "x"],
    rating: 4.9,
    reviewCount: 301,
    audienceSize: 210000,
  },
  {
    name: "Emily Parker",
    photo: "https://randomuser.me/api/portraits/women/86.jpg",
    category: "creator",
    niches: ["startups", "GitHub", "developer tools"],
    platforms: ["x", "youtube"],
    rating: 4.8,
    reviewCount: 133,
    audienceSize: 76000,
  },
  {
    name: "Daniel Brooks",
    photo: "https://randomuser.me/api/portraits/men/15.jpg",
    category: "influencer",
    niches: ["cloud", "DevOps", "developer tools"],
    platforms: ["x", "linkedin"],
    rating: 4.9,
    reviewCount: 187,
    audienceSize: 97000,
  },
  {
    name: "Yuki Tanaka",
    photo: "https://randomuser.me/api/portraits/women/25.jpg",
    category: "creator",
    niches: ["marketing", "sales", "growth"],
    platforms: ["linkedin", "instagram"],
    rating: 4.8,
    reviewCount: 164,
    audienceSize: 72000,
  },
  {
    name: "James Foster",
    photo: "https://randomuser.me/api/portraits/men/52.jpg",
    category: "influencer",
    niches: ["fintech", "business", "ecommerce"],
    platforms: ["x", "youtube"],
    rating: 4.7,
    reviewCount: 119,
    audienceSize: 83000,
  },
  {
    name: "Priya Sharma",
    photo: "https://randomuser.me/api/portraits/women/49.jpg",
    category: "creator",
    niches: ["education", "productivity", "creator tools"],
    platforms: ["youtube", "instagram"],
    rating: 4.9,
    reviewCount: 226,
    audienceSize: 156000,
  },
  {
    name: "Tom Anderson",
    photo: "https://randomuser.me/api/portraits/men/41.jpg",
    category: "influencer",
    niches: ["gaming", "consumer tech", "gadgets"],
    platforms: ["youtube", "x"],
    rating: 4.8,
    reviewCount: 248,
    audienceSize: 192000,
  },
  {
    name: "Hannah Wilson",
    photo: "https://randomuser.me/api/portraits/women/63.jpg",
    category: "creator",
    niches: ["design", "lifestyle tech", "mobile apps"],
    platforms: ["instagram", "linkedin"],
    rating: 4.9,
    reviewCount: 143,
    audienceSize: 108000,
  },
];