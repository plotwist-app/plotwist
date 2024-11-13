'use client'

import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'

type ReplyActionProps = {
  disabled?: boolean
  active?: boolean
} & ComponentProps<'div'>

const ReplyAction = ({ disabled, active, ...props }: ReplyActionProps) => {
  return (
    <span
      className={cn(
        'cursor-pointer text-xs text-muted-foreground underline-offset-1 hover:underline',
        disabled && 'pointer-events-none animate-pulse opacity-50',
        active && 'font-bold text-foreground',
      )}
      {...props}
    >
      {props.children}
    </span>
  )
}

export const ReviewReplyActions = () => {
  const { user } = useSession()
  const { dictionary } = useLanguage()

  if (!user) return <></>

  return (
    <div>
      <div className="flex items-center gap-2">
        <ReplyAction active={false} disabled={true} onClick={() => {}}>
          {dictionary.review_reply_actions.like}
        </ReplyAction>
      </div>
    </div>
  )
}
