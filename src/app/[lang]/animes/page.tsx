import { PageProps } from '@/types/languages'
import { Container } from '../_components/container'
import { AnimeList } from '@/components/anime-list'

const DiscoverMoviesPage = async ({ params: { lang } }: PageProps) => {
  // const dictionary = await getDictionary(lang)

  return (
    <Container>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Animes</h1>

          <p className="text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Libero
            consequuntur totam amet architecto eum at assumenda eaque voluptate
            quam obcaecati. Quae iusto id deleniti ipsam quaerat quas provident,
            praesentium porro.
          </p>
        </div>
      </div>

      <AnimeList language={lang} />
    </Container>
  )
}

export default DiscoverMoviesPage
