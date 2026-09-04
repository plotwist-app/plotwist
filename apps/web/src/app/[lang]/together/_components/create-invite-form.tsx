'use client'

import { Input } from '@plotwist/ui/components/ui/input'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { createTogetherRoom, setTogetherToken } from '@/services/together'
import { PrimaryButton } from './primary-button'

export function CreateInviteForm() {
  const { dictionary, language } = useLanguage()
  const { user } = useSession()
  const router = useRouter()
  const copy = dictionary.together
  const [displayName, setDisplayName] = useState(
    user?.displayName || user?.username || ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!displayName.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      const session = await createTogetherRoom({
        displayName: displayName.trim(),
      })
      setTogetherToken(session.room.code, session.participantToken)
      router.push(`/${language}/together/${session.room.code}`)
    } catch {
      toast.error(copy.create_error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          autoFocus
        />
      </label>
      <PrimaryButton
        type="submit"
        disabled={!displayName.trim() || isSubmitting}
      >
        {isSubmitting ? copy.creating : copy.create_invite}
      </PrimaryButton>
    </form>
  )
}
