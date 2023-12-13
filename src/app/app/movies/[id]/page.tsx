import { MovieDetails } from './components/movie-details'

const MoviePage = ({ params }: { params: { id: string } }) => {
  return <MovieDetails id={Number(params.id)} />
}

export default MoviePage
