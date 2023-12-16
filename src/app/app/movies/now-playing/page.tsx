import { MovieList } from '../../components/movie-list'

const NowPlayingMoviesPage = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Now playing</h1>
        <p className="text-muted-foreground">
          Movies that are currently in theatres.
        </p>
      </div>

      <MovieList variant="nowPlaying" />
    </div>
  )
}

export default NowPlayingMoviesPage
