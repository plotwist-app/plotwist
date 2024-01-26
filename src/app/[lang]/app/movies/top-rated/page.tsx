import { PageProps } from '@/types/languages'
import { MovieList } from '../../components/movie-list'

const TopRatedMoviesPage = ({ params }: PageProps) => {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Top Rated</h1>
        <p className="text-muted-foreground">Movies ordered by rating.</p>
      </div>

      <MovieList variant="top_rated" language={params.lang} />
    </div>
  )
}

export default TopRatedMoviesPage
