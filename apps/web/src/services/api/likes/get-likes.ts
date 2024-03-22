import { supabase } from '@/services/supabase'

interface GetLikeParams {
  id: string
  entityType: 'REPLY' | 'REVIEW'
}

export const getLikesService = async ({ id, entityType }: GetLikeParams) => {
  const idType = entityType === 'REVIEW' ? 'review_id' : 'review_reply_id'

  const response = await supabase
    .from('likes')
    .select('*', { count: 'exact' })
    .eq('entity_type', entityType)
    .eq(idType, id)

  if (response.error) throw new Error(response.error.message)

  return response
}
