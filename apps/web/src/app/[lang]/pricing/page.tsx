import { Pattern } from '@/components/pattern'
import { Pricing } from '@/components/pricing'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import type { Metadata } from 'next'

export async function generateMetadata({
  params: { lang },
}: PageProps): Promise<Metadata> {
  const {
    home_prices: { title, description },
  } = await getDictionary(lang)

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
