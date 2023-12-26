import { TvShowCard } from '@/components/tv-show-card'
import { TMDB } from '@/services/TMDB'
import { SimilarTvShow } from 'tmdb-ts'

type TvShowRelatedProps = {
  tvShowID: number
  variant: 'similar' | 'recommendations'
}

type TvShowRelatedContent = {
  results: Array<SimilarTvShow>
}

const TvShowRelatedContent = ({ results }: TvShowRelatedContent) => (
  <div className="grid grid-cols-3 gap-x-4 gap-y-8">
    {results.map((tvShow) => (
      <TvShowCard tvShow={tvShow} key={tvShow.id} />
    ))}
  </div>
)

export const TvShowRelated = async ({
  tvShowID,
  variant,
}: TvShowRelatedProps) => {
  const { results } = await TMDB.tvShows[variant](tvShowID)

  return <TvShowRelatedContent results={results as SimilarTvShow[]} />
}
