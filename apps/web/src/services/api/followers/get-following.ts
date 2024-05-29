import { supabase } from '@/services/supabase'
import { Profile } from '@/types/supabase'

export const getProfilesOrderedByFollowing = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .limit(50)
    .returns<Array<Profile>>()

  if (error) throw new Error(error.message)
  return data
}
