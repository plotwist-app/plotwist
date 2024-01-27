import { TvShowCard } from '@/components/tv-show-card'
import { tmdb } from '@/services/tmdb'
import { Language } from '@/types/languages'

type TvShowRelatedProps = {
  id: number
  variant: 'similar' | 'recommendations'
  language: Language
}

export const TvShowRelated = async ({
  id,
  variant,
  language,
}: TvShowRelatedProps) => {
  const { results } = await tmdb.tvSeries.related(id, variant, language)

  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-8">
      {results.map((tvShow) => (
        <TvShowCard tvShow={tvShow} key={tvShow.id} />
      ))}
    </div>
  )
}
