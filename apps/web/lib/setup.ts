// The quick-setup checklist, shared by the overview and the setup page.

import { type Feature, hasFeature, type Limits, type PlanId } from './content/plans.ts'
import type { Workspace } from './workspace.ts'

export interface SetupStep {
  id: 'site' | 'competitors' | 'keywords' | 'directories'
  title: string
  hint: string
  done: boolean
  /** The feature that locks this step on the current plan, if any. */
  locked?: Feature
}

export function setupSteps({ plan, ws }: { plan: PlanId; limits: Limits; ws: Workspace }): SetupStep[] {
  return [
    { id: 'site', title: 'Add your website', hint: 'We read it and build your visibility score.', done: !!ws.domain },
    { id: 'competitors', title: 'Add your competitors', hint: 'See where they are visible and you are not.', done: ws.competitors.length > 0 },
    { id: 'keywords', title: 'Pick keywords to track', hint: 'The searches you want to be found for.', done: ws.keywords.length > 0, locked: hasFeature(plan, 'keywords') ? undefined : 'keywords' },
    { id: 'directories', title: 'Choose directories to submit to', hint: 'Start with the ones that matter for your category.', done: Object.keys(ws.directories).length > 0, locked: hasFeature(plan, 'directories') ? undefined : 'directories' },
  ]
}
