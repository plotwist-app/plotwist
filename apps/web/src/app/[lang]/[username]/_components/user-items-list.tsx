'use client'

import { useGetUserItemsSuspense } from '@/api/user-items'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import Link from 'next/link'
import { useLayoutContext } from '../_context'
import type { UserItemsProps } from './user-items'
import { UserItemsCommand } from './user-items-command'

export function UserItemsList({ status }: UserItemsProps) {
  const { language } = useLanguage()
  const { userId } = useLayoutContext()
  const { data } = useGetUserItemsSuspense({
    language,
    status,
    userId,
  })
  const session = useSession()

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
