import type {
  AddItemToWatchListValues,
  WatchListItem,
} from '@/hooks/use-watch-list'
import { supabase } from '@/services/supabase'
import type { Review } from '@/types/supabase/reviews'

export const addItemToWatchList = async ({
  userId,
  tmdbId,
}: AddItemToWatchListValues) => {
  const userAlreadyReviewedItem = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbId)
    .returns<Review>()

  if (userAlreadyReviewedItem.data) {
    throw new Error('User already reviewed item')
  }

  const userAlreadyHasItem = await supabase
    .from('watch_list_items')
    .select('*')
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbId)
    .returns<WatchListItem>()

  if (userAlreadyHasItem.data) {
    throw new Error('Item already in watch list')
  }

  const { error, data } = await supabase.from('watch_list_items').insert({
    user_id: userId,
    tmdb_id: tmdbId,
  })

  if (error) throw new Error(error.message)
  return data
}
