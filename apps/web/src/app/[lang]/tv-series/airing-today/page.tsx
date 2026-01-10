import type { Metadata } from 'next'
import { TvSeriesList } from '@/components/tv-series-list'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Container } from '../../_components/container'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const {
    tv_serie_pages: {
      airing_today: { title, description },
    },
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

const AiringTodayTvSeriesPage = async (props: PageProps) => {
  const params = await props.params

  const { lang } = params

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
