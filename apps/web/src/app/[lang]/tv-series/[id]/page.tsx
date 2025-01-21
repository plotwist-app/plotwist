import type { Metadata } from 'next'

import { getTvSeriesIds } from '@/utils/seo/get-tv-series-ids'
import { getTvMetadata } from '@/utils/seo/get-tv-metadata'
import type { PageProps } from '@/types/languages'
import { TvSerieDetails } from './_components/tv-serie-details'

export type TvSeriePageProps = PageProps<{ id: string }>

export async function generateStaticParams() {
  const tvSeriesIds = await getTvSeriesIds()
  return tvSeriesIds.map(id => ({ id: String(id) }))
}

export async function generateMetadata(
  props: TvSeriePageProps
): Promise<Metadata> {
  const { lang, id } = await props.params
  const metadata = await getTvMetadata(Number(id), lang)

  return metadata
}

export default async function TvSeriePage(props: TvSeriePageProps) {
  const { id, lang } = await props.params

  return <TvSerieDetails id={Number(id)} language={lang} />
}
