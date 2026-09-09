'use client'

import { useState } from 'react'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { CreateInviteForm } from './create-invite-form'
import { JoinInviteForm } from './join-invite-form'
import { TogetherGuestPrompt } from './together-guest-prompt'
import { TogetherMark } from './together-mark'
import { TogetherShell } from './together-shell'

export function WelcomeScreen() {
  const { dictionary, language } = useLanguage()
  const { user } = useSession()
  const copy = dictionary.together
  const [joining, setJoining] = useState(false)

  return (
    <TogetherShell>
      {joining ? (
        <>
          <JoinInviteForm />
          <button
            type="button"
            onClick={() => setJoining(false)}
            className="together-label together-fg-muted mt-8 text-center underline-offset-4 hover:underline"
          >
            {copy.back}
          </button>
        </>
      ) : (
        <>
          <TogetherMark />
          <p className="together-kicker together-fg-accent mt-6">
            {copy.group_kicker}
          </p>
          <h1 className="together-display mt-3">{copy.title}</h1>
          <p className="together-body together-fg-muted mt-4 mb-9 max-w-[22rem]">
            {copy.subtitle}
          </p>
          {!user && <TogetherGuestPrompt language={language} copy={copy} />}
          <CreateInviteForm />
          <button
            type="button"
            onClick={() => setJoining(true)}
            className="together-label together-fg-muted mt-7 text-center underline-offset-4 hover:underline"
          >
            {copy.have_invite}
          </button>
        </>
      )}
    </TogetherShell>
  )
}
