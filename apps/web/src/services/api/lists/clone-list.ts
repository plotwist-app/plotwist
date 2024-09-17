import { supabase } from '@/services/supabase'
import type { List } from '@/types/supabase/lists'

type CloneListParams = { listId: string; userId: string }

export const cloneList = async ({ listId, userId }: CloneListParams) => {
  const { data: list } = await supabase
    .from('lists')
    .select('*, list_items(*)')
    .eq('id', listId)
    .single<Omit<List, 'list_likes'>>()

  if (list) {
    const { list_items: items, ...values } = list

    const { data: newList } = await supabase
      .from('lists')
      .insert({ ...values, user_id: userId })
      .select()
      .single<List>()

    if (newList) {
      const newItems = items.map(({ list_id: id, ...item }) => {
        return { ...item, list_id: id }
      })

      await supabase.from('list_items').insert(newItems)

      return newList.id
    }
  }
}
