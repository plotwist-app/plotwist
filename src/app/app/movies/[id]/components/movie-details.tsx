import { Badge } from '@/components/ui/badge'
import { TMDB } from '@/services/TMDB'

import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'

import { MovieDetailsTabs } from './movie-details-tabs'
import { MovieCollection } from './movie-collection'

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
  } = await TMDB.movies.details(id)

  const backdropURL = `https://image.tmdb.org/t/p/original/${backdrop}`
  const posterURL = `https://image.tmdb.org/t/p/original/${poster}`

  return (
    <div>
      <div className={`h-[80vh] overflow-hidden`}>
        <div
          style={{
            backgroundImage: `url('${backdropURL}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className="h-full w-full brightness-50"
        />
      </div>

      <div className="mx-auto my-8 max-w-5xl space-y-8 p-4">
        <main className="flex gap-4">
          <aside className="-mt-32 w-2/5 space-y-4">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-muted shadow">
              <Image
                fill
                className="object-cover"
                src={posterURL}
                alt={title}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* <Balance budget={budget} revenue={revenue} /> */}
          </aside>

          <article className="flex w-3/4 flex-col gap-2">
            <div>
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

            <div className="flex gap-1">
              {genres.map((genre) => {
                return (
                  <Badge key={genre.id} variant="outline">
                    {genre.name}
                  </Badge>
                )
              })}
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
