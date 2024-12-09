'use client'

import { getFollowers, useGetFollowersInfinite } from '@/api/follow'
import { ProBadge } from '@/components/pro-badge'
import { useLanguage } from '@/context/language'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from '@plotwist/ui/components/ui/drawer'
import { ScrollArea } from '@plotwist/ui/components/ui/scroll-area'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { useMediaQuery } from '@uidotdev/usehooks'
import Link from 'next/link'
import { useMemo, type PropsWithChildren } from 'react'
import { useInView } from 'react-intersection-observer'
import { v4 } from 'uuid'

type UserFollowsProps = {
  variant: 'following' | 'followers'
  count: number
  userId: string
} & PropsWithChildren

export function UserFollows({
  variant,
  count,
  userId,
  children,
}: UserFollowsProps) {
  const { dictionary, language } = useLanguage()
  const { ref, inView } = useInView({
    threshold: 0.1,
  })
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetFollowersInfinite(
      {
        followerId: variant === 'following' ? userId : undefined,
        followedId: variant === 'followers' ? userId : undefined,
      },
      {
        query: {
          initialPageParam: undefined,
          getNextPageParam: lastPage => lastPage.nextCursor,
          queryFn: async ({ pageParam }) => {
            return await getFollowers({
              followerId: variant === 'following' ? userId : undefined,
              followedId: variant === 'followers' ? userId : undefined,
              pageSize: '10',
              cursor: pageParam as string,
            })
          },
          enabled: count > 0,
        },
      }
    )

  const flatData = data?.pages.flatMap(page => page.followers)

  useMemo(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const content = (
    <ScrollArea className="h-[500px] px-4">
      <div className="space-y-4 py-4">
        {flatData?.map(({ username, avatarUrl, subscriptionType }) => (
          <div key={username} className="flex items-center">
            <Link
              href={`/${language}/${username}`}
              className="flex items-center gap-1 hover:underline"
            >
              <Avatar className="size-10 border text-[10px]">
                {avatarUrl && (
                  <AvatarImage src={avatarUrl} className="object-cover" />
                )}

                <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
              </Avatar>

              <span className="ml-2 mr-2 truncate text-sm">{username}</span>
            </Link>

            {subscriptionType === 'PRO' && <ProBadge />}

            <Link
              href={`/${language}/${username}`}
              className="ml-auto whitespace-nowrap pl-8 text-xs text-muted-foreground hover:underline"
            >
              {dictionary.review_likes.view_profile}
            </Link>
          </div>
        ))}

        {(isFetchingNextPage || isLoading) &&
          Array.from({ length: 10 }).map(_ => (
            <div key={v4()} className="flex items-center">
              <div className="flex items-center gap-1">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="w-[10ch] h-[2ex] ml-2 mr-2 " />
              </div>

              <Skeleton className="w-[5ch] h-[2ex] ml-auto" />
            </div>
          ))}

        {hasNextPage && !(isFetchingNextPage || isLoading) && (
          <div className="flex items-center" ref={ref}>
            <div className="flex items-center gap-1">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="w-[10ch] h-[2ex] ml-2 mr-2 " />
            </div>

            <Skeleton className="w-[5ch] h-[2ex] ml-auto" />
          </div>
        )}
      </div>
    </ScrollArea>
  )

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="p-0 gap-0">
          <DialogHeader className="p-4 border-b border-dashed">
            <DialogTitle>
              {variant === 'following'
                ? dictionary.following
                : dictionary.followers}
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer>
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent className="gap-0 p-0">
        <DrawerHeader className="p-4 border-b border-dashed">
          <DialogTitle>
            {variant === 'following'
              ? dictionary.following
              : dictionary.followers}
          </DialogTitle>
        </DrawerHeader>

        {content}
      </DrawerContent>
    </Drawer>
  )
}
