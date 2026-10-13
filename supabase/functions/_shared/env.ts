// Environment access that works in Deno (Edge Functions) and in Node (tests).

type EnvSource = { get(k: string): string | undefined }

function source(): EnvSource {
  const g = globalThis as unknown as { Deno?: { env: EnvSource }; process?: { env: Record<string, string | undefined> } }
  if (g.Deno) return g.Deno.env
  const pe = g.process?.env ?? {}
  return { get: (k) => pe[k] }
}

export function env(name: string, fallback = ''): string {
  return source().get(name) || fallback
}

export function flag(name: string, fallback = false): boolean {
  const v = source().get(name)
  if (v === undefined || v === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())
}

export function int(name: string, fallback: number): number {
  const n = Number(source().get(name))
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export function siteUrl(): string {
  return env('SITE_URL', 'http://localhost:3000').replace(/\/$/, '')
}

export function allowedOrigins(): string[] {
  const extra = env('ALLOWED_ORIGINS')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return [siteUrl(), ...extra]
}
