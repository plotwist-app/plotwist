import { Language } from '@/types/languages'
import { MovieDetails } from './_components/movie-details'

type MoviePageProps = {
  params: { id: string; lang: Language; embed?: boolean }
}

const MoviePage = ({ params }: MoviePageProps) => {
  const { id, lang, embed } = params

  return <MovieDetails id={Number(id)} language={lang} embed={embed} />
}

export default MoviePage
