import { getDictionary } from '@/utils/dictionaries'
import { PageProps } from '@/types/languages'
import { Container } from '../_components/container'
import { AnimeList } from '@/components/animes-list'

const DiscoverMoviesPage = async ({ params: { lang } }: PageProps) => {
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
