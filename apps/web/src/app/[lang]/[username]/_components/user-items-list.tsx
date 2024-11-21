'use client'

import { useGetUserItems } from '@/api/user-items'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { tmdbImage } from '@/utils/tmdb/image'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import Image from 'next/image'
import Link from 'next/link'
import { useLayoutContext } from '../_context'
import type { UserItemsProps } from './user-items'
import { UserItemsCommand } from './user-items-command'
import { v4 } from 'uuid'

export function UserItemsList({ status }: UserItemsProps) {
  const { language } = useLanguage()
  const { userId } = useLayoutContext()
  const { data, isLoading } = useGetUserItems({ language, status, userId })
  const session = useSession()

  if (isLoading || !data) {
    return (
      <>
        {Array.from({ length: 20 }).map((_, index) => (
          <Skeleton key={v4()} className="aspect-poster" />
        ))}
      </>
    )
  }

  const isOwner = session.user?.id === userId

  return (
    <>
      {isOwner && (
        <UserItemsCommand items={data} status={status} userId={userId} />
      )}

      {data?.map(({ id, posterPath, title, tmdbId, mediaType }) => (
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
    </>
  )
}
