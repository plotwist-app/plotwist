'use client'

import { CopyInviteButton } from './copy-invite-button'
import { PrimaryButton } from './primary-button'
import { TogetherMark } from './together-mark'
import { TogetherShell } from './together-shell'

type InviteScreenProps = {
  hostName: string
  inviteCode: string
  inviteUrl: string
  participantCount: number
  maxParticipants: number
  copy: {
    night_for_two: string
    host_invite_title: string
    invite_help: string
    continue_as_host: string
    invite_code_label: string
    up_to_four: string
    room_capacity: string
    send_whatsapp: string
    share_text: string
  }
  onContinue: () => void
}

export function InviteScreen({
  hostName,
  inviteCode,
  inviteUrl,
  participantCount,
  maxParticipants,
  copy,
  onContinue,
}: InviteScreenProps) {
  function handleWhatsApp() {
    const text = `${copy.share_text.replace('{name}', hostName)} ${inviteUrl}`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <TogetherShell>
      <TogetherMark />
      <p className="together-kicker together-fg-accent mt-6">
        {copy.night_for_two}
      </p>
      <h1 className="together-display mt-3">
        {copy.host_invite_title.replace('{name}', hostName)}
      </h1>
      <p className="together-body together-fg-muted mt-3">{copy.invite_help}</p>

      <div className="together-ticket mt-8 rounded-[1.4rem] px-6 py-6">
        <p className="together-kicker">{copy.up_to_four}</p>
        <p className="together-meta mt-2">
          {copy.room_capacity
            .replace('{current}', String(participantCount))
            .replace('{max}', String(maxParticipants))}
        </p>
        <p className="together-code mt-4">{inviteCode}</p>
        <div className="together-perforation my-5" />
        <p className="together-meta">{copy.invite_code_label}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <PrimaryButton onClick={handleWhatsApp}>
          {copy.send_whatsapp}
        </PrimaryButton>
        <CopyInviteButton value={inviteUrl} />
        <button
          type="button"
          onClick={onContinue}
          className="together-label together-fg-muted h-12 underline-offset-4 hover:underline"
        >
          {copy.continue_as_host}
        </button>
      </div>
    </TogetherShell>
  )
}
