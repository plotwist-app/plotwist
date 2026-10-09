'use client'

import { Input } from '@plotwist/ui/components/ui/input'
import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language'
import { track } from '@/lib/analytics'
import { createTogetherRoom, setTogetherToken } from '@/services/together'
import type { Language } from '@/types/languages'
import { PrimaryButton } from './primary-button'
import { TogetherProviderStep } from './together-provider-step'

function regionFromLanguage(language: Language) {
  return language.split('-')[1] ?? 'BR'
}

export function CreateInviteForm() {
  const { dictionary, language } = useLanguage()
  const router = useRouter()
  const copy = dictionary.together
  const [step, setStep] = useState<'providers' | 'name'>('providers')
  const [focusProviderHeading, setFocusProviderHeading] = useState(false)
  const [watchRegion, setWatchRegion] = useState(() =>
    regionFromLanguage(language)
  )
  const [watchProviderIds, setWatchProviderIds] = useState<number[]>([])
  const [displayName, setDisplayName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const nameHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (step === 'name') {
      nameHeadingRef.current?.focus()
    }
  }, [step])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!displayName.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      const session = await createTogetherRoom({
        displayName: displayName.trim(),
        watchProviderIds,
        watchRegion,
      })
      setTogetherToken(session.room.code, session.participantToken)
      track('room_created', {
        providerCount: watchProviderIds.length,
        region: watchRegion,
      })
      router.push(`/${language}/${session.room.code}`)
    } catch {
      toast.error(copy.create_error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'providers') {
    return (
      <TogetherProviderStep
        region={watchRegion}
        providerIds={watchProviderIds}
        focusHeading={focusProviderHeading}
        onRegionChange={setWatchRegion}
        onProviderIdsChange={setWatchProviderIds}
        onContinue={() => {
          setFocusProviderHeading(true)
          setStep('name')
        }}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h2
        ref={nameHeadingRef}
        className="together-title outline-none"
        tabIndex={-1}
      >
        {copy.create_heading}
      </h2>
      <label htmlFor="together-name" className="flex flex-col gap-2">
        <span className="together-label together-fg-muted">
          {copy.your_name}
        </span>
        <Input
          id="together-name"
          value={displayName}
          onChange={event => setDisplayName(event.target.value)}
          placeholder={copy.your_name_placeholder}
          maxLength={40}
        />
      </label>
      <PrimaryButton
        type="submit"
        disabled={!displayName.trim() || isSubmitting}
      >
        {isSubmitting ? copy.creating : copy.create_invite}
      </PrimaryButton>
      <button
        type="button"
        onClick={() => setStep('providers')}
        className="together-label together-fg-muted text-center underline-offset-4 hover:underline"
      >
        {copy.back}
      </button>
    </form>
  )
}
