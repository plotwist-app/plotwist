import { z } from 'zod'

export const createImageQuerySchema = z.object({
  folder: z.enum(['banner', 'avatar', 'list']),
  fileName: z.string().optional(),
})

export const createImageResponseSchema = {
  201: z.object({
    url: z.string(),
  }),
}
