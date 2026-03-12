import type { Metadata } from 'next'
import { Pricing } from '@/components/pricing'
import { tmdb } from '@/services/tmdb'
import { asLanguage, type PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { buildLanguageAlternates } from '@/utils/seo'
import { tmdbImage } from '@/utils/tmdb/image'
import { APP_URL } from '../../../constants'
import { AppDownload } from './_components/app-download'
import { FadeIn } from './_components/fade-in'
import { Features } from './_components/features'
import { FinalCta } from './_components/final-cta'
import { Hero } from './_components/hero'
import { PosterWall } from './_components/poster-wall'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)

  const image = `${APP_URL}/images/landing-page.jpg`

  const title = `${dictionary.perfect_place_for_watching} ${dictionary.everything}`
  const fullTitle = `${title} • Plotwist`
  const description = dictionary.manage_rate_discover

  return {
    title: {
      absolute: fullTitle,
    },
    description,
    keywords: dictionary.home.keywords,
    openGraph: {
      title: `Plotwist • ${title}`,
      description,
      siteName: 'Plotwist',
      url: APP_URL,
      images: [
        {
          url: image,
          width: 1280,
          height: 720,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
    },
    alternates: buildLanguageAlternates(lang, '/'),
  }
}

export default async function Home(props: PageProps) {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)
  const language = asLanguage(lang)

  const [movies, tvSeries] = await Promise.all([
    tmdb.movies.discover({
      language,
      page: 1,
      filters: { sort_by: 'popularity.desc' },
    }),
    tmdb.tv.discover({
      language,
      page: 1,
      filters: { sort_by: 'popularity.desc' },
    }),
  ])

  const posters = [
    ...movies.results.map(m => ({
      src: tmdbImage(m.poster_path, 'w500'),
      alt: m.title,
    })),
    ...tvSeries.results.map(t => ({
      src: tmdbImage(t.poster_path, 'w500'),
      alt: t.name,
    })),
  ].filter(p => p.src && !p.src.includes('null'))

  return (
    <main>
      <Hero dictionary={dictionary} />

      <PosterWall posters={posters} />

      <FadeIn>
        <Features dictionary={dictionary} />
      </FadeIn>

      <FadeIn delay={0.05}>
        <AppDownload dictionary={dictionary} />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Pricing />
      </FadeIn>

      <FadeIn delay={0.05}>
        <FinalCta dictionary={dictionary} language={lang} />
      </FadeIn>
    </main>
  )
}
