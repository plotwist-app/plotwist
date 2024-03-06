import { MovieList } from '@/components/movie-list'
import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    movie_pages: {
      upcoming: { title, description },
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

const UpcomingMoviesPage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          {dictionary.movie_pages.upcoming.title}
        </h1>

        <p className="text-muted-foreground">
          {dictionary.movie_pages.upcoming.description}
        </p>
      </div>

      <MovieList variant="upcoming" language={lang} />
    </div>
  )
}

export default UpcomingMoviesPage
