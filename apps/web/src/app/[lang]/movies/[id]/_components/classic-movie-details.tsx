import { Suspense } from 'react'
import { Banner } from '@/components/banner'
import type { Language, MovieDetails } from '@/services/tmdb'
import { MovieCollection } from './movie-collection'
import { MovieInfos } from './movie-infos'
import { MovieTabs } from './movie-tabs'

type ClassicMovieDetailsProps = {
  movie: MovieDetails
  language: Language
  backdropUrl?: string
  posterUrl?: string
}

export const ClassicMovieDetails = ({
  movie,
  language,
  backdropUrl,
  posterUrl,
}: ClassicMovieDetailsProps) => (
  <div
    className="relative mx-auto max-w-6xl"
    data-testid="classic-movie-details"
  >
    <Banner url={backdropUrl} posterUrl={posterUrl} title={movie.title} />

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
