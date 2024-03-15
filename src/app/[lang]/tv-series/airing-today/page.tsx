import { getDictionary } from '@/utils/dictionaries'
import { PageProps } from '@/types/languages'
import { TvSeriesList } from '@/components/tv-series-list'
import { Metadata } from 'next'
import { Container } from '../../_components/container'

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    tv_serie_pages: {
      airing_today: { title, description },
    },
  } = await getDictionary(params.lang)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: '[PlotTwist]',
    },
    twitter: {
      title,
      description,
    },
  }
}

const AiringTodayTvSeriesPage = async ({ params: { lang } }: PageProps) => {
  const {
    tv_serie_pages: {
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

      <TvSeriesList variant="airing_today" />
    </Container>
  )
}

export default AiringTodayTvSeriesPage
