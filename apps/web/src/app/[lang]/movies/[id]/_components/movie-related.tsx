import { MovieCard } from '@/components/movie-card'
import { tmdb, MovieRelatedType } from '@plotwist/tmdb'
import { Language } from '@/types/languages'

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
    <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
      {results.map((movie) => (
        <MovieCard movie={movie} key={movie.id} language={language} />
      ))}
    </div>
  )
}
