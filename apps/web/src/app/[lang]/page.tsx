import { Separator } from '@plotwist/ui/components/ui/separator'
import type { Metadata } from 'next'
import { Pattern } from '@/components/pattern'
import { Pricing } from '@/components/pricing'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { buildLanguageAlternates } from '@/utils/seo'
import { APP_URL } from '../../../constants'
import { Hero } from './_components/hero'
import { Images } from './_components/images'

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

  return (
    <>
      <Pattern variant="checkered" />

      <main>
        <Hero dictionary={dictionary} />
        <Images />
        <Separator className="mt-32" />
        <Pricing />
      </main>
    </>
  )
}
