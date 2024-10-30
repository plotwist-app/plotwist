import type {
  RemoveItemFromWatchListValues,
  WatchListItem,
} from '@/hooks/use-watch-list'
import { supabase } from '@/services/supabase'

export const removeItemFromWatchList = async ({
  user_id: userId,
  tmdb_id: tmdbId,
}: RemoveItemFromWatchListValues) => {
  const userHasItem = await supabase
    .from('watch_list_items')
    .select('*')
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbId)
    .returns<WatchListItem>()

  if (!userHasItem.data) {
    throw new Error('Item not in watch list')
  }

  const { error } = await supabase
    .from('watch_list_items')
    .delete()
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbId)

  if (error) throw new Error(error.message)
}
