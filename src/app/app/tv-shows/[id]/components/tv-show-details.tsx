import { Banner } from '@/app/app/components/banner'
import { Poster } from '@/app/app/components/poster'
import { TMDB } from '@/services/TMDB'
import { TvShowDetailsSeasons } from './tv-show-details-seasons'

type TvShowsDetailsProps = {
  id: number
}

export const TvShowsDetails = async ({ id }: TvShowsDetailsProps) => {
  const {
    name,
    backdrop_path: backdrop,
    poster_path: poster,
    seasons,
  } = await TMDB.tvShows.details(id)

  return (
    <div>
      <Banner url={`https://image.tmdb.org/t/p/original/${backdrop}`} />

      <div className="mx-auto my-8 max-w-4xl space-y-12 p-4">
        <main className="flex gap-4">
          <aside className="-mt-32 w-1/3 space-y-2">
            <Poster
              url={`https://image.tmdb.org/t/p/original/${poster}`}
              alt={name}
            />
          </aside>

          <div className="w-2/3"></div>
        </main>

        <TvShowDetailsSeasons seasons={seasons} />
      </div>
    </div>
  )
}
