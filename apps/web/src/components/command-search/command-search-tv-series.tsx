import { useLanguage } from '@/context/language'
import { TvSerieWithMediaType } from '@plotwist/tmdb'
import Link from 'next/link'
import { PosterCard } from '../poster-card'
import { tmdbImage } from '@/utils/tmdb/image'
import { classnames } from './command-search'
import { ScrollArea } from '../ui/scroll-area'

type CommandSearchTvSeriesProps = {
  tvSeries: TvSerieWithMediaType[]
  isLoading?: boolean
}

export const CommandSearchMovies = ({
  tvSeries,
  isLoading,
}: CommandSearchTvSeriesProps) => {
  const { language } = useLanguage()

  if (isLoading) {
    return (
      <ScrollArea className={classnames.scrollArea}>
        <div className={classnames.list}>
          {Array.from({ length: 20 }).map((_, index) => (
            <PosterCard.Skeleton key={index} />
          ))}
        </div>
      </ScrollArea>
    )
  }

  if (!tvSeries || tvSeries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm">
        <p>Não encontramos nenhum resultado.</p>
      </div>
    )
  }

  return (
    <ScrollArea className={classnames.scrollArea}>
      <div className={classnames.list}>
        {tvSeries.map((tv) => (
          <Link href={`/${language}/movies/${tv.id}`} key={tv.id}>
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
    </ScrollArea>
  )
}
