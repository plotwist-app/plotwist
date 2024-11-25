'use client'

import { cn } from '@/lib/utils'
import { StarFilledIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { v4 } from 'uuid'

type ReviewStarsProps = {
  rating: number
  onChange?: (value: number) => void
}

export const ReviewStars = ({ onChange, rating }: ReviewStarsProps) => {
  const [hoverIndex, setHoverIndex] = useState(-1)

  const filledClass = 'text-amber-300'
  const isInteractive = onChange !== undefined

  if (!isInteractive) {
    return (
      <div className="flex items-center">
        {Array.from({ length: rating }).map(_ => {
          return <StarFilledIcon key={v4()} className={filledClass} />
        })}

        {Array.from({ length: 5 - rating }).map(_ => {
          return <StarFilledIcon key={v4()} className="text-foreground/25" />
        })}
      </div>
    )
  }

  return (
    <div className="flex items-center text-foreground/25">
      {Array.from({ length: 5 }).map((_, index) => {
        const starIndex = index + 1 // Star index should start from 1
        const isFilled = starIndex <= hoverIndex || starIndex <= rating

        return (
          <StarFilledIcon
            key={v4()}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(-1)}
            onClick={() => onChange(starIndex)}
            className={cn(
              'cursor-pointer transition-colors duration-100 ease-in-out hover:text-amber-300',
              isFilled && filledClass
            )}
          />
        )
      })}
    </div>
  )
}
