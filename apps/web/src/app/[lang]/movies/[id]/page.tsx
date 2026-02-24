import type { Metadata } from 'next'
import { Suspense } from 'react'
import { asLanguage, type PageProps } from '@/types/languages'
import { getMovieMetadata } from '@/utils/seo/get-movie-metadata'
import { getMoviesIds } from '@/utils/seo/get-movies-ids'
import { MovieDetails } from './_components/movie-details'

type MoviePageProps = PageProps<{ id: string }>

// ISR: revalidate pages every hour
export const revalidate = 3600

// Pre-generate only top movies, others are generated on-demand
export async function generateStaticParams() {
  const moviesIds = await getMoviesIds()
  return moviesIds.map(id => ({ id: String(id) }))
}

export async function generateMetadata(
  props: MoviePageProps
): Promise<Metadata> {
  const { lang, id } = await props.params
  const metadata = await getMovieMetadata(Number(id), lang)

  return metadata
}

export default async function MoviePage(props: MoviePageProps) {
  const { id, lang } = await props.params
  const language = asLanguage(lang)

  return (
    <Suspense>
      <MovieDetails id={Number(id)} language={language} />
    </Suspense>
  )
}
