'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export type ContentType = 'movie' | 'tv' | 'anime' | 'dorama'

export interface OnboardingState {
  currentStep: number
  userName: string
  contentTypes: ContentType[]
  genres: number[]
  savedTitlesCount: number
}

interface OnboardingContextType extends OnboardingState {
  setUserName: (name: string) => void
  setContentTypes: (types: ContentType[]) => void
  setGenres: (genres: number[]) => void
  incrementSavedTitles: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  completeOnboarding: () => void
  isLoaded: boolean
  dictionary?: Record<string, string>
}

const defaultState: OnboardingState = {
  currentStep: 0,
  userName: '',
  contentTypes: [],
  genres: [],
  savedTitlesCount: 0,
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const STORAGE_KEY = 'plotwist-onboarding-state'

export function OnboardingProvider({ 
  children,
  dictionary
}: { 
  children: ReactNode
  dictionary?: Record<string, string>
}) {
  const router = useRouter()
  const [state, setState] = useState<OnboardingState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)


  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)

        setState(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error('Failed to parse onboarding state', e)
      }
    }
    setIsLoaded(true)
  }, [])


  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,

        currentStep: state.currentStep > 4 ? 4 : state.currentStep 
      }))
    }
  }, [state, isLoaded])

  const setUserName = useCallback((userName: string) => {
    setState(s => ({ ...s, userName }))
  }, [])

  const setContentTypes = useCallback((contentTypes: ContentType[]) => {
    setState(s => ({ ...s, contentTypes }))
  }, [])

  const setGenres = useCallback((genres: number[]) => {
    setState(s => ({ ...s, genres }))
  }, [])

  const incrementSavedTitles = useCallback(() => {
    setState(s => ({ ...s, savedTitlesCount: s.savedTitlesCount + 1 }))
  }, [])

  const nextStep = useCallback(() => {
    setState(s => ({ ...s, currentStep: Math.min(s.currentStep + 1, 5) }))
  }, [])

  const prevStep = useCallback(() => {
    setState(s => ({ ...s, currentStep: Math.max(s.currentStep - 1, 0) }))
  }, [])

  const goToStep = useCallback((step: number) => {
    setState(s => ({ ...s, currentStep: step }))
  }, [])

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('plotwist-onboarding-complete', 'true')
    router.push('/')
  }, [router])

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        setUserName,
        setContentTypes,
        setGenres,
        incrementSavedTitles,
        nextStep,
        prevStep,
        goToStep,
        completeOnboarding,
        isLoaded,
        dictionary,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
