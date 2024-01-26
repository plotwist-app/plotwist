import { Language } from '@/types/languages'
import { TvShowsDetails } from './components/tv-show-details'

export type TvShowPageProps = { id: string; lang: Language }

const TvShowPage = ({ params }: { params: TvShowPageProps }) => {
  return <TvShowsDetails id={Number(params.id)} language={params.lang} />
}

export default TvShowPage
