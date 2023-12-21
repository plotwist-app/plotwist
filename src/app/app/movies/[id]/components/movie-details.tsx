import { Badge } from '@/components/ui/badge'
import { TMDB } from '@/services/TMDB'

import { ExternalLink } from 'lucide-react'

import { format } from 'date-fns'

import { MovieDetailsTabs } from './movie-details-tabs'
import { MovieCollection } from './movie-collection'
import { MovieDetailsProvider } from './movie-details-providers'
import { formatCurrency } from '@/utils/currency/format'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Banner } from '@/app/app/components/banner'
import { Poster } from '@/app/app/components/poster'
import { tmdbImage } from '@/utils/tmdb/image'

type MovieBannerProps = {
  id: number
}

export const MovieDetails = async ({ id }: MovieBannerProps) => {
  const {
    title,
    overview,
    homepage,
    genres,
    poster_path: poster,
    backdrop_path: backdrop,
    release_date: releaseDate,
    belongs_to_collection: belongsToCollection,
    revenue,
    budget,
    vote_average: voteAverage,
    vote_count: voteCount,
  } = await TMDB.movies.details(id)

  return (
    <div>
      <Banner url={tmdbImage(backdrop)} />

      <div className="mx-auto my-8 max-w-4xl space-y-12 p-4">
        <main className="flex gap-4">
          <aside className="-mt-32 w-1/3 space-y-2">
            <Poster url={tmdbImage(poster ?? '')} alt={title} />
          </aside>

          <article className="flex w-2/3 flex-col gap-2">
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge>{voteAverage.toFixed(1)}</Badge>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>{voteCount} votes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Badge variant="outline">
                {format(new Date(releaseDate), 'PPP')}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{title}</h1>

              {homepage !== '' && (
                <a target="_blank" href={homepage}>
                  <ExternalLink width={20} className="text-muted-foreground" />
                </a>
              )}
            </div>

            <p className="text-sm text-muted-foreground">{overview}</p>

            <div className="mt-2 flex flex-wrap gap-1">
              {genres.map((genre) => {
                return (
                  <Badge key={genre.id} variant="outline">
                    {genre.name}
                  </Badge>
                )
              })}

              <MovieDetailsProvider movieId={id} />
            </div>

            <div className="flex flex-wrap gap-1">
              {budget > 0 && (
                <Badge variant="outline">
                  Budget: {formatCurrency(budget)}
                </Badge>
              )}

              {revenue > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline">
                        Revenue: {formatCurrency(revenue)}
                      </Badge>
                    </TooltipTrigger>

                    <TooltipContent>
                      {formatCurrency(revenue - budget)}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </article>
        </main>

        {belongsToCollection && (
          <MovieCollection collectionId={belongsToCollection.id} />
        )}

        <MovieDetailsTabs movieId={id} />
      </div>
    </div>
  )
}
