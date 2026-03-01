import type { Metadata } from 'next'
import { MovieList } from '@/components/movie-list'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { buildLanguageAlternates } from '@/utils/seo'
import { Container } from '../../_components/container'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const {
    movie_pages: {
      popular: { title, description },
    },
  } = await getDictionary(params.lang)

  return {
    title: `${title} • Plotwist`,
    description,
    openGraph: {
      title: `${title} • Plotwist`,
      description,
      siteName: 'Plotwist',
    },
    twitter: {
      title: `${title} • Plotwist`,
      description,
    },
    alternates: buildLanguageAlternates(params.lang, '/movies/popular'),
  }
}

const PopularMoviesPage = async (props: PageProps) => {
  const params = await props.params

  const { lang } = params

  const dictionary = await getDictionary(lang)

  return (
    <Container>
      <div>
        <h1 className="text-2xl font-bold">
          {dictionary.movie_pages.popular.title}
        </h1>

        <p className="text-muted-foreground">
          {dictionary.movie_pages.popular.description}
        </p>
      </div>

      <MovieList variant="popular" />
    </Container>
  )
}

export default PopularMoviesPage
