import { z } from 'zod'

const urlSchema = z.string().url().min(1)

export const createSharedUrlBodySchema = z.object({
  originalUrl: urlSchema.describe(
    'Full URL to shorten (e.g. list or movie page)'
  ),
})

export const createSharedUrlResponseSchema = {
  201: z
    .object({
      shortCode: z.string(),
      shortUrl: z.string().url(),
    })
    .describe('Short URL created.'),
  400: z.object({ message: z.string() }),
}

export const getSharedUrlParamsSchema = z.object({
  shortCode: z.string().min(1).max(20),
})

export const getSharedUrlResponseSchema = {
  302: z.null().describe('Redirect to original URL'),
  404: z.object({ message: z.string() }),
}
