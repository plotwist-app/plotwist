'use client'

import { StarFilledIcon } from '@radix-ui/react-icons'
import { Star } from 'lucide-react'
import { useState } from 'react'

interface RatingProps {
  onChange?: (rating: number) => void
}

export function Rating({ onChange }: RatingProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    const { left, width } = e.currentTarget.getBoundingClientRect()

    const percent = (e.clientX - left) / width
    setHover(index + (percent > 0.5 ? 1 : 0.5))
  }

  const handleMouseLeave = () => {
    setHover(0)
  }

  const handleClick = () => {
    const newRating = hover === 0 ? rating : hover
    setRating(newRating)
    if (onChange) {
      onChange(newRating)
    }
  }

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(index => (
        <div
          key={index}
          className="relative cursor-pointer"
          onMouseMove={e => handleMouseMove(e, index - 1)}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onKeyDown={handleClick}
        >
          <Star
            size={24}
            className={`fill-muted text-muted ${
              (hover || rating) >= index ? 'fill-amber-300 text-amber-300' : ''
            }`}
          />

          <div
            className="absolute top-0 left-0 overflow-hidden pointer-events-none"
            style={{
              width:
                (hover || rating) >= index
                  ? '100%'
                  : (hover || rating) > index - 1
                    ? '50%'
                    : '0%',
            }}
          >
            <Star size={24} className="fill-amber-300 text-amber-300" />
          </div>
        </div>
      ))}
    </div>
  )
}
