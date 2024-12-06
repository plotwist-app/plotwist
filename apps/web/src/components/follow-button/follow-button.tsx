'use client'

import { useDeleteFollow, useGetFollow, usePostFollow } from '@/api/follow'
import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { Button } from '@plotwist/ui/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type FollowButtonProps = { userId: string }

export const FollowButton = ({ userId }: FollowButtonProps) => {
  const { user } = useSession()
  const { dictionary, language } = useLanguage()
  const { refresh } = useRouter()

  const isOwner = user?.id === userId

  const createFollow = usePostFollow()
  const getFollow = useGetFollow({ userId }, { query: { enabled: !isOwner } })
  const deleteFollow = useDeleteFollow()

  const getMode = () => {
    if (!user) return 'REDIRECT'
    if (isOwner) return 'HIDDEN'
    if (getFollow.data?.follow) return 'FOLLOWER'
    if (user?.id !== userId) return 'MEMBER'

    return 'HIDDEN'
  }

  const component = {
    HIDDEN: null,
    REDIRECT: (
      <Button asChild>
        <Link href={`/${language}/sign-in`}>{dictionary.follow}</Link>
      </Button>
    ),
    MEMBER: (
      <Button
        variant="outline"
        disabled={createFollow.isPending}
        onClick={() =>
          createFollow.mutateAsync(
            { data: { userId } },
            {
              onSuccess: async () => {
                await APP_QUERY_CLIENT.invalidateQueries({
                  queryKey: getFollow.queryKey,
                })

                refresh()
              },
            }
          )
        }
        size="sm"
      >
        {dictionary.follow}
      </Button>
    ),
    FOLLOWER: (
      <Button
        disabled={deleteFollow.isPending}
        onClick={() =>
          deleteFollow.mutateAsync(
            { data: { userId } },
            {
              onSuccess: async () => {
                await APP_QUERY_CLIENT.invalidateQueries({
                  queryKey: getFollow.queryKey,
                })

                refresh()
              },
            }
          )
        }
        size="sm"
      >
        {dictionary.unfollow}
      </Button>
    ),
  }

  return component[getMode()]
}
