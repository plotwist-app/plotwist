'use client'

import { useState } from 'react'
import { useLanguage } from '@/context/language'
import { CreateInviteForm } from './create-invite-form'
import { JoinInviteForm } from './join-invite-form'
import { TogetherMark } from './together-mark'
import { TogetherShell } from './together-shell'

export function WelcomeScreen() {
  const { dictionary } = useLanguage()
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
            {copy.night_for_two}
          </p>
          <h1 className="together-display mt-3">{copy.title}</h1>
          <p className="together-body together-fg-muted mt-4 mb-9 max-w-[22rem]">
            {copy.subtitle}
          </p>
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
