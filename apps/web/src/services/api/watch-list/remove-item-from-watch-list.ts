import type { RemoveItemFromWatchListValues } from '@/hooks/use-watch-list'
import { supabase } from '@/services/supabase'

export const removeItemFromWatchList = async ({
  userId,
  tmdbId,
}: RemoveItemFromWatchListValues) => {
  const { error } = await supabase
    .from('watch_list_items')
    .delete()
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbId)

  if (error) throw new Error(error.message)
}
