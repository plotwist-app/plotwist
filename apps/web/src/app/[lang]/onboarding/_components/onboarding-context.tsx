'use client'

import { useRouter } from 'next/navigation'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

export type ContentType = 'movie' | 'tv' | 'anime' | 'dorama'

export interface SwipedItem {
  tmdbId: number
  mediaType: 'MOVIE' | 'TV_SHOW'
  status: 'WATCHED' | 'WATCHING' | 'WATCHLIST' | 'DROPPED'
}

export interface OnboardingState {
  currentStep: number
  userName: string
  contentTypes: ContentType[]
  genres: number[]
  savedTitlesCount: number
  swipedItems: SwipedItem[]
}

interface OnboardingContextType extends OnboardingState {
  setUserName: (name: string) => void
  setContentTypes: (types: ContentType[]) => void
  setGenres: (genres: number[]) => void
  incrementSavedTitles: () => void
  addSwipedItem: (item: SwipedItem) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  completeOnboarding: (lang?: string) => void
  isLoaded: boolean
  dictionary?: Record<string, string>
}

const defaultState: OnboardingState = {
  currentStep: 0,
  userName: '',
  contentTypes: [],
  genres: [],
  savedTitlesCount: 0,
  swipedItems: [],
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
)

const getStorageKey = (username?: string) => `plotwist-onboarding-state-${username || 'guest'}`
export function OnboardingProvider({
  children,
  dictionary,
  username,
}: {
  children: ReactNode
  dictionary?: Record<string, string>
  username?: string
}) {
  const router = useRouter()
  const [state, setState] = useState<OnboardingState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)

  const storageKey = getStorageKey(username)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)

        setState(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error('Failed to parse onboarding state', e)
      }
    }
    setIsLoaded(true)
  }, [storageKey])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          ...state,

          currentStep: state.currentStep > 4 ? 4 : state.currentStep,
        })
      )
    }
  }, [state, isLoaded, storageKey])

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

  const addSwipedItem = useCallback((item: SwipedItem) => {
    setState(s => ({ ...s, swipedItems: [...s.swipedItems, item] }))
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

  const completeOnboarding = useCallback(
    (lang: string = 'en-US') => {
      localStorage.setItem(`plotwist-onboarding-complete-${username || 'guest'}`, 'true')
      router.push(`/${lang}/${username || 'home'}`)
    },
    [router, username]
  )

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        setUserName,
        setContentTypes,
        setGenres,
        incrementSavedTitles,
        addSwipedItem,
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
