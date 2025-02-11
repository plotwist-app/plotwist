'use client'

import { getUserItems, useGetUserItemsInfinite } from '@/api/user-items'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { tmdbImage } from '@/utils/tmdb/image'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { v4 } from 'uuid'
import { useLayoutContext } from '../_context'
import type { UserItemsProps } from './user-items'
import { UserItemsCommand } from './user-items-command'

export function UserItemsList({ filters }: UserItemsProps) {
  const { language } = useLanguage()
  const { userId } = useLayoutContext()
  const session = useSession()
  const { ref, inView } = useInView({
    threshold: 0.1,
  })

  const isOwner = session.user?.id === userId

  const params = {
    language,
    status: filters.status,
    userId,
    mediaType: filters.mediaType,
    orderBy: filters.orderBy,
    rating: filters.rating.map(r => r.toString()),
  }

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useGetUserItemsInfinite(params, {
      query: {
        initialPageParam: undefined,
        getNextPageParam: lastPage => lastPage.nextCursor,
        queryFn: async ({ pageParam }) => {
          return await getUserItems({
            ...params,
            pageSize: '20',
            cursor: pageParam as string,
          })
        },
      },
    })

  const flatData = data?.pages.flatMap(page => page.userItems) || []

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <>
      {isOwner && <UserItemsCommand filters={filters} userId={userId} />}

      {flatData?.map(({ id, posterPath, title, tmdbId, mediaType }) => (
        <Link
          className="border overflow-hidden border-dashed aspect-poster rounded-sm relative"
          key={id}
          href={`/${language}/${mediaType === 'MOVIE' ? 'movies' : 'tv-series'}/${tmdbId}`}
        >
          {posterPath && (
            <Image
              fill
              className="z-10 object-fill"
              src={tmdbImage(posterPath, 'w500')}
              alt={title}
              sizes="100%"
            />
          )}
        </Link>
      ))}

      {(isFetchingNextPage || isLoading) &&
        Array.from({ length: 5 }).map(_ => (
          <Skeleton key={v4()} className="aspect-poster" />
        ))}

      {hasNextPage && !(isFetchingNextPage || isLoading) && (
        <div ref={ref}>
          <Skeleton key={v4()} />
        </div>
      )}
    </>
  )
}
