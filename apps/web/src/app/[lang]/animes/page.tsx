import { AnimeList } from '@/components/animes-list'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Container } from '../_components/container'

const DiscoverMoviesPage = async (props: PageProps) => {
  const params = await props.params;

  const {
    lang
  } = params;

  const dictionary = await getDictionary(lang)

  return (
    <Container>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{dictionary.animes_page.title}</h1>

          <p className="text-muted-foreground">
            {dictionary.animes_page.description}
          </p>
        </div>
      </div>

      <AnimeList />
    </Container>
  )
}

export default DiscoverMoviesPage
