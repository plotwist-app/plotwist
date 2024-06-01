import { supabase } from '@/services/supabase'
import { Profile } from '@/types/supabase'

export const getFollowingProfiles = async (userId: string) => {
  const query = supabase
    .from('followers')
    .select('profile:profiles!followers_followed_id_fkey(*)')
    .eq('follower_id', userId)

  const { data, error } = await query.returns<Array<{ profile: Profile }>>()
  if (error) throw new Error(error.message)

  const profiles = Object.values(data.map((follow) => follow.profile))

  return profiles
}
