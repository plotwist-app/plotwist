'use client'

import { useLanguage } from '@/context/language'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { CountSection } from './count-section'

export const UserCount = () => {
  const {
    dictionary: {
      home: { statistics },
    },
  } = useLanguage()

  const { data } = useQuery({
    queryKey: ['user-count'],
    queryFn: async () =>
      await supabase
        .from('user_count')
        .select()
        .single<{ user_count: number }>(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  if (!data?.data) {
    return (
      <CountSection
        label={statistics.users.label}
        value={0}
        divider={false}
        loading
      />
    )
  }

  const { user_count: userCount } = data.data

  return (
    <CountSection
      label={statistics.users.label}
      value={userCount ?? 0}
      divider={false}
    />
  )
}
