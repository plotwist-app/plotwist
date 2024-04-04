import { supabase } from '@/services/supabase'
import { Profile } from '@/types/supabase'

export const getProfile = async (id: string) => {
  const { data: user } = await supabase
    .from('profiles')
    .select()
    .eq('id', id)
    .single<Profile>()

  return user
}
