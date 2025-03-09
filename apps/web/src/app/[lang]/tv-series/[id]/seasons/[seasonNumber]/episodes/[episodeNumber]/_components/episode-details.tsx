import { ItemReview } from '@/components/item-review'
import { tmdb } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { locale } from '@/utils/date/locale'
import { getDictionary } from '@/utils/dictionaries'
import { tmdbImage } from '@/utils/tmdb/image'
import { Badge } from '@plotwist/ui/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@plotwist/ui/components/ui/breadcrumb'
import type { EpisodeDetails as EpisodeDetailsType } from '@plotwist_app/tmdb'
import { format } from 'date-fns'
import { Link } from 'next-view-transitions'
import Image from 'next/image'

type EpisodeDetailsProps = {
  episode: EpisodeDetailsType
  language: Language
  tvId: number
  seasonNumber: number
}

export async function EpisodeDetails({
  episode,
  language,
  tvId,
  seasonNumber,
}: EpisodeDetailsProps) {
  const { name, overview, air_date, vote_average, episode_number } = episode
  const [series, season] = await Promise.all([
    tmdb.tv.details(tvId, language),
    tmdb.season.details(tvId, seasonNumber, language),
  ])
  const dictionary = await getDictionary(language)

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href={`/${language}/tv-series/${tvId}`}>{series.name}</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              href={`/${language}/tv-series/${tvId}/seasons/${seasonNumber}`}
            >
              {season.name}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              href={`/${language}/tv-series/${tvId}/seasons/${seasonNumber}/episodes/${episode_number}`}
              className="text-foreground capitalize"
            >
              {dictionary.episode} {episode_number}
            </Link>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-end gap-4">
        <div className="w-1/3 md:w-[200px] relative aspect-poster rounded-md overflow-hidden shadow border">
          <Image
            src={tmdbImage(season.poster_path ?? '', 'w500')}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <span className="text-xs text-muted-foreground">
            {format(new Date(air_date), 'PPP', {
              locale: locale[language],
            })}
          </span>

          <h1 className="text-lg font-bold md:text-4xl">
            {episode_number}. {name}
          </h1>

          <div className="flex">
            <Badge>
              <Image
                src="/assets/tmdb.svg"
                width={55}
                height={1}
                alt="TMDB"
                className="mr-2"
              />
              {vote_average.toFixed(1)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm/6 text-muted-foreground">{overview}</p>

        <div className="flex">
          <ItemReview />
        </div>
      </div>
    </div>
  )
}
