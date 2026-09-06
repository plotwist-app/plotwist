import { cookies } from 'next/headers'
import { BreadcrumbJsonLd, MovieJsonLd } from '@/components/structured-data'
import {
  parseUiVersion,
  UI_VERSION_COOKIE_NAME,
  type UiVersion,
} from '@/lib/ui-version'
import { tmdb } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import { APP_URL } from '../../../../../../constants'
import { CinematicMovieDetails } from './cinematic-movie-details'
import { ClassicMovieDetails } from './classic-movie-details'

type MovieDetailsProps = {
  id: number
  language: Language
}

export const MovieDetails = async ({ id, language }: MovieDetailsProps) => {
  const movie = await tmdb.movies.details(id, language)
  const backdropUrl = movie.backdrop_path
    ? tmdbImage(movie.backdrop_path)
    : undefined
  const posterUrl = movie.poster_path ? tmdbImage(movie.poster_path) : undefined
  const structuredDataImage =
    backdropUrl ?? posterUrl ?? `${APP_URL}/logo-black.png`
  const cookieStore = await cookies()
  const uiVersion: UiVersion = parseUiVersion(
    cookieStore.get(UI_VERSION_COOKIE_NAME)?.value
  )
  const rendererProps = { movie, language, backdropUrl, posterUrl }

  return (
    <>
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
        image={structuredDataImage}
        datePublished={movie.release_date}
        rating={movie.vote_average}
        url={`https://plotwist.app/${language}/movies/${id}`}
      />
      {uiVersion === 'cinematic' ? (
        <CinematicMovieDetails {...rendererProps} />
      ) : (
        <ClassicMovieDetails {...rendererProps} />
      )}
    </>
  )
}
