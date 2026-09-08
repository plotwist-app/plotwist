'use client'

import { Input } from '@plotwist/ui/components/ui/input'
import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { useUserPreferences } from '@/context/user-preferences'
import { createTogetherRoom, setTogetherToken } from '@/services/together'
import { PrimaryButton } from './primary-button'
import { TogetherProviderStep } from './together-provider-step'

export function CreateInviteForm() {
  const { dictionary, language } = useLanguage()
  const { user } = useSession()
  const { userPreferences } = useUserPreferences()
  const router = useRouter()
  const copy = dictionary.together
  const [step, setStep] = useState<'providers' | 'name'>('providers')
  const [watchRegion, setWatchRegion] = useState(
    (user && userPreferences?.watchRegion) || 'BR'
  )
  const [watchProviderIds, setWatchProviderIds] = useState<number[]>(
    user && userPreferences?.watchProvidersIds
      ? [...userPreferences.watchProvidersIds]
      : []
  )
  const [displayName, setDisplayName] = useState(
    user?.displayName || user?.username || ''
  )
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
      router.push(`/${language}/together/${session.room.code}`)
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
        onRegionChange={setWatchRegion}
        onProviderIdsChange={setWatchProviderIds}
        onContinue={() => setStep('name')}
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
