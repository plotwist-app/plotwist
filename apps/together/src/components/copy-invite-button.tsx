'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language'

type CopyInviteButtonProps = {
  value: string
}

export function CopyInviteButton({ value }: CopyInviteButtonProps) {
  const { dictionary } = useLanguage()
  const copy = dictionary.together
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(copy.copied)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(copy.copy_error)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="together-btn-secondary together-label flex h-[52px] w-full items-center justify-center gap-2 rounded-full transition-colors"
    >
      {copied ? <Check className="size-4" /> : null}
      {copied ? copy.copied : copy.copy_invite}
    </button>
  )
}
