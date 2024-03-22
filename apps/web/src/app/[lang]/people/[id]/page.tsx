import { Language } from '@/types/languages'
import { PersonDetails } from './components/person-details'

export type PersonParams = { id: string; lang: Language }

const PersonPage = ({ params: { id, lang } }: { params: PersonParams }) => {
  return <PersonDetails id={Number(id)} language={lang} />
}

export default PersonPage
