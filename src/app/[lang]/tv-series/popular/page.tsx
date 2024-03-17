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
      popular: { title, description },
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

const PopularTvSeriesPage = async ({ params: { lang } }: PageProps) => {
  const {
    tv_serie_pages: {
      popular: { title, description },
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

      <TvSeriesList variant="popular" />
    </Container>
  )
}

export default PopularTvSeriesPage
