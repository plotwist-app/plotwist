import { getDictionary } from '@/utils/dictionaries'
import { PageProps } from '@/types/languages'
import { TvShowsList } from '@/components/tv-shows-list'
import { Metadata } from 'next'
import { Container } from '../../_components/container'

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    tv_show_pages: {
      airing_today: { title, description },
    },
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

const AiringTodayTvShowsPage = async ({ params: { lang } }: PageProps) => {
  const {
    tv_show_pages: {
      airing_today: { title, description },
    },
  } = await getDictionary(lang)

  return (
    <Container>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <TvShowsList variant="airing_today" />
    </Container>
  )
}

export default AiringTodayTvShowsPage
