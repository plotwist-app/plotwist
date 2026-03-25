'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useOnboarding } from './onboarding-context'
import { OnboardingSwiper } from './onboarding-swiper'
import { OnboardingCelebration } from './steps/onboarding-celebration'
import { OnboardingContentTypes } from './steps/onboarding-content-types'
import { OnboardingGenres } from './steps/onboarding-genres'
import { OnboardingName } from './steps/onboarding-name'
import { OnboardingWelcome } from './steps/onboarding-welcome'

const TOTAL_STEPS = 4

export function OnboardingStepper({ lang }: { lang: string }) {
  const { currentStep, prevStep, isLoaded } = useOnboarding()

  if (!isLoaded) return null

  const isWelcomeScreen = currentStep === 0
  const isCelebrationScreen = currentStep === 5

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col ${isWelcomeScreen ? 'bg-black' : 'bg-background'}`}
    >
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

          <div className="flex flex-1 items-center justify-end gap-2 px-8 md:max-w-md ml-auto">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const stepIndex = i + 1
              const isActive = stepIndex === currentStep
              const isCompleted = stepIndex < currentStep

              return (
                <motion.div
                  key={stepIndex}
                  layout
                  className={`flex-1 rounded-full ${
                    isCompleted
                      ? 'bg-foreground'
                      : isActive
                        ? 'bg-foreground'
                        : 'bg-muted'
                  }`}
                  animate={{
                    height: isActive ? 6 : 4,
                    opacity: isActive ? 1 : isCompleted ? 0.7 : 0.3,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )
            })}
          </div>
        </header>
      )}

      <main
        className={`flex flex-1 flex-col overflow-x-hidden relative z-20 ${!isWelcomeScreen ? 'pt-24 md:pt-32 pb-12 w-full max-w-6xl mx-auto' : ''}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: currentStep <= 1 ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: currentStep === 0 ? 0 : -20 }}
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
    </div>
  )
}
