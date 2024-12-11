'use client'

import { useLanguage } from '@/context/language'
import { useState } from 'react'

type BiographyProps = {
  content: string
}

export function Biography({ content }: BiographyProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { dictionary } = useLanguage()

  const toggleExpand = () => {
    setIsExpanded(prev => !prev)
  }

  if (!content.length) return <></>

  return (
    <div>
      <p
        className={`text-muted-foreground leading-6 text-sm ${
          isExpanded ? '' : 'line-clamp-5'
        }`}
      >
        {content}
      </p>

      <button
        onClick={toggleExpand}
        className="mt-2  hover:underline text-xs"
        type="button"
      >
        {isExpanded
          ? dictionary.text_actions.contract
          : dictionary.text_actions.expand}
      </button>
    </div>
  )
}
