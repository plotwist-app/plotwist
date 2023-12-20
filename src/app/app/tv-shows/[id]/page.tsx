import { TvShowsDetails } from './components/tv-show-details'

const TvShowPage = ({ params }: { params: { id: string } }) => {
  return <TvShowsDetails id={Number(params.id)} />
}

export default TvShowPage
