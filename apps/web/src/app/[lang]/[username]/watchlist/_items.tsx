'use client'

import { useGetUserItems } from '@/api/user-items'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import { WatchListCommand } from './_command'
import { useLanguage } from '@/context/language'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

export function Items() {
  const { language } = useLanguage()
  const { data, isLoading } = useGetUserItems({ language, status: 'WATCHLIST' })

  if (isLoading || !data) {
    return (
      <>
        {Array.from({ length: 20 }).map((_, index) => (
          <Skeleton key={index} className="aspect-poster" />
        ))}
      </>
    )
  }

  return (
    <>
      <WatchListCommand items={data} />

      {data?.map(({ id, posterPath, title }) => (
        <div
          className="border overflow-hidden border-dashed aspect-poster rounded-sm relative"
          key={id}
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
        </div>
      ))}
    </>
  )
}
