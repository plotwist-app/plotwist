import { Banner } from '@/components/banner'

import { tmdbImage } from '@/utils/tmdb/image'

import { Language } from '@/types/languages'
import { tmdb } from '@/services/tmdb'
import { TvSerieInfos } from './tv-serie-infos'
import { TvSerieTabs } from './tv-serie-tabs'

type TvSerieDetailsProps = {
  id: number
  language: Language
}

export const TvSerieDetails = async ({ id, language }: TvSerieDetailsProps) => {
  const tvSerie = await tmdb.tv.details(id, language)

  return (
    <div className="mx-auto max-w-6xl">
      <Banner url={tmdbImage(tvSerie.backdrop_path)} />

      <section className="mx-auto my-8 max-w-4xl space-y-6">
        <TvSerieInfos language={language} tvSerie={tvSerie} />
        <TvSerieTabs language={language} tvSerie={tvSerie} />
      </section>
    </div>
  )
}
