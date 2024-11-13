'use client'

import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'

import { ReviewItemProps } from './review-item'

type ReviewItemActionsProps = {
  openReplyForm: boolean
  setOpenReplyForm: (param: boolean) => void
} & Pick<ReviewItemProps, 'review'>

type ReviewItemActionProps = {
  disabled?: boolean
  active?: boolean
} & ComponentProps<'div'>

const ReviewItemAction = ({
  disabled,
  active,
  className,
  ...props
}: ReviewItemActionProps) => {
  return (
    <span
      className={cn(
        'cursor-pointer text-xs text-muted-foreground underline-offset-1 hover:underline',
        disabled && 'pointer-events-none animate-pulse opacity-50',
        active && 'font-bold text-foreground',
        className,
      )}
      {...props}
    >
      {props.children}
    </span>
  )
}

export const ReviewItemActions = ({
  openReplyForm,
  setOpenReplyForm,
}: ReviewItemActionsProps) => {
  const { user } = useSession()
  const { dictionary } = useLanguage()

  if (!user) return null

  return (
    <div>
      <div className="flex items-center space-x-2">
        <ReviewItemAction active={false} disabled={true} onClick={() => {}}>
          {dictionary.review_item_actions.like}
        </ReviewItemAction>

        <span className="h-1 w-1 rounded-full bg-muted-foreground" />

        <ReviewItemAction
          onClick={() => setOpenReplyForm(!openReplyForm)}
          disabled={true}
        >
          {dictionary.review_item_actions.reply}
        </ReviewItemAction>
      </div>
    </div>
  )
}
