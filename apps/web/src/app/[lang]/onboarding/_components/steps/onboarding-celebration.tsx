'use client'

import { CheckCircle } from 'lucide-react'
import { useOnboarding } from '../onboarding-context'

export function OnboardingCelebration({ lang }: { lang: string }) {
  const { completeOnboarding, dictionary } = useOnboarding()

  const title = dictionary?.celebration_title || "You're all set!"
  const subtitle =
    dictionary?.celebration_subtitle ||
    "Your profile is ready. Let's start tracking."
  const cta = dictionary?.celebration_cta || 'Go to Home'

  return (
    <div className="flex flex-1 h-full flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <CheckCircle className="h-24 w-24 text-green-500 animate-in zoom-in duration-500" />
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>

        <button
          onClick={completeOnboarding}
          className="mt-8 w-full max-w-sm rounded-full bg-foreground py-4 text-center font-semibold text-background transition-transform active:scale-95"
        >
          {cta}
        </button>
      </div>
    </div>
  )
}
