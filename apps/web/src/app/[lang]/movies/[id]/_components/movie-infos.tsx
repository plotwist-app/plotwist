import { WatchProviders } from '@/components/watch-providers'
import { Poster } from '@/components/poster'
import { ListsDropdown } from '@/components/lists'
import { locale } from '@/utils/date/locale'
import { Language, MovieDetails } from '@plotwist/tmdb'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type MovieInfosProps = { movie: MovieDetails; language: Language }

export const MovieInfos = ({ language, movie }: MovieInfosProps) => {
  return (
    <main className="flex flex-row gap-4">
      <aside className="-mt-32 w-full space-y-2 md:-mt-32 md:w-1/3">
        <Poster url={movie.poster_path} alt={movie.title} />
      </aside>

      <article className="flex w-full flex-col gap-2 md:w-2/3">
        {movie.release_date && (
          <span className="text-xs text-muted-foreground">
            {format(new Date(movie.release_date), 'PPP', {
              locale: locale[language],
            })}
          </span>
        )}

        <h1 className="text-lg font-bold md:text-4xl">{movie.title}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {movie.genres.length > 0 && (
            <>
              {movie.genres.map((genre) => {
                return (
                  <Badge
                    key={genre.id}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {genre.name}
                  </Badge>
                )
              })}

              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge>{movie.vote_average.toFixed(1)}</Badge>
              </TooltipTrigger>

              <TooltipContent>
                <p>{movie.vote_count} votes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <p className="text-xs leading-5 text-muted-foreground md:text-sm md:leading-6">
          {movie.overview}
        </p>

        <div className="flex flex-wrap items-center gap-1">
          <WatchProviders id={movie.id} variant="movie" language={language} />
          <ListsDropdown item={movie} />
          {/* <RecommendationDialog /> */}
        </div>
      </article>
    </main>
  )
}
