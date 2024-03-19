'use client'

import { tmdb } from '@/services/tmdb'
import { Language } from '@/types/languages'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Badge } from '../ui/badge'
import { TvSerieCard } from '../tv-serie-card'
import { Movie, TvSerie } from '@/services/tmdb/types'
import { MovieCard } from '../movie-card'

type AnimeListProps = { language: Language }

export const AnimeList = ({ language }: AnimeListProps) => {
  const [mode, setMode] = useState<'TV_SERIES' | 'MOVIES'>('TV_SERIES')

  const { isLoading, data } = useQuery({
    queryKey: ['animes', mode],
    queryFn: async () => {
      if (mode === 'TV_SERIES') {
        return await tmdb.tvSeries.discover({
          language,
          page: 1,
          filters: { with_keywords: '210024', sort_by: 'vote_count.desc' },
        })
      }

      return await tmdb.movies.discover({
        language,
        page: 1,
        filters: { with_keywords: '210024', sort_by: 'vote_count.desc' },
      })
    },
  })

  if (isLoading || !data) return <p>carregando</p>

  console.log({ data })

  return (
    <div>
      <div className="flex gap-2">
        <Badge
          onClick={() => setMode('TV_SERIES')}
          className="cursor-pointer"
          variant={mode === 'TV_SERIES' ? 'default' : 'outline'}
        >
          Animes
        </Badge>
        <Badge
          onClick={() => setMode('MOVIES')}
          className="cursor-pointer"
          variant={mode === 'MOVIES' ? 'default' : 'outline'}
        >
          Movies
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {data.results.map((item) => {
          if (mode === 'TV_SERIES') {
            return <TvSerieCard tvSerie={item as TvSerie} key={item.id} />
          }

          return <MovieCard movie={item as Movie} key={item.id} />
        })}
      </div>
    </div>
  )
}
