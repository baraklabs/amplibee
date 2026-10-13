// Starting budgets suggested for Oyekool campaigns. These are defaults the founder can change on Oyekool.
// They are not quotes and promise no result.

import type { OyekoolTask } from './types.ts'

export const OYEKOOL_PRICE_USD: Record<OyekoolTask, number> = {
  post: 25,
  write: 60,
  engage: 15,
}
