import { Language } from '@/types/languages'
import { MovieDetails } from './_components/movie-details'
import { homeMovies } from '@/app/[lang]/page'

type MoviePageProps = {
  params: { id: string; lang: Language; embed?: boolean }
}

export async function generateStaticParams() {
  return Object.values(homeMovies).map((id) => ({ id }))
}

const MoviePage = ({ params }: MoviePageProps) => {
  const { id, lang, embed } = params

  return <MovieDetails id={Number(id)} language={lang} embed={embed} />
}

export default MoviePage
