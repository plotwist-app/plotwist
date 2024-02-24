import { MovieList } from '@/components/movie-list'
import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

const PopularMoviesPage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">
          {dictionary.movie_pages.popular.title}
        </h1>

        <p className="text-muted-foreground">
          {dictionary.movie_pages.popular.description}
        </p>
      </div>

      <MovieList variant="popular" language={lang} />
    </div>
  )
}

export default PopularMoviesPage
