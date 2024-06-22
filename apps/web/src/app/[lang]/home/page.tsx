import Link from 'next/link'
import { Metadata } from 'next'
import { tmdb } from '@plotwist/tmdb'

import { Separator } from '@/components/ui/separator'
import { PosterCard } from '@/components/poster-card'
import { Container } from '../_components/container'

import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

import { tmdbImage } from '@/utils/tmdb/image'

import { UserLastReview } from '@/app/[lang]/_components/user-last-review'
import { PopularReviews } from '@/app/[lang]/_components/popular-reviews'

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
      siteName: 'Plotwist',
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,325px]">
        <div className="space-y-8">
          <UserLastReview />
          <Separator className="bg-muted/75" />
          <PopularReviews />
        </div>

        <div className="mt-0 space-y-8">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              {dictionary.app_page.popular_movies_title}
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {popularMovies.results.slice(0, 2).map((movie) => (
                <Link href={`/${lang}/movies/${movie.id}`} key={movie.id}>
                  <PosterCard.Root>
                    <PosterCard.Image
                      src={tmdbImage(movie.poster_path, 'w500')}
                      alt={movie.title}
                    />

                    <PosterCard.Details>
                      <PosterCard.Title>{movie.title}</PosterCard.Title>
                      <PosterCard.Year>
                        {movie.release_date.split('-')[0]}
                      </PosterCard.Year>
                    </PosterCard.Details>
                  </PosterCard.Root>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">
              {dictionary.app_page.popular_tv_series_title}
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {popularTvSeries.results.slice(0, 2).map((tv) => (
                <Link href={`/${lang}/movies/${tv.id}`} key={tv.id}>
                  <PosterCard.Root>
                    <PosterCard.Image
                      src={tmdbImage(tv.poster_path, 'w500')}
                      alt={tv.name}
                    />

                    <PosterCard.Details>
                      <PosterCard.Title>{tv.name}</PosterCard.Title>
                      <PosterCard.Year>
                        {tv.first_air_date.split('-')[0]}
                      </PosterCard.Year>
                    </PosterCard.Details>
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
