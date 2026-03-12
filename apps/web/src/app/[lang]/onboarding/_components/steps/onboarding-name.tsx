'use client'

import { useEffect, useRef, useState } from 'react'
import { useOnboarding } from '../onboarding-context'

export function OnboardingName({ lang }: { lang: string }) {
  const { userName, setUserName, nextStep, dictionary } = useOnboarding()
  const [name, setName] = useState(userName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const canContinue = name.trim().length > 0

  const handleContinue = () => {
    if (canContinue) {
      setUserName(name.trim())
      nextStep()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleContinue()
    }
  }

  const title =
    dictionary?.name_title ||
    'Tell us your name so we can make Plotwist feel like yours'
  const placeholderText = dictionary?.name_placeholder || 'Your name'
  const cta = dictionary?.continue || 'Continue'

  return (
    <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-4">
      <div className="flex flex-col gap-6 text-center mt-12 md:mt-16 max-w-xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {title}
        </h1>

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholderText}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoCapitalize="words"
          autoCorrect="off"
          className="w-full rounded-xl bg-muted p-4 text-lg outline-none transition-colors border border-transparent focus:border-border mt-2 md:mt-4"
        />
      </div>

      <div className="mt-8 mx-auto w-full max-w-sm">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full rounded-full bg-foreground py-4 text-center font-semibold text-background transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {cta}
        </button>
      </div>
    </div>
  )
}
