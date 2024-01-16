import { TvShowList } from '../../components/tv-show-list'

const PopularTvShowsPage = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Popular</h1>
          <p className="text-muted-foreground">
            TV shows ordered by popularity.
          </p>
        </div>
      </div>

      <TvShowList variant="popular" />
    </div>
  )
}

export default PopularTvShowsPage
