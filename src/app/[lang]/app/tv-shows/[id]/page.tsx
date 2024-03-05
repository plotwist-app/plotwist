import { Language } from '@/types/languages'
import { TvShowsDetails } from './_components/tv-show-details'

export type TvShowPageProps = { params: { id: string; lang: Language } }

const TvShowPage = ({ params }: TvShowPageProps) => {
  return <TvShowsDetails id={Number(params.id)} language={params.lang} />
}

export default TvShowPage
