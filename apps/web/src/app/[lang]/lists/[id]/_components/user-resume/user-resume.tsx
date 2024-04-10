import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useLanguage } from '@/context/language'
import { supabase } from '@/services/supabase'
import { Profile } from '@/types/supabase'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

type UserResumeProps = {
  userId: string
}

export const UserResume = ({ userId }: UserResumeProps) => {
  const {
    dictionary: {
      user_resume: { by },
    },
    language,
  } = useLanguage()

  const { data: response, isLoading } = useQuery({
    queryKey: [userId],
    queryFn: async () =>
      await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single<Profile>(),
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
  const profileHref = `/${language}/${username}`

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {by}

      <Link href={profileHref}>
        <Avatar className="h-7 w-7">
          <AvatarFallback className="uppercase">
            {username && username[0]}
          </AvatarFallback>
        </Avatar>
      </Link>

      <Link href={profileHref}>{username}</Link>
    </div>
  )
}
