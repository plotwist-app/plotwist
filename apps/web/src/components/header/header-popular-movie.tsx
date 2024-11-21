'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'

import { tmdbImage } from '@/utils/tmdb/image'

import { tmdb } from '@/services/tmdb'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

import type { Language } from '@/types/languages'

type HeaderPopularMovieProps = {
  language: Language
}

export const HeaderPopularMovie = ({ language }: HeaderPopularMovieProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['popular-movie', language],
    queryFn: async () =>
      await tmdb.movies.list({
        language,
        page: 1,
        list: 'popular',
      }),
  })

  if (!data || isLoading)
    return (
      <Skeleton className="aspect-[2/3] w-1/3 overflow-hidden rounded-md border shadow" />
    )

  const movie = data.results[0]

  return (
    <Link
      className="relative aspect-[2/3] w-1/3 overflow-hidden rounded-md border shadow"
      href={`/${language}/movies/${movie.id}`}
    >
      <Image src={tmdbImage(movie.poster_path)} alt={movie.title} fill />
    </Link>
  )
}
