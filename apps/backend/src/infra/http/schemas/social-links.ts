import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { schema, socialPlatformsEnum } from '@/db/schema'

export const socialLinksBodySchema = z.record(
  z.enum(socialPlatformsEnum.enumValues),
  z.string().url('Enter a valid URL').or(z.literal('')).optional()
)

export const upsertSocialLinksResponseSchema = {
  204: z.undefined(),
}

export const getSocialLinksQuerySchema = z.object({
  userId: z.string(),
})

export const getSocialLinksResponseSchema = {
  200: z.object({
    socialLinks: z.array(createSelectSchema(schema.socialLinks)),
  }),
}
