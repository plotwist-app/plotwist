import type { Metadata } from 'next'
import Link from 'next/link'

import { PosterCard } from '@/components/poster-card'
import { Separator } from '@plotwist/ui/components/ui/separator'
import { Container } from '../_components/container'

import { PopularReviews } from './_components/popular-reviews'
import { UserLastReview } from './_components/user-last-review'

import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

import { tmdb } from '@/services/tmdb'
import { tmdbImage } from '@/utils/tmdb/image'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const {
    app_page: { dashboard_title: title, dashboard_description: description },
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

const HomePage = async (props: PageProps) => {
  const params = await props.params
  const { lang } = params

  const dictionary = await getDictionary(lang)

  const popularMovies = await tmdb.movies.list({
    language: lang,
    list: 'popular',
    page: 1,
  })

  const popularTvSeries = await tmdb.tv.list({
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,325px] min-h-screen">
        <div className="space-y-8">
          <UserLastReview />
          <Separator className="bg-muted/75" />

          <PopularReviews />
        </div>

        <div className="mt-0 space-y-8">
          <div className="space-y-2">
            <Link
              href={`/${lang}/movies/popular`}
              className="text-lg font-semibold"
            >
              {dictionary.app_page.popular_movies_title}
            </Link>

            <div className="grid grid-cols-3 gap-2">
              {popularMovies.results.slice(0, 3).map(movie => (
                <Link href={`/${lang}/movies/${movie.id}`} key={movie.id}>
                  <PosterCard.Root>
                    <PosterCard.Image
                      src={tmdbImage(movie.poster_path, 'w500')}
                      alt={movie.title}
                    />
                  </PosterCard.Root>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href={`/${lang}/tv-series/popular`}
              className="text-lg font-semibold"
            >
              {dictionary.app_page.popular_tv_series_title}
            </Link>

            <div className="grid grid-cols-3 gap-2">
              {popularTvSeries.results.slice(0, 3).map(tv => (
                <Link href={`/${lang}/tv-series/${tv.id}`} key={tv.id}>
                  <PosterCard.Root>
                    <PosterCard.Image
                      src={tmdbImage(tv.poster_path, 'w500')}
                      alt={tv.name}
                    />
                  </PosterCard.Root>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default HomePage
