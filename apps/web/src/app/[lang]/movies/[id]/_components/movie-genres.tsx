'use client'

import { Badge } from '@plotwist/ui/components/ui/badge'
import { Link } from 'next-view-transitions'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import type { MovieDetails } from '@/services/tmdb'

type MovieGenresProps = {
  genres: MovieDetails['genres']
  className?: string
}

export const MovieGenres = ({ genres, className }: MovieGenresProps) => {
  const { language } = useLanguage()

  const hasGenres = genres.length > 0
  if (!hasGenres) return null

  return (
    <>
      {genres.map(({ id, name }) => {
        return (
          <Link key={id} href={`/${language}/movies/discover?genres=${id}`}>
            <Badge
              variant="outline"
              className={cn('whitespace-nowrap', className)}
            >
              {name}
            </Badge>
          </Link>
        )
      })}
    </>
  )
}
