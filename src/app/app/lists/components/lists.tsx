'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import { useCallback, useEffect, useState } from 'react'
import { ListsContent } from './lists-content'

export const Lists = () => {
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  const getUserId = useCallback(async () => {
    const user = await supabase.auth.getUser()

    if (user?.data.user?.id) {
      setUserId(user.data.user.id)
    }
  }, [supabase.auth])

  useEffect(() => {
    getUserId()
  }, [getUserId])

  return (
    <div className="grid-cols:1 grid gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
      {userId && <ListsContent userId={userId} />}
    </div>
  )
}
