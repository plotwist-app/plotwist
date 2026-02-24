import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { schema } from '@/infra/db/schema'

export const createFeedbackBodySchema = createInsertSchema(
  schema.feedbacks
).omit({
  userId: true,
  id: true,
  createdAt: true,
})

export const createFeedbackResponseSchema = {
  201: z
    .object({
      feedback: createInsertSchema(schema.feedbacks),
    })
    .describe('Feedback created.'),
}
