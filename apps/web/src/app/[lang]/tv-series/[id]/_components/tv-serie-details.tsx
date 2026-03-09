import { Suspense } from 'react'
import { Banner } from '@/components/banner'
import { BreadcrumbJsonLd, TvSeriesJsonLd } from '@/components/structured-data'

import { tmdb } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import { TvSerieInfos } from './tv-serie-infos'
import { TvSerieTabs } from './tv-serie-tabs'

type TvSerieDetailsProps = {
  id: number
  language: Language
}

export const TvSerieDetails = async ({ id, language }: TvSerieDetailsProps) => {
  const tvSerie = await tmdb.tv.details(id, language)

  return (
    <div className="mx-auto max-w-6xl relative">
      <BreadcrumbJsonLd
        items={[
          { name: 'Plotwist', url: `https://plotwist.app/${language}` },
          {
            name: 'TV Series',
            url: `https://plotwist.app/${language}/tv-series/popular`,
          },
          {
            name: tvSerie.name,
            url: `https://plotwist.app/${language}/tv-series/${id}`,
          },
        ]}
      />
      <TvSeriesJsonLd
        name={tvSerie.name}
        description={tvSerie.overview}
        image={tmdbImage(tvSerie.backdrop_path)}
        url={`https://plotwist.app/${language}/tv-series/${id}`}
      />
      <Banner url={tmdbImage(tvSerie.backdrop_path)} />

      <section className="mx-auto my-8 max-w-4xl space-y-6">
        <TvSerieInfos language={language} tvSerie={tvSerie} />

        <Suspense>
          <TvSerieTabs language={language} tvSerie={tvSerie} />
        </Suspense>
      </section>
    </div>
  )
}
