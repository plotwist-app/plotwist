import { PageProps } from '@/types/languages'
import { MovieList } from '../../components/movie-list'

const NowPlayingMoviesPage = ({ params }: PageProps) => {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Now playing</h1>
        <p className="text-muted-foreground">
          Movies that are currently in theatres.
        </p>
      </div>

      <MovieList variant="now_playing" language={params.lang} />
    </div>
  )
}

export default NowPlayingMoviesPage
