import { TvShowList } from '../../components/tv-show-list'

const AiringTodayTvShowsPage = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Airing Today</h1>
          <p className="text-muted-foreground">TV shows airing today.</p>
        </div>
      </div>

      <TvShowList variant="airingToday" />
    </div>
  )
}

export default AiringTodayTvShowsPage
