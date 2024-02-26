import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const getUserService = async () => {
  const supabase = createServerComponentClient({ cookies })
  const user = await supabase.auth.getUser()

  return user
}
