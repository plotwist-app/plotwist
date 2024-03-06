import { MovieList } from '@/components/movie-list'
import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    movie_pages: {
      top_rated: { title, description },
    },
  } = await getDictionary(params.lang)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  }
}

const TopRatedMoviesPage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          {dictionary.movie_pages.top_rated.title}
        </h1>

        <p className="text-muted-foreground">
          {dictionary.movie_pages.top_rated.description}
        </p>
      </div>

      <MovieList variant="top_rated" language={lang} />
    </div>
  )
}

export default TopRatedMoviesPage
