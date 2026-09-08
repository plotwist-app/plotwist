'use client'

import { Input } from '@plotwist/ui/components/ui/input'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language'
import {
  isTogetherRoomFullError,
  joinTogetherRoom,
  setTogetherToken,
} from '@/services/together'
import { PrimaryButton } from './primary-button'
import { TogetherMark } from './together-mark'

type JoinInviteFormProps = {
  code?: string
  hostName?: string
  participantCount?: number
  maxParticipants?: number
  onJoined?: () => void
  onRoomFull?: () => void
}

export function JoinInviteForm({
  code,
  hostName,
  participantCount,
  maxParticipants,
  onJoined,
  onRoomFull,
}: JoinInviteFormProps) {
  const { dictionary, language } = useLanguage()
  const router = useRouter()
  const copy = dictionary.together
  const [inviteCode, setInviteCode] = useState(code ?? '')
  const [displayName, setDisplayName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [roomFull, setRoomFull] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const roomCode = inviteCode.trim().toUpperCase()
    if (!displayName.trim() || !roomCode || isSubmitting) return
    setIsSubmitting(true)
    try {
      const session = await joinTogetherRoom(roomCode, {
        displayName: displayName.trim(),
      })
      setTogetherToken(session.room.code, session.participantToken)
      if (onJoined) {
        onJoined()
        return
      }
      router.push(`/${language}/together/${session.room.code}`)
    } catch (error) {
      if (isTogetherRoomFullError(error)) {
        setRoomFull(true)
        onRoomFull?.()
        return
      }
      toast.error(copy.join_error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (roomFull) {
    return (
      <>
        <TogetherMark />
        <h1 className="together-display mt-8">{copy.room_full_title}</h1>
        <p className="together-body together-fg-muted mt-3">
          {copy.room_full_body}
        </p>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <TogetherMark />
      <div>
        <p className="together-kicker together-fg-accent mt-6">
          {copy.group_kicker}
        </p>
        <h1 className="together-display mt-3">
          {hostName
            ? copy.join_title.replace('{name}', hostName)
            : copy.have_invite_title}
        </h1>
        <p className="together-body together-fg-muted mt-3">
          {copy.join_subtitle}
        </p>
        {participantCount !== undefined && maxParticipants !== undefined && (
          <p className="together-meta together-fg-muted mt-2">
            {copy.room_capacity
              .replace('{current}', String(participantCount))
              .replace('{max}', String(maxParticipants))}
          </p>
        )}
      </div>

      {!code && (
        <label htmlFor="together-code" className="flex flex-col gap-2">
          <span className="together-label together-fg-muted">
            {copy.invite_code_label}
          </span>
          <Input
            id="together-code"
            value={inviteCode}
            onChange={event => setInviteCode(event.target.value.toUpperCase())}
            placeholder={copy.invite_code_placeholder}
            maxLength={8}
            autoCapitalize="characters"
          />
        </label>
      )}

      <label htmlFor="together-join-name" className="flex flex-col gap-2">
        <span className="together-label together-fg-muted">
          {copy.your_name}
        </span>
        <Input
          id="together-join-name"
          value={displayName}
          onChange={event => setDisplayName(event.target.value)}
          placeholder={copy.your_name_placeholder}
          maxLength={40}
          autoFocus
        />
      </label>

      <PrimaryButton
        type="submit"
        disabled={!displayName.trim() || !inviteCode.trim() || isSubmitting}
      >
        {isSubmitting ? copy.joining : copy.join}
      </PrimaryButton>
    </form>
  )
}
