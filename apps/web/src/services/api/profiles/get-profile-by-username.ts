import { supabase } from '@/services/supabase'
import { Profile } from '@/types/supabase'

export const getProfileByUsername = async (username: string) => {
  const { data: user } = await supabase
    .from('profiles')
    .select()
    .eq('username', username)
    .single<Profile>()

  return user
}
