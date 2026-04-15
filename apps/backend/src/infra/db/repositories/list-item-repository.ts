import { eq } from 'drizzle-orm'
import type { InsertListItem } from '@/domain/entities/list-item'
import type { UpdateListItemsServiceInput } from '@/domain/services/list-item/update-list-items'
import { db } from '..'
import { schema } from '../schema'

export async function insertListItem(input: InsertListItem) {
  return db.insert(schema.listItems).values(input).returning()
}

export async function selectListItems(listId: string) {
  return db
    .select()
    .from(schema.listItems)
    .where(eq(schema.listItems.listId, listId))
    .orderBy(schema.listItems.position)
}

export async function deleteListItem(id: string) {
  return db
    .delete(schema.listItems)
    .where(eq(schema.listItems.id, id))
    .returning()
}

export async function getListItem(id: string) {
  return db.select().from(schema.listItems).where(eq(schema.listItems.id, id))
}

export async function updateListItems({
  listItems,
}: UpdateListItemsServiceInput) {
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
