'use client'

import { Review } from '@/types/supabase/reviews'

import { MediaType } from '@/types/supabase/media-type'
import { TvSeriesDetails } from '@/services/tmdb/requests/tv-series/details'
import { MovieDetails } from '@/services/tmdb/requests/movies/details'
import {
  ReviewReplyActions,
  ReviewReplyLikes,
} from '@/components/reviews/review-reply'
import { useLanguage } from '@/context/language'

type TmdbItem = TvSeriesDetails | MovieDetails

interface ReviewReplyProps {
  usernameInitial: string
  username: string
  replies: Review['review_replies']
  openReplies: boolean
  setOpenReplies: (param: boolean) => void
  tmdbItem: TmdbItem
  mediaType: MediaType
}

export const ReviewReply = ({
  usernameInitial,
  username,
  replies,
  openReplies,
  setOpenReplies,
  tmdbItem,
  mediaType,
}: ReviewReplyProps) => {
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

        {!openReplies
          ? `${dictionary.review_reply.open_replies} (${replies.length})`
          : `${dictionary.review_reply.hide_replies}`}
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

                  <ReviewReplyLikes replyId={reply.id} />
                </div>

                <ReviewReplyActions
                  reply={reply}
                  tmdbItem={tmdbItem}
                  mediaType={mediaType}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
