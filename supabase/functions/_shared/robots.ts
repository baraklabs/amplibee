// Small robots.txt parser following RFC 9309: longest matching rule wins, Allow wins ties.

export interface RobotsRule {
  allow: boolean
  pattern: string
}

interface Group {
  agents: string[]
  rules: RobotsRule[]
}

export function parseRobots(text: string, agent: string): RobotsRule[] {
  const groups: Group[] = []
  let current: Group | null = null
  let lastWasAgent = false

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim()
    if (!line) continue
    const i = line.indexOf(':')
    if (i < 0) continue
    const field = line.slice(0, i).trim().toLowerCase()
    const value = line.slice(i + 1).trim()
    if (field === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] }
        groups.push(current)
      }
      current.agents.push(value.toLowerCase())
      lastWasAgent = true
    } else if (field === 'allow' || field === 'disallow') {
      lastWasAgent = false
      if (current && value !== '') current.rules.push({ allow: field === 'allow', pattern: value })
    } else {
      lastWasAgent = false
    }
  }

  const a = agent.toLowerCase()
  let best = 0
  for (const g of groups) for (const ag of g.agents) if (ag !== '*' && a.includes(ag)) best = Math.max(best, ag.length)
  const wanted = (ag: string) => (best > 0 ? ag !== '*' && a.includes(ag) && ag.length === best : ag === '*')
  return groups.filter((g) => g.agents.some(wanted)).flatMap((g) => g.rules)
}

function toRegex(pattern: string): RegExp {
  const anchored = pattern.endsWith('$')
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .split('*')
    .map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*')
  return new RegExp('^' + body + (anchored ? '$' : ''))
}

export function isAllowed(rules: RobotsRule[], path: string): boolean {
  let bestLen = -1
  let allow = true
  for (const r of rules) {
    if (!toRegex(r.pattern).test(path)) continue
    const len = r.pattern.length
    if (len > bestLen || (len === bestLen && r.allow)) {
      bestLen = len
      allow = r.allow
    }
  }
  return allow
}

/** True when the generic (*) group disallows the whole site. */
export function blocksEverything(text: string): boolean {
  return !isAllowed(parseRobots(text, '*'), '/')
}
