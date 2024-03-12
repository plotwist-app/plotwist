import { MovieCard } from '@/components/movie-card'
import { Separator } from '@/components/ui/separator'
import { TvSerieCard } from '@/components/tv-serie-card'

import { PageProps } from '@/types/languages'
import { tmdb } from '@/services/tmdb'
import { getDictionary } from '@/utils/dictionaries'
import { Metadata } from 'next'
import { Container } from '../_components/container'

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    app_page: { dashboard_title: title, dashboard_description: description },
  } = await getDictionary(params.lang)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: '[TMDB]',
    },
    twitter: {
      title,
      description,
    },
  }
}

const HomePage = async ({ params: { lang } }: PageProps) => {
  const dictionary = await getDictionary(lang)

  const popularMovies = await tmdb.movies.list({
    language: lang,
    list: 'popular',
    page: 1,
  })

  const popularTvSeries = await tmdb.tvSeries.list({
    language: lang,
    list: 'popular',
    page: 1,
  })

  return (
    <Container>
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
              {dictionary.app_page.popular_tv_series_title}
            </h4>

            <div className="flex flex-col space-y-8">
              {popularTvSeries.results.slice(0, 2).map((tvSerie) => (
                <TvSerieCard tvSerie={tvSerie} key={tvSerie.id} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default HomePage
