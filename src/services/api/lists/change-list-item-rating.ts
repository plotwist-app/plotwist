import { supabase } from '@/services/supabase'

export type ChangeListItemRatingParams = {
  listItemId: string
  rating: number
}
export const changeListItemRating = async (
  params: ChangeListItemRatingParams,
) => {
  const { listItemId, rating } = params

  const { error, data } = await supabase
    .from('list_items')
    .update({ rating })
    .eq('id', listItemId)

  if (error) throw new Error(error.message)
  return data
}
