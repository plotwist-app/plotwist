import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getProfileById } from '../profiles'

export const getUserService = async () => {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.id) {
    return null
  }
  const profile = getProfileById(user.id)

  return profile
}
