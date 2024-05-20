'use client'

import { useLanguage } from '@/context/language'

import { Badge } from '../ui/badge'
import { AnimeListContent } from './anime-list-content'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export type AnimeListType = 'tv' | 'movies'

export const AnimeList = () => {
  const { dictionary } = useLanguage()
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const type = (searchParams.get('type') ?? 'tv') as AnimeListType

  const handleReplaceType = (type: AnimeListType) => {
    replace(`${pathname}?type=${type}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Badge
          onClick={() => handleReplaceType('tv')}
          className="cursor-pointer"
          variant={type === 'tv' ? 'default' : 'outline'}
        >
          {dictionary.animes_page.button_tv_series}
        </Badge>
        <Badge
          onClick={() => handleReplaceType('movies')}
          className="cursor-pointer"
          variant={type === 'movies' ? 'default' : 'outline'}
        >
          {dictionary.animes_page.button_movies}
        </Badge>
      </div>

      <AnimeListContent type={type} />
    </div>
  )
}
