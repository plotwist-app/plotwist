import { z } from 'zod'

export const deleteSubscriptionBodySchema = z.object({
  when: z.enum(['now', 'at_end_of_current_period']),
  reason: z.string().optional(),
})

export const deleteSubscriptionResponseSchema = {
  200: z.object({
    message: z.string(),
  }),
}
