import type { Metadata } from 'next'
import type { PageProps } from '@/types/languages'
import { OnboardingProvider } from './_components/onboarding-context'
import { OnboardingStepper } from './_components/onboarding-stepper'
import { getDictionary } from '@/utils/dictionaries'

export const metadata: Metadata = {
  title: 'Onboarding • Plotwist',
  description: 'Tell us what movies you love.',
}

const OnboardingPage = async (props: PageProps) => {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)

  return (
    <OnboardingProvider dictionary={dictionary.onboarding}>
      <OnboardingStepper lang={lang} />
    </OnboardingProvider>
  )
}

export default OnboardingPage
