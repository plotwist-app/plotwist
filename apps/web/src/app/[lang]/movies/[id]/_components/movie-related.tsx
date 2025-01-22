import { type MovieRelatedType, tmdb } from '@/services/tmdb'
import { Link } from 'next-view-transitions'

import { PosterCard } from '@/components/poster-card'
import type { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'

type MovieRelatedProps = {
  movieId: number
  variant: MovieRelatedType
  language: Language
}

export const MovieRelated = async ({
  movieId,
  variant,
  language,
}: MovieRelatedProps) => {
  const { results } = await tmdb.movies.related(movieId, variant, language)

  return (
    <div className="grid w-full grid-cols-3 gap-4 md:grid-cols-5">
      {results.map(movie => (
        <Link href={`/${language}/movies/${movie.id}`} key={movie.id}>
          <PosterCard.Root>
            <PosterCard.Image
              src={tmdbImage(movie.poster_path, 'w500')}
              alt={movie.title}
            />
          </PosterCard.Root>
        </Link>
      ))}
    </div>
  )
}
