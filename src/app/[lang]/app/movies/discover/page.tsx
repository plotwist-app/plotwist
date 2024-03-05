import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { MoviesListFilters } from '@/components/movies-list-filters'
import { MovieList } from '@/components/movie-list'

const DiscoverMoviesPage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">
            {dictionary.movie_pages.discover.title}
          </h1>

          <p className="text-muted-foreground">
            {dictionary.movie_pages.discover.description}
          </p>
        </div>

        <MoviesListFilters />
      </div>

      <MovieList variant="discover" language={lang} />
    </div>
  )
}

export default DiscoverMoviesPage
