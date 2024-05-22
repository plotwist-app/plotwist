'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/auth'
import { useLanguage } from '@/context/language'
import { useFollowers } from '@/hooks/use-followers'
import { getFollowers } from '@/services/api/followers/get-followers'
import { useQuery } from '@tanstack/react-query'

type ProfileFollowProps = { id: string }
export const ProfileFollow = ({ id }: ProfileFollowProps) => {
  const { user } = useAuth()
  const { dictionary } = useLanguage()
  const { handleFollow, handleRemoveFollow } = useFollowers()
  const { data: followers, isLoading } = useQuery({
    queryKey: ['followers'],
    queryFn: async () => await getFollowers(id),
  })

  const userFollow = followers?.find((f) => f.follower_id === user?.id)

  const getMode = () => {
    if (!user) return 'UNAUTHENTICATED'
    if (isLoading) return 'DISABLED'
    if (user.id === id) return 'OWNER'
    if (userFollow) return 'FOLLOWER'
    if (user.id !== id) return 'MEMBER'

    return 'DISABLED'
  }

  const component = {
    OWNER: null,
    UNAUTHENTICATED: null,
    MEMBER: (
      <Button
        variant="outline"
        onClick={() => {
          handleFollow.mutate({ followedId: id, followerId: user!.id })
        }}
        disabled={handleFollow.isPending}
      >
        {dictionary.follow}
      </Button>
    ),
    FOLLOWER: (
      <Button
        onClick={() => handleRemoveFollow.mutate(userFollow!.id)}
        disabled={handleRemoveFollow.isPending}
      >
        Unfollow
      </Button>
    ),
    DISABLED: <Skeleton className="h-9 w-16" />,
  }

  return component[getMode()]
}
