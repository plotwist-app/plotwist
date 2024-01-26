import { PageProps } from '@/types/languages'
import { MovieList } from '../../components/movie-list'
import { MovieListFilters } from '../../components/movie-list-filters'

const DiscoverMoviesPage = ({ params }: PageProps) => {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-muted-foreground">
            Find movies using over 30 filters and sort options.
          </p>
        </div>

        <MovieListFilters />
      </div>

      <MovieList variant="discover" language={params.lang} />
    </div>
  )
}

export default DiscoverMoviesPage
