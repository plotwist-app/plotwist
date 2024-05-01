import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useLanguage } from '@/context/language'
import { supabase } from '@/services/supabase'
import { Profile } from '@/types/supabase'
import { tmdbImage } from '@/utils/tmdb/image'
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

  const { data: profile, isLoading } = useQuery({
    queryKey: [userId],
    queryFn: async () =>
      await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single<Profile>(),
    select: (response) => response.data,
  })

  if (isLoading || !profile) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {by}
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="h-[2ex] w-[11ch]" />
      </div>
    )
  }

  const username = profile.username
  const profileHref = `/${language}/${username}`

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {by}

      <Link href={profileHref}>
        <Avatar className="h-7 w-7">
          {profile.image_path && (
            <AvatarImage
              src={tmdbImage(profile.image_path, 'w500')}
              className="object-cover"
            />
          )}

          <AvatarFallback className="uppercase">
            {username && username[0]}
          </AvatarFallback>
        </Avatar>
      </Link>

      <Link href={profileHref}>{username}</Link>
    </div>
  )
}
