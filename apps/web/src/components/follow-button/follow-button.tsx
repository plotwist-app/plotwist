'use client'

import { Button } from '@plotwist/ui/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Link } from 'next-view-transitions'
import {
  getGetFollowersQueryKey,
  useDeleteFollow,
  useGetFollow,
  usePostFollow,
} from '@/api/follow'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'

type FollowButtonProps = { userId: string }

export const FollowButton = ({ userId }: FollowButtonProps) => {
  const { user } = useSession()
  const { dictionary, language } = useLanguage()
  const { refresh } = useRouter()
  const queryClient = useQueryClient()

  const isOwner = user?.id === userId

  const createFollow = usePostFollow()
  const getFollow = useGetFollow({ userId }, { query: { enabled: !isOwner } })
  const deleteFollow = useDeleteFollow()

  const getMode = () => {
    if (!user) return 'REDIRECT'
    if (isOwner || getFollow.isLoading) return 'HIDDEN'
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
                await Promise.all(
                  [getGetFollowersQueryKey(), getFollow.queryKey].map(
                    async queryKey =>
                      await queryClient.invalidateQueries({
                        queryKey,
                      })
                  )
                )

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
                await Promise.all(
                  [getGetFollowersQueryKey(), getFollow.queryKey].map(
                    async queryKey =>
                      await queryClient.invalidateQueries({
                        queryKey,
                      })
                  )
                )

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
