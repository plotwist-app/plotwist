import { Link } from 'next-view-transitions'
import { PosterCard } from '@/components/poster-card'
import { tmdb } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'

type TvSerieRelatedProps = {
  id: number
  variant: 'similar' | 'recommendations'
  language: Language
}

export const TvSerieRelated = async ({
  id,
  variant,
  language,
}: TvSerieRelatedProps) => {
  const { results } = await tmdb.tv.related(id, variant, language)

  return (
    <div className="grid w-full grid-cols-3 gap-4 md:grid-cols-5">
      {results.map(tv => (
        <Link href={`/${language}/tv-series/${tv.id}`} key={tv.id}>
          <PosterCard.Root>
            <PosterCard.Image
              src={tmdbImage(tv.poster_path, 'w500')}
              alt={tv.name}
            />
          </PosterCard.Root>
        </Link>
      ))}
    </div>
  )
}
