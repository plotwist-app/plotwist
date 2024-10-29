import type { AddItemToWatchListValues } from '@/hooks/use-watch-list'
import { supabase } from '@/services/supabase'

export const addItemToWatchList = async ({
  userId,
  tmdbId,
}: AddItemToWatchListValues) => {
  const { error, data } = await supabase.from('watch_list_items').insert({
    user_id: userId,
    tmdb_id: tmdbId,
  })

  if (error) throw new Error(error.message)
  return data
}
