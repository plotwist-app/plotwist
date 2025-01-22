'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Link } from 'next-view-transitions'

import { tmdb } from '@/services/tmdb'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

import { tmdbImage } from '@/utils/tmdb/image'

import type { Language } from '@/types/languages'
import { useUserPreferences } from '@/context/user-preferences'
import { useLanguage } from '@/context/language'
type HeaderPopularTvSerieProps = {
  language: Language
}

export const HeaderPopularTvSerie = ({
  language,
}: HeaderPopularTvSerieProps) => {
  const { userPreferences, formatWatchProvidersIds } = useUserPreferences()
  const { dictionary } = useLanguage()

  const { data, isLoading } = useQuery({
    queryKey: ['popular-tv', language, userPreferences],
    queryFn: async () =>
      await tmdb.tv.discover({
        language,
        page: 1,
        filters: {
          with_watch_providers: formatWatchProvidersIds(
            userPreferences?.watchProvidersIds ?? []
          ),
          watch_region: userPreferences?.watchRegion,
          sort_by: 'popularity.desc',
        },
      }),
  })

  if (!data || isLoading)
    return (
      <Skeleton className="aspect-[2/3] w-1/3 overflow-hidden rounded-md border shadow" />
    )

  const tvSerie = data.results[0]

  if (!tvSerie)
    return (
      <div className="w-1/3 border-dashed aspect-poster border rounded-sm flex items-center justify-center text-muted-foreground text-sm">
        <p>{dictionary.no_results}</p>
      </div>
    )

  return (
    <Link
      className="relative aspect-[2/3] w-1/3 overflow-hidden rounded-md border shadow"
      href={`/${language}/tv-series/${tvSerie.id}`}
    >
      <Image src={tmdbImage(tvSerie.poster_path)} alt={tvSerie.name} fill />
    </Link>
  )
}
