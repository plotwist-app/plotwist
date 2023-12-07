import { MovieCard } from '@/components/movie-card'
import { TMDB } from '@/services/TMDB'

type MovieRelatedProps = {
  movieId: number
  variant: 'recommendations' | 'similar'
}

export const MovieRelated = async ({ movieId, variant }: MovieRelatedProps) => {
  const { results } = await TMDB.movies[variant](movieId)

  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-8">
      {results.map((movie) => (
        <MovieCard movie={movie} key={movie.id} />
      ))}
    </div>
  )
}
