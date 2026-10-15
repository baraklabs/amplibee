// What each plan allows. The web app has the same table in apps/web/lib/content/plans.ts; a test keeps the two equal.

export type PlanId = 'free' | 'starter' | 'plus' | 'growth' | 'scale' | 'authority'

export interface PlanLimits {
  competitors: number
  keywords: number
  directories: number
  blogPosts: number
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { competitors: 3, keywords: 0, directories: 0, blogPosts: 0 },
  starter: { competitors: 5, keywords: 10, directories: 3, blogPosts: 0 },
  plus: { competitors: 10, keywords: 20, directories: 10, blogPosts: 1 },
  growth: { competitors: 20, keywords: 20, directories: 50, blogPosts: 4 },
  scale: { competitors: 50, keywords: 50, directories: 100, blogPosts: 20 },
  authority: { competitors: 100, keywords: 100, directories: 150, blogPosts: 45 },
}

export const isPlan = (v: unknown): v is PlanId => typeof v === 'string' && v in PLAN_LIMITS
