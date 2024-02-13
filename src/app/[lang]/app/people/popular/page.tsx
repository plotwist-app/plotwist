import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { PeopleList } from '../../components/people-list'

const PopularPeoplePage = async ({ params: { lang } }: PageProps) => {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Popular people</h1>

        <p className="text-muted-foreground">
          Get a list of people ordered by popularity.
        </p>
      </div>

      <PeopleList language={lang} />
    </div>
  )
}

export default PopularPeoplePage
