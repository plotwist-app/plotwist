import { supabase } from '@/services/supabase'

interface GetLikeByUser {
  id: string
  entityType: 'REPLY' | 'REVIEW'
  userId?: string
}

export const getLikeByUserService = async ({
  id,
  entityType,
  userId,
}: GetLikeByUser) => {
  const idType = entityType === 'REVIEW' ? 'review_id' : 'review_reply_id'

  const response = await supabase
    .from('likes')
    .select('user_id')
    .eq('entity_type', entityType)
    .eq(idType, id)
    .eq('user_id', userId)

  if (response.error) throw new Error(response.error.message)

  return response
}
