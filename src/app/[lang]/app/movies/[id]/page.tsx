import { MovieDetails } from './components/movie-details'

export type MovieParams = { id: string }

const MoviePage = ({ params }: { params: MovieParams }) => {
  return <MovieDetails id={Number(params.id)} />
}

export default MoviePage
