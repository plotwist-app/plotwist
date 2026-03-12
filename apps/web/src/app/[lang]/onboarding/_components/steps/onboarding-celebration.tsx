'use client'

import { useOnboarding } from '../onboarding-context'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { usePutUserItem } from '@/api/user-items'

export function OnboardingCelebration({ lang }: { lang: string }) {
  const { completeOnboarding, dictionary, swipedItems } = useOnboarding()
  const putUserItem = usePutUserItem()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleComplete = async () => {
    try {
      setIsSubmitting(true)
      
      const promises = swipedItems.map(item => 
        putUserItem.mutateAsync({
           data: { mediaType: item.mediaType, tmdbId: item.tmdbId, status: item.status }
        })
      )
      
      await Promise.allSettled(promises)
    } catch (e) {
      console.error('Failed to sync swiped items', e)
    } finally {
      setIsSubmitting(false)
      completeOnboarding(lang)
    }
  }

  const title = dictionary?.celebration_title || "You're all set!"
  const subtitle = dictionary?.celebration_subtitle || "Your profile is ready. Let's start tracking."
  const cta = dictionary?.celebration_cta || "Go to Home"

  return (
    <div className="flex flex-1 h-full flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 animate-in zoom-in duration-500" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          {subtitle}
        </p>

        <button
          onClick={handleComplete}
          disabled={isSubmitting}
          className="mt-6 w-full max-w-xs rounded-full bg-foreground py-3 text-center text-sm font-semibold text-background transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : null}
          <span>{isSubmitting ? (dictionary?.syncing || "Saving profile...") : cta}</span>
        </button>
      </div>
    </div>
  )
}
