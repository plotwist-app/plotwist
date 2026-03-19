import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import type { PageProps } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { verifySession } from '@/app/lib/dal'
import { OnboardingProvider } from './_components/onboarding-context'
import { OnboardingStepper } from './_components/onboarding-stepper'

export const metadata: Metadata = {
  title: 'Onboarding • Plotwist',
  description: 'Tell us what movies you love.',
}

const OnboardingPage = async (props: PageProps) => {
  const { lang } = await props.params
  const dictionary = await getDictionary(lang)
  const session = await verifySession()

  if (!session) {
    redirect(`/${lang}/sign-in`)
  }

  if (session.user.displayName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 w-full">
        <h1 className="text-2xl font-bold mb-4">
          {dictionary.onboarding.celebration_title || 'You’re all set!'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {dictionary.onboarding.celebration_subtitle || 'Your profile is ready. Let’s start tracking.'}
        </p>
        <a 
          href={`/${lang}/${session.user.username}`} 
          className="px-8 py-3 bg-foreground text-background rounded-full font-semibold transition-transform active:scale-95"
        >
          {dictionary.onboarding.celebration_cta || 'Go to Profile'}
        </a>
      </div>
    )
  }

  return (
    <OnboardingProvider dictionary={dictionary.onboarding} username={session.user.username}>
      <OnboardingStepper lang={lang} />
    </OnboardingProvider>
  )
}

export default OnboardingPage
