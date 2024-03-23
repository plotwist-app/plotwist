'use client'

import { useLanguage } from '@/context/language'
import { CounterSection } from '../count-section'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'

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
      <CounterSection
        label={statistics.users.label}
        value={0}
        divider={false}
        loading
      />
    )
  }

  const { user_count: userCount } = data.data

  return (
    <CounterSection
      label={statistics.users.label}
      value={userCount ?? 0}
      divider={false}
    />
  )
}
