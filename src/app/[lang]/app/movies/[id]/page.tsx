import { Language } from '@/types/languages'
import { MovieDetails } from './_components/movie-details'

export type MovieParams = { id: string; lang: Language }

const MoviePage = ({ params: { id, lang } }: { params: MovieParams }) => {
  return <MovieDetails id={Number(id)} language={lang} />
}

export default MoviePage
