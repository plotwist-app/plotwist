import { ListItem } from '@/types/supabase/lists'

export function getOldestItem(item: ListItem[]) {
  const oldestItem = item[0] || ''
  const backdropUrl = oldestItem.backdrop_path

  return backdropUrl
}
