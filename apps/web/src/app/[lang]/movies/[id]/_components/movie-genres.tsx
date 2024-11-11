'use client'

import { Badge } from '@plotwist/ui/components/ui/badge'
import { useLanguage } from '@/context/language'
import { MovieDetails } from '@/services/tmdb'
import Link from 'next/link'

type MovieGenresProps = { genres: MovieDetails['genres'] }

export const MovieGenres = ({ genres }: MovieGenresProps) => {
  const { language } = useLanguage()

  const hasGenres = genres.length > 0
  if (!hasGenres) return null

  return (
    <div className="flex flex-wrap gap-2">
      {genres.map(({ id, name }) => {
        return (
          <Link key={id} href={`/${language}/movies/discover?genres=${id}`}>
            <Badge variant="outline" className="whitespace-nowrap">
              {name}
            </Badge>
          </Link>
        )
      })}
    </div>
  )
}
