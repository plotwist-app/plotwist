import { Locale } from '@/types/locales'
import { MovieDetails } from './components/movie-details'

export type MovieParams = { id: string; lang: Locale }

const MoviePage = ({ params }: { params: MovieParams }) => {
  return <MovieDetails id={Number(params.id)} locale={params.lang} />
}

export default MoviePage
