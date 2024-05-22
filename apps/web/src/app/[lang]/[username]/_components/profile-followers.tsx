'use client'

import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getFollowersAndFollowing } from '@/services/api/followers/get-followers-and-following'
import { useQuery } from '@tanstack/react-query'

type ProfileFollowersProps = { id: string }

export const ProfileFollowers = ({ id }: ProfileFollowersProps) => {
  const { data, isLoading } = useQuery({
    queryFn: async () => await getFollowersAndFollowing(id),
    queryKey: ['followers-and-following', id],
  })

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex gap-1">
        {isLoading ? (
          <Skeleton className="aspect-square w-[2ch]" />
        ) : (
          <span className="font-medium text-foreground">
            {data?.followers.length}
          </span>
        )}

        <p>Followers</p>
      </div>

      <Separator orientation="vertical" className="h-4" />

      <div className="flex gap-1">
        {isLoading ? (
          <Skeleton className="aspect-square w-[2ch]" />
        ) : (
          <span className="font-medium text-foreground">
            {data?.following.length}
          </span>
        )}

        <p>Following</p>
      </div>
    </div>
  )
}
