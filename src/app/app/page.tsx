import { TMDB } from '@/services/TMDB'

import { LastReviews } from './components/last-reviews'
import { MovieCard } from '@/components/movie-card'
import { TvShowCard } from '@/components/tv-show-card'
import { Separator } from '@/components/ui/separator'
import { LastReview } from './components/last-review'

const AppPage = async () => {
  const popularMovies = await TMDB.movies.popular()
  const popularTvShows = await TMDB.tvShows.popular()

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">description about dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr,300px] space-x-8">
        <div className="space-y-8">
          <LastReview />
          <Separator className="bg-muted/75" />
          <LastReviews />
        </div>

        <div className="space-y-16">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Popular movies</h4>

            <div className="flex flex-col space-y-8">
              {popularMovies.results.slice(0, 2).map((movie) => (
                <MovieCard movie={movie} key={movie.id} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Popular TV Shows</h4>

            <div className="flex flex-col space-y-8">
              {popularTvShows.results.slice(0, 2).map((tvShow) => (
                <TvShowCard tvShow={tvShow} key={tvShow.id} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppPage
