import { FollowButton } from '@/components/follow-button'
import { Followers } from '@/components/followers'
import { ProBadge } from '@/components/pro-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useLanguage } from '@/context/language'
import { useListMode } from '@/context/list-mode'
import { supabase } from '@/services/supabase'
import { Profile } from '@/types/supabase'
import { tmdbImage } from '@/utils/tmdb/image'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ListRecommendations } from '../list-recommendations'
import { List } from '@/types/supabase/lists'

type UserResumeProps = {
  list: List
}

export const UserResume = ({ list }: UserResumeProps) => {
  const { language } = useLanguage()
  const { mode } = useListMode()

  const { data: profile, isLoading } = useQuery({
    queryKey: [list.user_id],
    queryFn: async () =>
      await supabase
        .from('profiles')
        .select('*')
        .eq('id', list.user_id)
        .single<Profile>(),
    select: (response) => response.data,
  })

  if (isLoading || !profile) {
    return <UserResumeSkeleton />
  }

  const username = profile.username
  const profileHref = `/${language}/${username}`

  return (
    <div className="sticky top-4 flex w-full flex-col gap-2 rounded-lg border">
      <div className="space-y-2 p-6">
        <div className="flex justify-between">
          <Link href={profileHref} className="">
            <Avatar className="h-16 w-16">
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

          <FollowButton profileId={profile.id} />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link className="text-lg font-semibold" href={profileHref}>
              {username}
            </Link>

            {profile.subscription_type === 'PRO' && <ProBadge />}
          </div>

          <Followers profileId={profile.id} />
        </div>
      </div>

      {mode === 'EDIT' && <ListRecommendations list={list} />}
    </div>
  )
}

export const UserResumeSkeleton = () => {
  const { dictionary } = useLanguage()

  return (
    <div className="flex w-full flex-col gap-4 rounded-lg border p-6">
      <div className="flex justify-between">
        <Skeleton className="h-16 w-16 rounded-full" />

        <Button size="sm" disabled>
          {dictionary.follow}
        </Button>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-[3ex] w-[15ch]" />

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Skeleton className="h-[2ex] w-[2ch]" /> {dictionary.followers}
          </span>

          <Separator className="h-4" orientation="vertical" />

          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Skeleton className="h-[2ex] w-[2ch]" /> {dictionary.following}
          </span>
        </div>
      </div>
    </div>
  )
}
