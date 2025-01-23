'use client'

import { useLanguage } from '@/context/language'
import type { MovieDetails } from '@/services/tmdb'
import { Badge } from '@plotwist/ui/components/ui/badge'
import { Link } from 'next-view-transitions'

type MovieGenresProps = { genres: MovieDetails['genres'] }

export const MovieGenres = ({ genres }: MovieGenresProps) => {
  const { language } = useLanguage()

  const hasGenres = genres.length > 0
  if (!hasGenres) return null

  return (
    <>
      {genres.map(({ id, name }) => {
        return (
          <Link key={id} href={`/${language}/movies/discover?genres=${id}`}>
            <Badge variant="outline" className="whitespace-nowrap">
              {name}
            </Badge>
          </Link>
        )
      })}
    </>
  )
}
