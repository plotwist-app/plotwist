'use client'

import { useState } from 'react'

import { useLanguage } from '@/context/language'

import { Badge } from '../ui/badge'
import { AnimeListContent } from './anime-list-content'

export type AnimeListMode = 'TV_SERIES' | 'MOVIES'

export const AnimeList = () => {
  const { dictionary } = useLanguage()
  const [mode, setMode] = useState<AnimeListMode>('TV_SERIES')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Badge
          onClick={() => setMode('TV_SERIES')}
          className="cursor-pointer"
          variant={mode === 'TV_SERIES' ? 'default' : 'outline'}
        >
          {dictionary.animes_page.button_tv_series}
        </Badge>
        <Badge
          onClick={() => setMode('MOVIES')}
          className="cursor-pointer"
          variant={mode === 'MOVIES' ? 'default' : 'outline'}
        >
          {dictionary.animes_page.button_movies}
        </Badge>
      </div>

      <AnimeListContent mode={mode} />
    </div>
  )
}
