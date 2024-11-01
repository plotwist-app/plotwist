'use client'

import { Button } from '@plotwist/ui/components/ui/button'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { useLanguage } from '@/context/language'
import { useFollowers } from '@/hooks/use-followers'
import { getFollowers } from '@/services/api/followers/get-followers'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/context/session'

type FollowButtonProps = { profileId: string }
export const FollowButton = ({ profileId }: FollowButtonProps) => {
  const { user } = useSession()
  const { dictionary } = useLanguage()
  const { handleFollow, handleRemoveFollow } = useFollowers()

  const { data: followers, isLoading } = useQuery({
    queryKey: ['followers', profileId],
    queryFn: async () => await getFollowers(profileId),
  })

  const userFollow = followers?.find((f) => f.follower_id === user?.id)

  const getMode = () => {
    if (!user) return 'UNAUTHENTICATED'
    if (isLoading) return 'DISABLED'
    if (user.id === profileId) return 'OWNER'
    if (userFollow) return 'FOLLOWER'
    if (user.id !== profileId) return 'MEMBER'

    return 'DISABLED'
  }

  const component = {
    OWNER: null,
    UNAUTHENTICATED: null,
    MEMBER: (
      <Button
        variant="outline"
        onClick={() => {
          handleFollow.mutate({ followedId: profileId, followerId: user!.id })
        }}
        disabled={handleFollow.isPending}
        size="sm"
      >
        {dictionary.follow}
      </Button>
    ),
    FOLLOWER: (
      <Button
        onClick={() => handleRemoveFollow.mutate(userFollow!.id)}
        disabled={handleRemoveFollow.isPending}
        size="sm"
      >
        {dictionary.unfollow}
      </Button>
    ),
    DISABLED: <Skeleton className="h-9 w-16" />,
  }

  return component[getMode()]
}
