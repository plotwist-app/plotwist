'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useLanguage } from '@/context/language'

import { Badge } from '@plotwist/ui/components/ui/badge'
import { AnimeListContent } from './anime-list-content'

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
          {dictionary.tv_series}
        </Badge>
        <Badge
          onClick={() => handleReplaceType('movies')}
          className="cursor-pointer"
          variant={type === 'movies' ? 'default' : 'outline'}
        >
          {dictionary.movies}
        </Badge>
      </div>

      <AnimeListContent type={type} />
    </div>
  )
}
