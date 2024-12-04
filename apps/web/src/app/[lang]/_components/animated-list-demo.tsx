'use client'

import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { AnimatedList } from '@plotwist/ui/components/ui/animated-list'
import { Avatar, AvatarFallback } from '@plotwist/ui/components/ui/avatar'
import { Rating } from '@plotwist/ui/components/ui/rating'
import { v4 } from 'uuid'
import { type Review as ReviewType, reviews } from './reviews-translations'

const Review = ({ name, description, time, rating }: ReviewType) => {
  return (
    <div className="flex items-start space-x-4">
      <div>
        <Avatar className="h-10 w-10 border text-[10px] ">
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex max-w-[calc(100%-56px)] flex-1 flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <span className="text-sm text-muted-foreground ">{name}</span>
            <span className="h-1 w-1 rounded-full bg-muted" />
            <Rating defaultRating={rating} editable={false} />

            <span className="hidden h-1 w-1 rounded-full bg-muted md:block" />
            <span className="hidden text-xs text-muted-foreground underline-offset-1 md:block">
              {time}
            </span>
          </div>
        </div>

        <div className="relative">
          <div
            className={cn(
              'relative space-y-1 rounded-md border p-4 overflow-hidden'
            )}
          >
            <div>
              <p className={cn('z-10 break-words text-sm/6 relative')}>
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AnimatedListDemo({ className }: { className?: string }) {
  const { language } = useLanguage()
  const localizedReviews = reviews[language]

  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col px-6 space-y-2 rounded-lg bg-background',
        className
      )}
    >
      <AnimatedList delay={2_500}>
        {localizedReviews.map(item => (
          <Review {...item} key={v4()} />
        ))}
      </AnimatedList>
    </div>
  )
}
