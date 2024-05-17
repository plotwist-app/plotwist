/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
import { supabase } from '@/services/supabase'
import { List } from '@/types/supabase/lists'

type CloneListParams = { listId: string; userId: string }

export const cloneList = async ({ listId, userId }: CloneListParams) => {
  const { data: list } = await supabase
    .from('lists')
    .select('*, list_items(*)')
    .eq('id', listId)
    .single<Omit<List, 'list_likes'>>()

  if (list) {
    const { list_items: items, user_id, created_at, id, ...values } = list

    const { data: newList } = await supabase
      .from('lists')
      .insert({ ...values, user_id: userId })
      .select()
      .single<List>()

    if (newList) {
      const newItems = items.map((item) => {
        const { list_id, id, ...newItem } = item
        return { ...newItem, list_id: newList.id }
      })

      await supabase.from('list_items').insert(newItems)

      return newList.id
    }
  }
}
