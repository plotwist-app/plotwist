'use client'

import { useLanguage } from '@/context/language'
import type { TvSerieDetails } from '@/services/tmdb'
import { Badge } from '@plotwist/ui/components/ui/badge'
import Link from 'next/link'

type TvSerieGenresProps = { genres: TvSerieDetails['genres'] }

export const TvSeriesGenres = ({ genres }: TvSerieGenresProps) => {
  const { language } = useLanguage()

  const hasGenres = genres.length > 0
  if (!hasGenres) return null

  return (
    <>
      {genres.map(({ id, name }) => {
        return (
          <Link key={id} href={`/${language}/tv-series/discover?genres=${id}`}>
            <Badge variant="outline" className="whitespace-nowrap">
              {name}
            </Badge>
          </Link>
        )
      })}
    </>
  )
}
