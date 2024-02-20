import { TvShowsList } from '@/components/tv-shows-list'
import { TvShowsListFilters } from '@/components/tv-shows-list-filters/tv-shows-list-filters'
import { PageProps } from '@/types/languages'

const DiscoverTvShowsPage = async ({ params: { lang } }: PageProps) => {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-muted-foreground">
            Find TV shows using filters and sort options.
          </p>
        </div>

        <TvShowsListFilters />
      </div>

      <TvShowsList variant="discover" />
    </div>
  )
}

export default DiscoverTvShowsPage
