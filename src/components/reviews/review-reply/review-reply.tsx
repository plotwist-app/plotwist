'use client'

import { useLanguage } from '@/context/language'
import { Review } from '@/types/supabase/reviews'
import { useState } from 'react'

interface RepliesProps {
  usernameInitial: string
  username: string
  replies: Review['review_replies']
}

export const Replies = ({
  usernameInitial,
  username,
  replies,
}: RepliesProps) => {
  const [openReplies, setOpenReplies] = useState(false)
  const { dictionary } = useLanguage()

  if (!replies) return <></>

  return (
    <div className="pt-2">
      <button
        onClick={() => setOpenReplies(!openReplies)}
        className="flex items-center self-start text-sm text-muted-foreground"
        type="button"
      >
        <div className="mr-4 w-6 border" />

        {!openReplies ? `View replies (${replies.length})` : 'Hide replies'}
      </button>

      {openReplies && (
        <ul className="mt-4 flex flex-col gap-4">
          {replies.map((reply) => (
            <li key={reply.id} className="flex items-start space-x-4">
              <div className="flex aspect-square h-10 w-10 items-center justify-center rounded-full border bg-muted">
                {usernameInitial}
              </div>

              <div className="flex w-full flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {username}
                  </span>
                </div>

                <div className="relative space-y-1 rounded-md border p-4 shadow">
                  <p className="text-sm">{reply.reply}</p>

                  {/* <div className="absolute -bottom-2 right-2 rounded-full border bg-muted px-3 py-1 text-xs">
                    ❤ 2
                  </div> */}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
