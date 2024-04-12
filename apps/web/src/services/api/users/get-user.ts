import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getProfileById } from '../profiles'

export const getUserService = async () => {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.id) {
    const profile = getProfileById(user.id)

    return profile
  }

  return null
}
