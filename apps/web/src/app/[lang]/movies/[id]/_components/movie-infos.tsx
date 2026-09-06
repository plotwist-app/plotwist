import { format } from 'date-fns'
import { Poster } from '@/components/poster'
import type { Language, MovieDetails } from '@/services/tmdb'
import { locale } from '@/utils/date/locale'
import { MovieActions } from './movie-actions'
import { MovieGenres } from './movie-genres'
import { MovieRating } from './movie-rating'

type MovieInfosProps = { movie: MovieDetails; language: Language }

export const MovieInfos = ({ language, movie }: MovieInfosProps) => {
  const actions = <MovieActions movie={movie} language={language} />

  const votes = <MovieRating movie={movie} />

  return (
    <main className="space-y-4 p-4 lg:p-0">
      <div className="flex flex-row items-end gap-4 md:items-start">
        <aside className="-mt-20 lg:-mt-32 w-2/5 space-y-2 md:w-1/3">
          <Poster url={movie.poster_path} alt={movie.title} />
        </aside>

        <article className="flex w-3/5 flex-col gap-2 md:w-2/3">
          {movie.release_date && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(movie.release_date), 'PPP', {
                locale: locale[language],
              })}
            </span>
          )}

          <h1 className="text-lg font-bold md:text-4xl">{movie.title}</h1>

          <div className="hidden flex-wrap items-center gap-2 whitespace-nowrap md:flex">
            <MovieGenres genres={movie.genres} />
            {votes}
          </div>

          <p className="hidden text-xs leading-5 text-muted-foreground md:block md:text-sm md:leading-6">
            {movie.overview}
          </p>

          <div className="hidden md:block">{actions}</div>
        </article>
      </div>

      <div className="space-y-2 md:hidden">
        {actions}
        <p className="text-sm/7 text-muted-foreground">{movie.overview}</p>

        <div className="flex gap-2 flex-wrap">
          <MovieGenres genres={movie.genres} />
          {votes}
        </div>
      </div>
    </main>
  )
}
