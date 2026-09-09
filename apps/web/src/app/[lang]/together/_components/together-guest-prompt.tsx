'use client'

import Link from 'next/link'
import { useState } from 'react'

type TogetherGuestPromptProps = {
  language: string
  copy: {
    guest_prompt_title: string
    guest_prompt_body: string
    guest_prompt_sign_in: string
    continue_as_guest: string
  }
}

export function TogetherGuestPrompt({
  language,
  copy,
}: TogetherGuestPromptProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const redirect = encodeURIComponent(`/${language}/together`)

  return (
    <aside className="together-surface mb-6 rounded-[1.4rem] px-5 py-5">
      <h2 className="together-title">{copy.guest_prompt_title}</h2>
      <p className="together-body together-fg-muted mt-2">
        {copy.guest_prompt_body}
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Link
          href={`/${language}/sign-in?redirect=${redirect}`}
          className="together-btn-primary together-label flex h-12 items-center justify-center rounded-full transition-transform active:scale-[0.98]"
        >
          {copy.guest_prompt_sign_in}
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="together-label together-fg-muted h-11 text-center underline-offset-4 hover:underline"
        >
          {copy.continue_as_guest}
        </button>
      </div>
    </aside>
  )
}
