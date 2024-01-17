import { Language } from '@/types/languages'
import { TvShowsDetails } from './components/tv-show-details'

export type TvShowPageParams = { id: string; lang: Language }

const TvShowPage = ({ params }: { params: TvShowPageParams }) => {
  return <TvShowsDetails id={Number(params.id)} />
}

export default TvShowPage
