import { eq } from 'drizzle-orm'
import type { InsertListItem } from '@/domain/entities/list-item'
import type { UpdateListItemsServiceInput } from '@/domain/services/list-item/update-list-items'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'
import { db } from '..'
import { schema } from '../schema'

const insertListItemImpl = async (input: InsertListItem) => {
  return db.insert(schema.listItems).values(input).returning()
}

export const insertListItem = withDbTracing(
  'insert-list-item',
  insertListItemImpl
)

const selectListItemsImpl = async (listId: string) => {
  return db
    .select()
    .from(schema.listItems)
    .where(eq(schema.listItems.listId, listId))
    .orderBy(schema.listItems.position)
}

export const selectListItems = withDbTracing(
  'select-list-items',
  selectListItemsImpl
)

const deleteListItemImpl = async (id: string) => {
  return db
    .delete(schema.listItems)
    .where(eq(schema.listItems.id, id))
    .returning()
}

export const deleteListItem = withDbTracing(
  'delete-list-item',
  deleteListItemImpl
)

const getListItemImpl = async (id: string) => {
  return db.select().from(schema.listItems).where(eq(schema.listItems.id, id))
}

export const getListItem = withDbTracing('get-list-item', getListItemImpl)

const updateListItemsImpl = async ({
  listItems,
}: UpdateListItemsServiceInput) => {
  return db.transaction(async tx => {
    const promises = listItems.map(({ id, position }) =>
      tx
        .update(schema.listItems)
        .set({ position })
        .where(eq(schema.listItems.id, id))
        .returning()
    )

    return await Promise.all(promises)
  })
}

export const updateListItems = withDbTracing(
  'update-list-items',
  updateListItemsImpl
)
