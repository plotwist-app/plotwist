'use client'

import { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import { tmdb } from '@plotwist/tmdb'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { Skeleton } from '../ui/skeleton'

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
