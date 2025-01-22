import { Poster } from '@/components/poster'
import type { Language } from '@/types/languages'
import { locale } from '@/utils/date/locale'
import { Badge } from '@plotwist/ui/components/ui/badge'
import type { SeasonDetails as TMDBSeasonDetails } from '@plotwist_app/tmdb'
import { format } from 'date-fns'
import Image from 'next/image'
import { tmdb } from '@/services/tmdb'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@plotwist/ui/components/ui/breadcrumb'
import { Link } from 'next-view-transitions'

type SeasonDetailsProps = {
  season: TMDBSeasonDetails
  language: Language
  id: number
}

export async function SeasonDetails({
  season,
  language,
  id,
}: SeasonDetailsProps) {
  const { poster_path, name, overview, air_date, vote_average, season_number } =
    season
  const series = await tmdb.tv.details(id, language)

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href={`/${language}/tv-series/${id}`}>{series.name}</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              href={`/${language}/tv-series/${id}/seasons/${season_number}`}
              className="text-foreground"
            >
              {name}
            </Link>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-end gap-4">
        <Poster url={poster_path} alt={name} className="w-1/3 md:w-[200px]" />

        <div className="flex flex-col gap-2 flex-1">
          <span className="text-xs text-muted-foreground">
            {format(new Date(air_date), 'PPP', {
              locale: locale[language],
            })}
          </span>

          <h1 className="text-lg font-bold md:text-4xl">{name}</h1>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm/6 text-muted-foreground">{overview}</p>

        <div className="flex">
          <Badge className="shrink-0">
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
  )
}
