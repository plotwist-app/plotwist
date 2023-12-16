import { MovieList } from '../../components/movie-list'

const DiscoverMoviesPage = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="text-muted-foreground">
          Find movies using over 30 filters and sort options.
        </p>
      </div>

      <MovieList variant="discover" />
    </div>
  )
}

export default DiscoverMoviesPage
