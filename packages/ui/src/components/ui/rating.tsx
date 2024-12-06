'use client'

import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'

interface RatingProps {
  defaultRating: number
  onChange?: (rating: number) => void
  size?: number
  editable?: boolean
}

export function Rating({
  onChange,
  size = 14,
  defaultRating,
  editable = true,
}: RatingProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    if (!editable) return
    const { left, width } = e.currentTarget.getBoundingClientRect()

    const percent = (e.clientX - left) / width
    setHover(index + (percent > 0.5 ? 1 : 0.5))
  }

  const handleMouseLeave = () => {
    if (!editable) return
    setHover(0)
  }

  const handleClick = () => {
    if (!editable) return
    const newRating = hover === 0 ? rating : hover
    setRating(newRating)
    if (onChange) {
      onChange(newRating)
    }
  }

  useEffect(() => {
    setRating(defaultRating)
  }, [defaultRating])

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(index => (
        <div
          key={index}
          className={`relative ${editable ? 'cursor-pointer' : ''}`}
          onMouseMove={e => editable && handleMouseMove(e, index - 1)}
          onMouseLeave={editable ? handleMouseLeave : undefined}
          onClick={editable ? handleClick : undefined}
          onKeyDown={editable ? handleClick : undefined}
        >
          <Star
            size={size}
            className={`fill-muted-foreground/50 text-transparent dark:fill-muted dark:text-muted ${
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
            <Star size={size} className="fill-amber-300 text-amber-300" />
          </div>
        </div>
      ))}
    </div>
  )
}
