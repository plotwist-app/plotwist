import { useGetReviewSummarySuspense } from '@/api/reviews'
import { useLanguage } from '@/context/language'
import type { Language } from '@/types/languages'
import type { Dictionary } from '@/utils/dictionaries'
import { Avatar, AvatarImage } from '@plotwist/ui/components/ui/avatar'
import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

type ReviewsSummaryProps = {
  tmdbId: number
  language: Language
}

const getLoadingMessage = (dictionary: Dictionary) => [
  dictionary.reading_reviews,
  dictionary.analyzing_reviews,
  dictionary.identifying_main_points,
  dictionary.generating_summary,
]

function useLoadingMessage() {
  const [messageIndex, setMessageIndex] = useState(0)
  const { dictionary } = useLanguage()

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(current =>
        current < getLoadingMessage(dictionary).length - 1
          ? current + 1
          : current
      )
    }, 2_000)

    return () => clearInterval(interval)
  }, [dictionary])

  return getLoadingMessage(dictionary)[messageIndex]
}

export function ReviewsSummary({ tmdbId, language }: ReviewsSummaryProps) {
  const { dictionary } = useLanguage()
  const { data } = useGetReviewSummarySuspense({
    tmdbId: String(tmdbId),
    mediaType: 'MOVIE',
    language,
  })

  if (!data) return null

  return (
    <div className="flex space-x-4">
      <Avatar className="size-10 border text-[10px] flex items-center justify-center">
        <AvatarImage
          src="/logo-white.png"
          className="size-6 hidden dark:block"
          alt="logo"
        />
        <AvatarImage
          src="/logo-black.png"
          className="size-6 block dark:hidden"
          alt="logo"
        />
      </Avatar>

      <div className="space-y-2">
        <span className="text-sm text-muted-foreground flex items-center space-x-1">
          <Sparkles className="size-3 text-foreground" />
          <span>{dictionary.review_summary_generated_by_ai}</span>
        </span>

        <p className="text-sm/6 border p-4 rounded-lg">{data.summary}</p>
      </div>
    </div>
  )
}

export function ReviewsSummarySkeleton() {
  const loadingMessage = useLoadingMessage()
  const { dictionary } = useLanguage()

  return (
    <div className="flex space-x-4">
      <Avatar className="size-10 border text-[10px] flex items-center justify-center">
        <AvatarImage
          src="/logo-white.png"
          className="size-6 hidden dark:block"
          alt="logo"
        />
        <AvatarImage
          src="/logo-black.png"
          className="size-6 block dark:hidden"
          alt="logo"
        />
      </Avatar>

      <div className="space-y-2 flex-1">
        <span className="text-sm text-muted-foreground flex items-center space-x-1">
          <Sparkles className="size-3 text-foreground" />
          <span>{dictionary.review_summary_generated_by_ai}</span>
        </span>

        <p className="text-sm/6 border p-4 rounded-lg animate-pulse">
          {loadingMessage}
        </p>
      </div>
    </div>
  )
}
