import { PageProps } from '@/types/languages'
import { MovieList } from '../../components/movie-list'
import { getDictionary } from '@/utils/dictionaries'

const TopRatedMoviesPage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
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
