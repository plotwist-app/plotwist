import { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { tmdb } from '@/services/tmdb2'
import { MoviesListType } from '@/services/tmdb2/requests'
import { MovieCard } from './movie-card'

type MoviesListProps = {
  list: MoviesListType
  language: Language
}

export const MoviesList = async ({ list, language }: MoviesListProps) => {
  const { results } = await tmdb.movies.lists(list, language)

  const dictionary = await getDictionary(language)

  const title: Record<MoviesListType, string> = {
    now_playing: dictionary.movies_list.now_playing,
    popular: dictionary.movies_list.popular,
    top_rated: dictionary.movies_list.top_rated,
    upcoming: dictionary.movies_list.upcoming,
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <h2 className="text-lg font-bold md:text-2xl">{title[list]}</h2>
        </div>

        <span className="cursor-pointer text-xs  text-muted-foreground underline">
          {dictionary.movies_list.show_all}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {results.slice(0, 6).map((movie) => (
          <MovieCard movie={movie} key={movie.id} language={language} />
        ))}
      </div>
    </section>
  )
}
