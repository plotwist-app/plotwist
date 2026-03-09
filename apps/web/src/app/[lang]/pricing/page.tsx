import type { Metadata } from 'next'
import { Pattern } from '@/components/pattern'
import { Pricing } from '@/components/pricing'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { buildLanguageAlternates } from '@/utils/seo'

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params

  const { lang } = params

  const {
    home_prices: { title, description },
  } = await getDictionary(lang)

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
    alternates: buildLanguageAlternates(lang, '/pricing'),
  }
}

const PricingPage = async () => {
  return (
    <>
      <Pattern variant="checkered" />

      <div className="flex min-h-[100dvh] items-center justify-center">
        <Pricing />
      </div>
    </>
  )
}

export default PricingPage
