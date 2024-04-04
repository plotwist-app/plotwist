import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getProfile } from '../profiles/get-profile'

export const getUserService = async () => {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.id) {
    const profile = getProfile(user.id)

    return profile
  }

  return null
}
