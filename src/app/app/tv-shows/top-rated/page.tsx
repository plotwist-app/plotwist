import { TvShowList } from '../../components/tv-show-list'

const TopRatedTvShowsPage = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Top rated</h1>
          <p className="text-muted-foreground">TV shows ordered by rating.</p>
        </div>
      </div>

      <TvShowList variant="topRated" />
    </div>
  )
}

export default TopRatedTvShowsPage
