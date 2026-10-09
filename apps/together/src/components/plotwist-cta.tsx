'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'
import { PLOTWIST_URL } from '@/lib/constants'

type PlotwistCtaProps = {
  language: string
  copy: {
    plotwist_cta_title: string
    plotwist_cta_body: string
    plotwist_cta_button: string
    plotwist_cta_dismiss: string
  }
}

export function buildPlotwistSignUpUrl(language: string) {
  const params = new URLSearchParams({
    utm_source: 'together',
    utm_medium: 'referral',
    utm_campaign: 'together_mvp',
  })

  return `${PLOTWIST_URL}/${language}/sign-up?${params.toString()}`
}

export function PlotwistCta({ language, copy }: PlotwistCtaProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <aside className="together-surface mb-6 rounded-[1.4rem] px-5 py-5">
      <h2 className="together-title">{copy.plotwist_cta_title}</h2>
      <p className="together-body together-fg-muted mt-2">
        {copy.plotwist_cta_body}
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <a
          href={buildPlotwistSignUpUrl(language)}
          onClick={() => track('plotwist_cta_clicked')}
          className="together-btn-primary together-label flex h-12 items-center justify-center rounded-full transition-transform active:scale-[0.98]"
        >
          {copy.plotwist_cta_button}
        </a>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="together-label together-fg-muted h-11 text-center underline-offset-4 hover:underline"
        >
          {copy.plotwist_cta_dismiss}
        </button>
      </div>
    </aside>
  )
}
