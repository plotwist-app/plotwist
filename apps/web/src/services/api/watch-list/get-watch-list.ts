import type { GetWatchListValues } from '@/hooks/use-watch-list'
import { supabase } from '@/services/supabase'

export const getWatchList = async ({ userId }: GetWatchListValues) => {
  const { error, data } = await supabase
    .from('watch_list_items')
    .select('*')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return data
}
