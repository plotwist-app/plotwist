import { schema } from '@/db/schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const createListItemBodySchema = createInsertSchema(
  schema.listItems
).omit({ id: true, createdAt: true, position: true })

export const createListItemResponseSchema = {
  201: z.object({
    listItem: createSelectSchema(schema.listItems),
  }),
}

export const getListItemsParamsSchema = z.object({
  listId: z.string().uuid(),
})

export const getListItemsResponseSchema = {
  200: z.array(
    createSelectSchema(schema.listItems).extend({
      title: z.string(),
      posterPath: z.string().nullable(),
      backdropPath: z.string().nullable(),
    })
  ),
}

export const deleteListItemParamSchema = z.object({
  id: z.string().uuid(),
})

export const deleteListItemResponseSchema = {
  204: z.null(),
  404: z
    .object({
      message: z.string(),
    })
    .describe('List or list item not found.'),
  401: z
    .object({
      message: z.string(),
    })
    .describe('Unauthorized.'),
}

export const updateListItemsBodySchema = z.object({
  listItems: z.array(
    z.object({
      id: z.string(),
      position: z.number(),
    })
  ),
})
