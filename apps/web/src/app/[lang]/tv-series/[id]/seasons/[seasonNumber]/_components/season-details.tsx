import { Poster } from '@/components/poster'
import type { Language } from '@/types/languages'
import { locale } from '@/utils/date/locale'
import { Badge } from '@plotwist/ui/components/ui/badge'
import type { SeasonDetails as TMDBSeasonDetails } from '@plotwist_app/tmdb'
import { format } from 'date-fns'
import Image from 'next/image'

type SeasonDetailsProps = {
  season: TMDBSeasonDetails
  language: Language
}

export function SeasonDetails({ season, language }: SeasonDetailsProps) {
  const { poster_path, name, overview, air_date, vote_average } = season

  return (
    <div className="flex items-end gap-4">
      <Poster url={poster_path} alt={name} className="w-1/4" />

      <div className="flex flex-col gap-2 w-4/5">
        <span className="text-xs text-muted-foreground">
          {format(new Date(air_date), 'PPP', {
            locale: locale[language],
          })}
        </span>

        <h1 className="text-lg font-bold md:text-4xl">{name}</h1>

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

        <p className="text-sm text-muted-foreground line-clamp-3">{overview}</p>
      </div>
    </div>
  )
}
