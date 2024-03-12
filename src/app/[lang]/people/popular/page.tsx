import { PeopleList } from '@/components/people-list'
import { Container } from '../../_components/container'

const PopularPeoplePage = async () => {
  return (
    <Container>
      <div>
        <h1 className="text-2xl font-bold">Popular people</h1>

        <p className="text-muted-foreground">
          Get a list of people ordered by popularity.
        </p>
      </div>

      <PeopleList />
    </Container>
  )
}

export default PopularPeoplePage
