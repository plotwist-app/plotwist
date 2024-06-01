import { supabase } from '@/services/supabase'
import { MediaType } from '@/types/supabase/media-type'

type CreateRecommendationParams = {
  receiverUsersIds: string[]
  senderUserId: string
  tmdbId: number
  mediaType: MediaType
}

export const createRecommendation = async ({
  receiverUsersIds,
  senderUserId,
  tmdbId,
  mediaType,
}: CreateRecommendationParams) => {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const { data, error } = await supabase.from('recommendations').insert(
    receiverUsersIds.map((id) => ({
      receiver_user_id: id,
      sender_user_id: senderUserId,
      tmdb_id: tmdbId,
      media_type: mediaType,
    })),
  )

  if (error) throw new Error(error.message)
  return data
}
