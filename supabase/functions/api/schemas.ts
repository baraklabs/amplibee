import { z } from 'zod'

const utm = z
  .record(z.string().max(100))
  .refine((o) => Object.keys(o).length <= 8, 'Too many UTM fields.')
  .optional()

const text = (min: number, max: number, label: string) =>
  z.string({ required_error: `${label} is required.` }).trim().min(min, `${label} is too short.`).max(max, `${label} is too long.`)

export const createCheckSchema = z
  .object({
    domain: z.string().max(300).optional(),
    no_website: z
      .object({
        sells: text(3, 200, 'What you sell'),
        customer: text(3, 200, 'Your ideal customer').optional(),
        markets: text(2, 200, 'Markets').optional(),
      })
      .optional(),
    turnstile_token: z.string().min(1, 'Complete the bot check first.').max(2048),
    client_id: z.string().regex(/^[A-Za-z0-9-]{8,64}$/).optional(),
    utm,
  })
  .refine((v) => !!v.domain !== !!v.no_website, { message: 'Send either a domain or the three no-website fields.' })

export const competitorsSchema = z.object({ competitors: z.array(z.string().max(300)).max(3, 'Too many competitors. Remove some and try again.') })

export const productSchema = z.object({
  title: z.string().trim().max(200).nullable().optional(),
  description: z.string().trim().max(500).nullable().optional(),
  one_liner: z.string().trim().max(300).nullable().optional(),
})

export const unlockSchema = z.object({
  job_id: z.string().uuid('That job id is not valid.'),
})

export const REQUEST_TYPES = ['directory_submission', 'track_competitors', 'launch_done_for_you'] as const
export const requestSchema = z.object({
  job_id: z.string().uuid('That job id is not valid.'),
  type: z.enum(REQUEST_TYPES, { errorMap: () => ({ message: 'Choose one of the three request types.' }) }),
  note: z.string().trim().max(1000, 'Keep the note under 1,000 characters.').optional(),
})

export const CONTACT_TOPICS = ['general', 'upgrade', 'custom_plan', 'directory_submission', 'content', 'press'] as const
export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Tell us your name.').max(120),
  email: z.string().trim().email('Enter a valid email address.').max(254),
  company: z.string().trim().max(160).optional(),
  topic: z.enum(CONTACT_TOPICS).default('general'),
  message: z.string().trim().min(10, 'Write a few words so we know how to help.').max(3000, 'Keep the message under 3,000 characters.'),
  turnstile_token: z.string().min(1, 'Complete the bot check first.').max(2048),
})

export const removalSchema = z.object({
  domain: z.string().max(300),
  email: z.string().trim().email().max(254).optional(),
  reason: z.string().trim().max(1000).optional(),
  turnstile_token: z.string().min(1, 'Complete the bot check first.').max(2048),
})

export const uuidSchema = z.string().uuid()

export function firstIssue(err: z.ZodError): string {
  const i = err.issues[0]
  return i ? i.message : 'The request is not valid.'
}
