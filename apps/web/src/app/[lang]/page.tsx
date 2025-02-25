import type { Metadata } from 'next'

import { Pattern } from '@/components/pattern'
import { Pricing } from '@/components/pricing'

import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

import { APP_URL } from '../../../constants'

import { SUPPORTED_LANGUAGES } from '../../../languages'
import { Hero2 } from './_components/hero-2'
import { Images } from './_components/images'
import { Separator } from '@plotwist/ui/components/ui/separator'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)

  const image = `${APP_URL}/images/lp/home.png`
  const canonicalUrl = `${APP_URL}/${lang}`

  const languageAlternates = SUPPORTED_LANGUAGES.reduce(
    (acc, lang) => {
      if (lang.enabled) {
        acc[lang.hreflang] = `${APP_URL}/${lang.value}`
      }
      return acc
    },
    {} as Record<string, string>
  )

  const title = `${dictionary.organize} ${dictionary.movies_and_series} ${dictionary.never_been_easier}`

  const description = `${dictionary.most_apps_functional} ${dictionary.plotwist_incredible_interface}`

  return {
    title,
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
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
  }
}

export default async function Home() {
  return (
    <>
      <Pattern variant="checkered" />

      <main>
        <Hero2 />
        <Images />
        <Separator className="mt-32" />
        <Pricing />
      </main>
    </>
  )
}
