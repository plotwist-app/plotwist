import { TMDB } from '@/services/TMDB'
import { MovieCard } from './movie-card'

type Variant = 'popular' | 'nowPlaying' | 'topRated' | 'upcoming'

type MoviesListProps = {
  variant: Variant
}

export const MoviesList = async ({ variant }: MoviesListProps) => {
  const { results } = await TMDB.movies[variant]()

  const title: Record<Variant, string> = {
    nowPlaying: 'Now playing movies',
    popular: 'Popular movies',
    topRated: 'Top rated movies',
    upcoming: 'Up coming movies',
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <h2 className="text-lg font-bold md:text-2xl">{title[variant]}</h2>
        </div>

        <span className="cursor-pointer text-xs  text-muted-foreground underline">
          Show all
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {results.slice(0, 6).map((movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
      </div>
    </section>
  )
}
