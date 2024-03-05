import { PeopleList } from '@/components/people-list'

const PopularPeoplePage = async () => {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Popular people</h1>

        <p className="text-muted-foreground">
          Get a list of people ordered by popularity.
        </p>
      </div>

      <PeopleList />
    </div>
  )
}

export default PopularPeoplePage
