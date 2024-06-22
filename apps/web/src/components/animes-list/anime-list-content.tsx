'use client'

import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Movie, TvSerie, tmdb } from '@plotwist/tmdb'

import { AnimeListType } from '.'
import { useLanguage } from '@/context/language'
import Link from 'next/link'
import { PosterCard } from '../poster-card'
import { tmdbImage } from '@/utils/tmdb/image'

type AnimeListContentProps = { type: AnimeListType }

export const AnimeListContent = ({ type }: AnimeListContentProps) => {
  const { language } = useLanguage()

  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['animes', type],
    queryFn: async ({ pageParam }) => {
      if (type === 'tv') {
        return await tmdb.tv.discover({
          language,
          page: pageParam,
          filters: { with_keywords: '210024', sort_by: 'vote_count.desc' },
        })
      }

      return await tmdb.movies.discover({
        language,
        page: pageParam,
        filters: { with_keywords: '210024', sort_by: 'vote_count.desc' },
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.page + 1,
  })

  useEffect(() => {
    if (inView) fetchNextPage()
  }, [fetchNextPage, inView])

  if (!data)
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        {Array.from({ length: 20 }).map((_, index) => (
          <PosterCard.Skeleton key={index} />
        ))}
      </div>
    )

  const flatData = data.pages.flatMap(
    (page) => page.results as unknown as TvSerie | Movie,
  )

  const isLastPage =
    data.pages[data.pages.length - 1].page >=
    data.pages[data.pages.length - 1].total_pages

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
      {flatData.map((item) => {
        if (type === 'tv') {
          const tv = item as TvSerie

          return (
            <Link href={`/${language}/tv-series/${tv.id}`} key={tv.id}>
              <PosterCard.Root>
                <PosterCard.Image
                  src={tmdbImage(tv.poster_path, 'w500')}
                  alt={tv.name}
                />

                <PosterCard.Details>
                  <PosterCard.Title>{tv.name}</PosterCard.Title>
                  <PosterCard.Year>
                    {tv.first_air_date.split('-')[0]}
                  </PosterCard.Year>
                </PosterCard.Details>
              </PosterCard.Root>
            </Link>
          )
        }

        const movie = item as Movie
        return (
          <Link href={`/${language}/movies/${movie.id}`} key={movie.id}>
            <PosterCard.Root>
              <PosterCard.Image
                src={tmdbImage(movie.poster_path, 'w500')}
                alt={movie.title}
              />

              <PosterCard.Details>
                <PosterCard.Title>{movie.title}</PosterCard.Title>
                <PosterCard.Year>
                  {movie.release_date.split('-')[0]}
                </PosterCard.Year>
              </PosterCard.Details>
            </PosterCard.Root>
          </Link>
        )
      })}

      {!isLastPage && (
        <>
          <PosterCard.Skeleton ref={ref} />
          <PosterCard.Skeleton />
          <PosterCard.Skeleton />
        </>
      )}
    </div>
  )
}
