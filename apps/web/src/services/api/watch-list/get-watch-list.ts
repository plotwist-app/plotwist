import type { GetWatchListValues, WatchListItem } from '@/hooks/use-watch-list'
import { supabase } from '@/services/supabase'

export const getWatchList = async ({ user_id: userId }: GetWatchListValues) => {
  if (typeof userId !== 'string') throw new Error('Invalid user id')

  const { error, data } = await supabase
    .from('watch_list_items')
    .select('*')
    .eq('user_id', userId)
    .returns<WatchListItem[]>()

  if (error) throw new Error(error.message)
  return data
}
