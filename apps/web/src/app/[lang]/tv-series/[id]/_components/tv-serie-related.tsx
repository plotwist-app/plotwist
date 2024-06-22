import { PosterCard } from '@/components/poster-card'
import { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import { tmdb } from '@plotwist/tmdb'
import Link from 'next/link'

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
    <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-5">
      {results.map((tv) => (
        <Link href={`/${language}/tv-series/${tv.id}`} key={tv.id}>
          <PosterCard.Root>
            <PosterCard.Image
              src={tmdbImage(tv.poster_path, 'w500')}
              alt={tv.name}
            />

            <PosterCard.Details>
              <PosterCard.Title>{tv.name}</PosterCard.Title>
              <PosterCard.Year>
                {tv.first_air_date.split('-')[0]}
              </PosterCard.Year>
            </PosterCard.Details>
          </PosterCard.Root>
        </Link>
      ))}
    </div>
  )
}
