import { TvShowList } from '../../components/tv-shows-list'

const OnTheAirTvShowsPage = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">On the air</h1>
          <p className="text-muted-foreground">
            TV shows that air in the next 7 days.
          </p>
        </div>
      </div>

      <TvShowList variant="onTheAir" />
    </div>
  )
}

export default OnTheAirTvShowsPage
