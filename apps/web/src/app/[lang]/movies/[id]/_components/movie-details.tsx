import { tmdb } from '@/services/tmdb'

import { Banner } from '@/components/banner'

import type { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'

import { MovieCollection } from './movie-collection'
import { MovieInfos } from './movie-infos'
import { MovieTabs } from './movie-tabs'
import { Suspense } from 'react'

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
          <Suspense>
            <MovieCollection
              collectionId={movie.belongs_to_collection.id}
              language={language}
            />
          </Suspense>
        )}

        <Suspense>
          <MovieTabs movie={movie} language={language} />
        </Suspense>
      </section>
    </div>
  )
}
