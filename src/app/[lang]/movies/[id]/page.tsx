import { Language } from '@/types/languages'
import { MovieDetails } from './_components/movie-details'
import { homeMovies } from '@/app/[lang]/page'
import { Metadata } from 'next'
import { tmdb } from '@/services/tmdb'
import { tmdbImage } from '@/utils/tmdb/image'

type MoviePageProps = {
  params: { id: string; lang: Language; embed?: boolean }
}

export async function generateStaticParams() {
  return Object.values(homeMovies).map((id) => ({ id }))
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const tvShow = await tmdb.movies.details(Number(params.id), params.lang)

  const keywords = await tmdb.keywords({
    id: Number(params.id),
    type: 'movie',
  })

  return {
    title: tvShow.title,
    description: tvShow.overview,
    keywords: keywords?.map((keyword) => keyword.name).join(','),
    openGraph: {
      images: [tmdbImage(tvShow.backdrop_path)],
      title: tvShow.title,
      description: tvShow.overview,
      siteName: '[TMDB]',
    },
    twitter: {
      title: tvShow.title,
      description: tvShow.overview,
      images: tmdbImage(tvShow.backdrop_path),
      card: 'summary_large_image',
      creator: '@lui7henrique',
    },
  }
}

const MoviePage = ({ params }: MoviePageProps) => {
  const { id, lang, embed } = params

  return <MovieDetails id={Number(id)} language={lang} embed={embed} />
}

export default MoviePage
