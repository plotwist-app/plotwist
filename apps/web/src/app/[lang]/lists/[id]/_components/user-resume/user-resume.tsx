import { useQuery } from '@tanstack/react-query'

import { Avatar, AvatarFallback, Skeleton } from '@plotwist/ui'

import { useLanguage } from '@/context/language'
import { supabase } from '@/services/supabase'

type UserResumeProps = {
  userId: string
}

export const UserResume = ({ userId }: UserResumeProps) => {
  const {
    dictionary: {
      user_resume: { by },
    },
  } = useLanguage()

  const { data: response, isLoading } = useQuery({
    queryKey: [userId],
    queryFn: async () =>
      await supabase.from('user_by_id').select('*').eq('id', userId).single<{
        username: string
        id: string
      }>(),
  })

  if (isLoading || !response) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {by}
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="h-[2ex] w-[11ch]" />
      </div>
    )
  }

  const username = response.data?.username

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {by}

      <Avatar className="h-7 w-7">
        <AvatarFallback className="uppercase">
          {username && username[0]}
        </AvatarFallback>
      </Avatar>
      <span>{username}</span>
    </div>
  )
}
