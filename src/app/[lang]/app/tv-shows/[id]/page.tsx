import { TvShowsDetails } from './components/tv-show-details'

export type TvShowPageParams = { id: string; lang: Locale }

const TvShowPage = ({ params }: { params: TvShowPageParams }) => {
  return <TvShowsDetails id={Number(params.id)} />
}

export default TvShowPage
