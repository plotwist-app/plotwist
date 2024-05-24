import { supabase } from '@/services/supabase'

export const getFollowersAndFollowing = async (id: string) => {
  const { data: followersData, error: followersError } = await supabase
    .from('followers')
    .select()
    .eq('followed_id', id)
    .returns<
      Array<{
        id: string
        created_at: string
        followed_id: string
        follower_id: string
      }>
    >()

  if (followersError) throw new Error(followersError.message)

  const { data: followingData, error: followingError } = await supabase
    .from('followers')
    .select()
    .eq('follower_id', id)
    .returns<
      Array<{
        id: string
        created_at: string
        followed_id: string
        follower_id: string
      }>
    >()

  if (followingError) throw new Error(followingError.message)

  return {
    followers: followersData,
    following: followingData,
  }
}
