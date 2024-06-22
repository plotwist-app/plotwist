import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { MoviesListFilters } from '@/components/movies-list-filters'
import { MovieList } from '@/components/movie-list'
import { Metadata } from 'next'
import { Container } from '../../_components/container'

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    movie_pages: {
      discover: { title, description },
    },
  } = await getDictionary(params.lang)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'Plotwist',
    },
    twitter: {
      title,
      description,
    },
  }
}

const DiscoverMoviesPage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  return (
    <Container>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">
            {dictionary.movie_pages.discover.title}
          </h1>

          <p className="text-muted-foreground">
            {dictionary.movie_pages.discover.description}
          </p>
        </div>

        <MoviesListFilters />
      </div>

      <MovieList variant="discover" />
    </Container>
  )
}

export default DiscoverMoviesPage
