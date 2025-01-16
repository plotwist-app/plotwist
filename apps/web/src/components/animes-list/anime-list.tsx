'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useLanguage } from '@/context/language'

import { Badge } from '@plotwist/ui/components/ui/badge'
import { AnimeListContent } from './anime-list-content'
import { useUserPreferences } from '@/context/user-preferences'
import { Button } from '@plotwist/ui/components/ui/button'

export type AnimeListType = 'tv' | 'movies'

export const AnimeList = () => {
  const { dictionary } = useLanguage()
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { userPreferences } = useUserPreferences()

  const type = (searchParams.get('type') ?? 'tv') as AnimeListType

  const handleReplaceType = (type: AnimeListType) => {
    replace(`${pathname}?type=${type}`)
  }

  const hasPreferences =
    userPreferences?.watchProvidersIds &&
    userPreferences?.watchProvidersIds.length > 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center lg:flex-row-reverse flex-col gap-2">
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

        {hasPreferences && (
          <Badge className="lg:w-auto w-full" variant="secondary">
            {dictionary.available_on_streaming_services}
          </Badge>
        )}
      </div>

      <AnimeListContent type={type} />
    </div>
  )
}
