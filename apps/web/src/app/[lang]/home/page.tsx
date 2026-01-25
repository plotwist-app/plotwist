import { Separator } from '@plotwist/ui/components/ui/separator'
import type { Metadata } from 'next'
import { Link } from 'next-view-transitions'
import type { GetUserPreferences200 } from '@/api/endpoints.schemas'
import { getUserPreferences } from '@/api/users'
import { verifySession } from '@/app/lib/dal'
import { PosterCard } from '@/components/poster-card'
import { tmdb } from '@/services/tmdb'
import { asLanguage, type PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { tmdbImage } from '@/utils/tmdb/image'
import { Container } from '../_components/container'
import { NetworkActivity } from './_components/network-activity'
import { PopularReviews } from './_components/popular-reviews'
import { UserLastReview } from './_components/user-last-review'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const {
    app_page: { dashboard_title: title, dashboard_description: description },
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
  }
}

const HomePage = async (props: PageProps) => {
  const params = await props.params
  const { lang } = params

  const dictionary = await getDictionary(lang)
  const session = await verifySession()

  let userPreferences: GetUserPreferences200['userPreferences'] | null = null

  if (session) {
    const { userPreferences: userPreferencesData } = await getUserPreferences()
    userPreferences = userPreferencesData
  }

  const language = asLanguage(lang)

  const popularMovies = await tmdb.movies.discover({
    language,
    page: 1,
    filters: {
      with_watch_providers: userPreferences?.watchProvidersIds?.join('|'),
      watch_region: userPreferences?.watchRegion,
      sort_by: 'popularity.desc',
    },
  })

  const popularTvSeries = await tmdb.tv.discover({
    language,
    page: 1,
    filters: {
      with_watch_providers: userPreferences?.watchProvidersIds?.join('|'),
      watch_region: userPreferences?.watchRegion,
      sort_by: 'popularity.desc',
    },
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
          <NetworkActivity />
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
