import { MovieCard } from '@/components/movie-card'
import { Separator } from '@/components/ui/separator'
import { TvShowCard } from '@/components/tv-show-card'

import { PageProps } from '@/types/languages'
import { tmdb } from '@/services/tmdb'
import { getDictionary } from '@/utils/dictionaries'

const HomePage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  const popularMovies = await tmdb.movies.list({
    language: lang,
    list: 'popular',
    page: 1,
  })

  const popularTvShows = await tmdb.tvSeries.list({
    language: lang,
    list: 'popular',
    page: 1,
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {dictionary.app_page.dashboard_title}
          </h1>

          <p className="text-muted-foreground">
            {dictionary.app_page.dashboard_description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 space-y-4 lg:grid-cols-[1fr,325px]">
        <div className="space-y-8">
          <Separator className="bg-muted/75" />
        </div>

        <div className="ml-0 space-y-16">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              {dictionary.app_page.popular_movies_title}
            </h4>

            <div className="flex flex-col space-y-8">
              {popularMovies.results.slice(0, 2).map((movie) => (
                <MovieCard movie={movie} key={movie.id} language={lang} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              {dictionary.app_page.popular_tv_shows_title}
            </h4>

            <div className="flex flex-col space-y-8">
              {popularTvShows.results.slice(0, 2).map((tvShow) => (
                <TvShowCard tvShow={tvShow} key={tvShow.id} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
