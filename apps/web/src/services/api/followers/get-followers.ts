import { supabase } from '@/services/supabase'

export const getFollowers = async (id: string) => {
  const { data, error } = await supabase
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

  if (error) throw new Error(error.message)
  return data
}
