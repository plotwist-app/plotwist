import { supabase } from '@/services/supabase'
import { MediaType } from '@/types/supabase/media-type'

type CreateRecommendationParams = {
  receiverUsersIds: string[]
  senderUserId: string
  tmdbId: number
  mediaType: MediaType
  message: string | null
}

export const createRecommendation = async ({
  receiverUsersIds,
  senderUserId,
  tmdbId,
  mediaType,
  message,
}: CreateRecommendationParams) => {
  const { data, error } = await supabase.from('recommendations').insert(
    receiverUsersIds.map((id) => ({
      receiver_user_id: id,
      sender_user_id: senderUserId,
      tmdb_id: tmdbId,
      media_type: mediaType,
      message,
    })),
  )

  if (error) throw new Error(error.message)
  return data
}
