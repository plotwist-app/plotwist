import { supabase } from '@/services/supabase'

type CreateFollowerParams = { followerId: string; followedId: string }
export const createFollower = async (params: CreateFollowerParams) => {
  const { followerId, followedId } = params

  const { error, data } = await supabase.from('followers').insert({
    follower_id: followerId,
    followed_id: followedId,
  })

  if (error) throw new Error(error.message)
  return data
}
