import { tmdb } from '@/services/tmdb'

import { Banner } from '@/components/banner'

import { tmdbImage } from '@/utils/tmdb/image'
import { Language } from '@/types/languages'

import { MovieCollection } from './movie-collection'
import { MovieInfos } from './movie-infos'
import { MovieTabs } from './movie-tabs'

type MovieDetailsProps = {
  id: number
  language: Language
}

export const MovieDetails = async ({ id, language }: MovieDetailsProps) => {
  const movie = await tmdb.movies.details(id, language)

  return (
    <div className="relative mx-auto max-w-6xl">
      <Banner url={tmdbImage(movie.backdrop_path)} />

      <section className="mx-auto my-8 max-w-4xl space-y-6">
        <MovieInfos movie={movie} language={language} />

        {movie.belongs_to_collection && (
          <MovieCollection
            collectionId={movie.belongs_to_collection.id}
            language={language}
          />
        )}

        <MovieTabs movie={movie} language={language} />
      </section>
    </div>
  )
}
