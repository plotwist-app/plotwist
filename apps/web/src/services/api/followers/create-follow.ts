import { supabase } from '@/services/supabase'

type CreateFollowParams = { followerId: string; followedId: string }
export const createFollow = async (params: CreateFollowParams) => {
  const { followerId, followedId } = params

  const { error, data } = await supabase.from('followers').insert({
    follower_id: followerId,
    followed_id: followedId,
  })

  if (error) throw new Error(error.message)
  return data
}
