'use client'

import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { useMemo, useRef, useState } from 'react'

type PersonBiographyProps = { personBiography: string }

export const PersonBiography = ({ personBiography }: PersonBiographyProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const bioRef = useRef<HTMLParagraphElement>(null)

  const { dictionary } = useLanguage()

  const showMore = useMemo(() => {
    const bioElement = bioRef.current

    if (bioElement) {
      const isOverflowing = bioElement.scrollHeight > bioElement.clientHeight
      return isOverflowing
    }
    return false
  }, [])

  return (
    <p>
      <p
        ref={bioRef}
        className={cn(
          'text-xs leading-5 text-muted-foreground md:text-sm md:leading-6',
          isExpanded ? 'line-clamp-none' : 'line-clamp-5',
        )}
      >
        {personBiography}
      </p>

      {showMore && (
        <span
          className="cursor-pointer text-xs hover:underline"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded
            ? dictionary.text_actions.contract
            : dictionary.text_actions.expand}
        </span>
      )}
    </p>
  )
}
