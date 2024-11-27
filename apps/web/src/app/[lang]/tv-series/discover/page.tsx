import { TvSeriesList } from '@/components/tv-series-list'
import { TvSeriesListFilters } from '@/components/tv-series-list-filters'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import type { Metadata } from 'next'
import { Container } from '../../_components/container'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const {
    tv_serie_pages: {
      discover: { title, description },
    },
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

const DiscoverTvSeriesPage = async (props: PageProps) => {
  const params = await props.params;

  const {
    lang
  } = params;

  const {
    tv_serie_pages: {
      discover: { title, description },
    },
  } = await getDictionary(lang)

  return (
    <Container>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <TvSeriesListFilters />
      </div>

      <TvSeriesList variant="discover" />
    </Container>
  )
}

export default DiscoverTvSeriesPage
