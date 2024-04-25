import { supabase } from '@/services/supabase'

type ChangeProfileUsernameValues = {
  id: string
  newUsername: string
}

export const updateProfileUsername = async ({
  id,
  newUsername,
}: ChangeProfileUsernameValues) => {
  const { error } = await supabase.rpc('update_username', {
    user_id: id,
    new_username: newUsername,
  })

  return { error }
}
