import { supabase } from '@/services/supabase'
import { Profile } from '@/types/supabase'

export const getProfilesById = async (id: string[]) => {
  const { data: users } = await supabase
    .from('profiles')
    .select()
    .in('id', id)
    .returns<Profile[]>()

  return users
}
