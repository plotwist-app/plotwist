import { MovieDetailsTabs } from './movie-details-tabs'
import { MovieCollection } from './movie-collection'

import { tmdbImage } from '@/utils/tmdb/image'
import { MovieDetailsInfo } from './movie-details-info'

import { tmdb } from '@/services/tmdb2'

import { Banner } from '@/components/banner'
import { Poster } from '@/components/poster'

type MovieDetailsProps = {
  id: number
}

export const MovieDetails = async ({ id }: MovieDetailsProps) => {
  const movie = await tmdb.movies.details(id)

  return (
    <div>
      <Banner url={tmdbImage(movie.backdrop_path)} />

      <div className="mx-auto my-8 max-w-4xl space-y-12 p-4">
        <main className="flex gap-4">
          <aside className="-mt-32 w-1/3 space-y-2">
            <Poster
              url={tmdbImage(movie.poster_path ?? '')}
              alt={movie.title}
            />
          </aside>

          <MovieDetailsInfo movie={movie} />
        </main>

        {movie.belongs_to_collection && (
          <MovieCollection collectionId={movie.belongs_to_collection.id} />
        )}

        <MovieDetailsTabs movie={movie} />
      </div>
    </div>
  )
}
