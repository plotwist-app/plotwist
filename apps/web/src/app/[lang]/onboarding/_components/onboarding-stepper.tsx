'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useOnboarding } from './onboarding-context'
import { OnboardingWelcome } from './steps/onboarding-welcome'
import { OnboardingName } from './steps/onboarding-name'
import { OnboardingContentTypes } from './steps/onboarding-content-types'
import { OnboardingGenres } from './steps/onboarding-genres'
import { OnboardingSwiper } from './onboarding-swiper'
import { OnboardingCelebration } from './steps/onboarding-celebration'

const TOTAL_STEPS = 4 // Steps 1-4 (Welcome is 0, Celebration is 5)

export function OnboardingStepper({ lang }: { lang: string }) {
  const { currentStep, prevStep, isLoaded } = useOnboarding()

  if (!isLoaded) return null // Prevent hydration mismatch

  const isWelcomeScreen = currentStep === 0
  const isCelebrationScreen = currentStep === 5

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      {!isWelcomeScreen && !isCelebrationScreen && (
        <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 w-full max-w-6xl mx-auto">
          <button
            type="button"
            onClick={prevStep}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 transition-colors hover:bg-muted"
            aria-label="Go back"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="flex flex-1 items-center justify-end gap-3 px-8 md:max-w-md ml-auto">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < currentStep ? 'bg-foreground' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </header>
      )}

      <main className={`flex flex-1 flex-col overflow-x-hidden relative z-20 ${!isWelcomeScreen ? 'pt-24 md:pt-32 pb-12 w-full max-w-6xl mx-auto' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-1 flex-col h-full"
          >
            {currentStep === 0 && <OnboardingWelcome lang={lang} />}
            {currentStep === 1 && <OnboardingName lang={lang} />}
            {currentStep === 2 && <OnboardingContentTypes lang={lang} />}
            {currentStep === 3 && <OnboardingGenres lang={lang} />}
            {currentStep === 4 && <OnboardingSwiper lang={lang} />}
            {currentStep === 5 && <OnboardingCelebration lang={lang} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {isWelcomeScreen && (
        <main className="flex flex-1 flex-col absolute inset-0 z-10">
          <OnboardingWelcome lang={lang} />
        </main>
      )}
    </div>
  )
}
