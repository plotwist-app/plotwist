'use client'

import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { Button } from '@plotwist/ui/components/ui/button'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

type FollowButtonProps = { userId: string }

export const FollowButton = ({ userId }: FollowButtonProps) => {
  const { user } = useSession()
  const { dictionary } = useLanguage()

  const userFollow = false
  const isLoading = false

  const getMode = () => {
    if (!user) return 'UNAUTHENTICATED'
    if (isLoading) return 'DISABLED'
    if (user.id === userId) return 'OWNER'
    if (userFollow) return 'FOLLOWER'
    if (user.id !== userId) return 'MEMBER'

    return 'DISABLED'
  }

  const component = {
    OWNER: null,
    UNAUTHENTICATED: null,
    MEMBER: (
      <Button
        variant="outline"
        onClick={() => console.log('FOLLOW')}
        disabled={true}
        size="sm"
      >
        {dictionary.follow}
      </Button>
    ),
    FOLLOWER: (
      <Button onClick={() => console.log('FOLLOW')} disabled={true} size="sm">
        {dictionary.unfollow}
      </Button>
    ),
    DISABLED: <Skeleton className="h-9 w-16" />,
  }

  return component[getMode()]
}
