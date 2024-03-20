'use client'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/language'
import { useState } from 'react'

type PersonBiographyProps = { personBiography: string }

const MAX_WORDS = 92

export const PersonBiography = ({ personBiography }: PersonBiographyProps) => {
  const [isBiographyExpanded, setIsBiographyExpanded] = useState(false)
  const { dictionary } = useLanguage()

  const isBiographyTooLong = personBiography.split(' ').length > MAX_WORDS
  const trimTextToMaxWords = (text: string) => {
    return text.split(' ').slice(0, MAX_WORDS).join(' ') + '...'
  }

  return (
    <p className="text-xs leading-5 text-muted-foreground md:text-sm md:leading-6">
      {isBiographyTooLong ? (
        <>
          {isBiographyExpanded ? personBiography : trimTextToMaxWords(personBiography)}
          <Button
            variant="link"
            onClick={() => 
              setIsBiographyExpanded((state: boolean) => !state)
            }>
            {/* TODO: translate and add the actual word to contract and expand */}
            {isBiographyExpanded ? dictionary.text_actions.contract: dictionary.text_actions.expand}
          </Button>
        </>
      ): personBiography}
    </p>
  )
}
