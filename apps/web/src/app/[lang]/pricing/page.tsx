import { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { Pattern } from '@/components/pattern'
import { Metadata } from 'next'
import { Pricing } from '@/components/pricing'

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
