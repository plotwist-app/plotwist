'use client'

import { Badge } from '@plotwist/ui/components/ui/badge'
import { useLanguage } from '@/context/language'
import { TvSerieDetails } from '@/services/tmdb'
import Link from 'next/link'

type TvSerieGenresProps = { genres: TvSerieDetails['genres'] }

export const TvSeriesGenres = ({ genres }: TvSerieGenresProps) => {
  const { language } = useLanguage()

  const hasGenres = genres.length > 0
  if (!hasGenres) return null

  return (
    <div className="flex flex-wrap gap-2">
      {genres.map(({ id, name }) => {
        return (
          <Link key={id} href={`/${language}/tv-series/discover?genres=${id}`}>
            <Badge variant="outline" className="whitespace-nowrap">
              {name}
            </Badge>
          </Link>
        )
      })}
    </div>
  )
}
