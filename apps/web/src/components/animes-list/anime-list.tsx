'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useLanguage } from '@/context/language'

import { Button } from '@plotwist/ui/components/ui/button'
import { StreamingServicesBadge } from '../streaming-services-badge'
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
      <div className="flex justify-between lg:items-center lg:flex-row-reverse flex-col gap-2">
        <div className="flex gap-2 w-full lg:w-auto">
          <Button
            onClick={() => handleReplaceType('tv')}
            className="cursor-pointer lg:w-auto w-full"
            variant={type === 'tv' ? 'default' : 'outline'}
            size="sm"
          >
            {dictionary.tv_series}
          </Button>

          <Button
            onClick={() => handleReplaceType('movies')}
            className="cursor-pointer lg:w-auto w-full"
            variant={type === 'movies' ? 'default' : 'outline'}
            size="sm"
          >
            {dictionary.movies}
          </Button>
        </div>

        <StreamingServicesBadge />
      </div>

      <AnimeListContent type={type} />
    </div>
  )
}
