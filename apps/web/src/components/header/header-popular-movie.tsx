'use client'

import { useQuery } from '@tanstack/react-query'
import { Link } from 'next-view-transitions'
import Image from 'next/image'

import { tmdbImage } from '@/utils/tmdb/image'

import { tmdb } from '@/services/tmdb'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

import { useLanguage } from '@/context/language'
import { useUserPreferences } from '@/context/user-preferences'
import type { Language } from '@/types/languages'

type HeaderPopularMovieProps = {
  language: Language
}

export const HeaderPopularMovie = ({ language }: HeaderPopularMovieProps) => {
  const { userPreferences, formatWatchProvidersIds } = useUserPreferences()
  const { dictionary } = useLanguage()

  const { data, isLoading } = useQuery({
    queryKey: ['popular-movie', language, userPreferences],
    queryFn: async () =>
      await tmdb.movies.discover({
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

  const movie = data.results[0]

  if (!movie)
    return (
      <div className="w-1/3 border-dashed aspect-poster border rounded-sm flex items-center justify-center text-muted-foreground text-sm">
        <p>{dictionary.no_results}</p>
      </div>
    )

  return (
    <Link
      className="relative aspect-[2/3] w-1/3 overflow-hidden rounded-md border shadow"
      href={`/${language}/movies/${movie.id}`}
    >
      <Image src={tmdbImage(movie.poster_path)} alt={movie.title} fill />
    </Link>
  )
}
