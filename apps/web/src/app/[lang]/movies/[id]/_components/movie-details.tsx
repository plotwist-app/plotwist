import { Suspense } from 'react'

import { Banner } from '@/components/banner'
import { BreadcrumbJsonLd, MovieJsonLd } from '@/components/structured-data'
import { tmdb } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
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
      <BreadcrumbJsonLd
        items={[
          { name: 'Plotwist', url: `https://plotwist.app/${language}` },
          {
            name: 'Movies',
            url: `https://plotwist.app/${language}/movies/popular`,
          },
          {
            name: movie.title,
            url: `https://plotwist.app/${language}/movies/${id}`,
          },
        ]}
      />
      <MovieJsonLd
        name={movie.title}
        description={movie.overview}
        image={tmdbImage(movie.backdrop_path)}
        datePublished={movie.release_date}
        rating={movie.vote_average}
        url={`https://plotwist.app/${language}/movies/${id}`}
      />
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
