import { PeopleList } from '@/components/people-list'
import { Container } from '../../_components/container'
import { getDictionary } from '@/utils/dictionaries'
import { PageProps } from '@/types/languages'

const PopularPeoplePage = async ({ params }: PageProps) => {
  const {
    popular_people: { title, description },
  } = await getDictionary(params.lang)

  return (
    <Container>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <PeopleList />
    </Container>
  )
}

export default PopularPeoplePage
