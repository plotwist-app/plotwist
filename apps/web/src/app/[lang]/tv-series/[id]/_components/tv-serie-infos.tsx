import { ListsDropdown } from '@/components/lists'
import { Poster } from '@/components/poster'
import { locale } from '@/utils/date/locale'
import { Badge } from '@plotwist/ui/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'
import { Language, TvSerieDetails } from '@plotwist_app/tmdb'
import { format } from 'date-fns'
import Image from 'next/image'
import { TvSeriesGenres } from './tv-serie-genres'

type TvSerieInfosProps = { tvSerie: TvSerieDetails; language: Language }

export function TvSerieInfos({ tvSerie, language }: TvSerieInfosProps) {
  return (
    <main className="space-y-4 p-4 lg:p-0">
      <div className="flex flex-row items-end gap-4 md:items-start">
        <aside className="-mt-32 w-2/5 space-y-2 md:w-1/3">
          <Poster url={tvSerie.poster_path} alt={tvSerie.name} />
        </aside>

        <article className="flex w-3/5 flex-col gap-2 md:w-2/3">
          {tvSerie.first_air_date && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(tvSerie.first_air_date), 'PPP', {
                locale: locale[language],
              })}
            </span>
          )}

          <h1 className="text-lg font-bold md:text-4xl">{tvSerie.name}</h1>

          <div className="hidden flex-wrap items-center gap-2 whitespace-nowrap md:flex">
            <TvSeriesGenres genres={tvSerie.genres} />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge>
                    <Image
                      src="/assets/tmdb.svg"
                      width={55}
                      height={1}
                      alt="TMDB"
                      className="mr-2"
                    />

                    {tvSerie.vote_average.toFixed(1)}
                  </Badge>
                </TooltipTrigger>

                <TooltipContent>
                  <p>{tvSerie.vote_count} votes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <p className="hidden text-xs leading-5 text-muted-foreground md:block md:text-sm md:leading-6">
            {tvSerie.overview}
          </p>

          <div className="hidden flex-wrap items-center gap-1 md:flex">
            <ListsDropdown item={tvSerie} />
          </div>
        </article>
      </div>

      <div className="space-y-2 md:hidden">
        <p className="text-sm/7 text-muted-foreground">{tvSerie.overview}</p>
        <TvSeriesGenres genres={tvSerie.genres} />
      </div>
    </main>
  )
}
