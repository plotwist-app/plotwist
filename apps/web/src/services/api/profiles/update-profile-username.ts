import { supabase } from '@/services/supabase'

type ChangeProfileUsernameValues = {
  userId: string
  newUsername: string
}

export const updateProfileUsername = async ({
  userId,
  newUsername,
}: ChangeProfileUsernameValues) => {
  const { error } = await supabase.rpc('update_username', {
    user_id: userId,
    new_username: newUsername,
  })

  return { error }
}
