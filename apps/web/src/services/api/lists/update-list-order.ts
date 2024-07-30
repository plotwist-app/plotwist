import { supabase } from '@/services/supabase'
import { ListItem } from '@/types/supabase/lists'

export const handleUpdateOrderInDatabase = async (
  items: ListItem[],
  oldIndex: number,
  newIndex: number,
) => {
  const itemToMove = items[oldIndex]
  items.splice(oldIndex, 1)
  items.splice(newIndex, 0, itemToMove)

  const updates = items.map((item, index) => ({
    id: item.id,
    list_id: item.list_id,
    order: index + 1,
  }))

  const { data, error } = await supabase
    .from('list_items')
    .upsert(updates, { onConflict: ['id', 'list_id'] })
}
