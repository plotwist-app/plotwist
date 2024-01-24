import { PageProps } from '@/types/languages'
import { TvShowList } from '../../components/tv-show-list'

const OnTheAirTvShowsPage = ({ params }: PageProps) => {
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

      <TvShowList variant="on_the_air" language={params.lang} />
    </div>
  )
}

export default OnTheAirTvShowsPage
