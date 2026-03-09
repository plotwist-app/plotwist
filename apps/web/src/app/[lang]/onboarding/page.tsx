import type { Metadata } from 'next'
import type { PageProps } from '@/types/languages'
import { OnboardingSwiper } from './_components/onboarding-swiper'

export const metadata: Metadata = {
  title: 'Onboarding • Plotwist',
  description: 'Tell us what movies you love.',
}

const OnboardingPage = async (props: PageProps) => {
  const { lang } = await props.params

  return <OnboardingSwiper lang={lang} />
}

export default OnboardingPage
