import { supabase } from '@/services/supabase'

type ChangeProfileUsernameValues = {
  id: string
  newUsername: string
}

export const updateProfileUsername = async ({
  id,
  newUsername,
}: ChangeProfileUsernameValues) => {
  const { data } = await supabase
    .from('profiles')
    .update({ username: newUsername })
    .eq('id', id)

  return data
}
