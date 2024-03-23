import Image from 'next/image'
import { Play } from 'lucide-react'
import { Buy, Rent, tmdb } from '@plotwist/tmdb'

import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { getDictionary } from '@/utils/dictionaries'
import { tmdbImage } from '@/utils/tmdb/image'

import { Language } from '@/types/languages'
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu'

type WatchProviderItemProps = { item: Buy | Rent }

export const WatchProviderItem = ({ item }: WatchProviderItemProps) => {
  const src = tmdbImage(item.logo_path)

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative aspect-square h-6 w-6 overflow-hidden rounded-lg"
        key={item.provider_id}
      >
        <Image
          className="aspect-square w-full"
          src={src}
          loading="lazy"
          alt={item.provider_name}
          fill
          sizes="100%"
        />
      </div>

      <span className="text-xs">{item.provider_name}</span>
    </div>
  )
}

export type WatchProvidersProps = {
  id: number
  variant: 'movie' | 'tv'
  language: Language
} & DropdownMenuProps

export const WatchProviders = async ({
  id,
  variant,
  language,
  ...dropdownMenuProps
}: WatchProvidersProps) => {
  const { results } = await tmdb.watchProviders.itemWatchProviders(variant, id)
  const dictionary = await getDictionary(language)

  const resultsByLanguage = {
    'de-DE': results.DE,
    'en-US': results.US,
    'es-ES': results.ES,
    'fr-FR': results.FR,
    'it-IT': results.IT,
    'ja-JP': results.JP,
    'pt-BR': results.BR,
  }

  const watchProvider =
    resultsByLanguage[language] ?? resultsByLanguage['en-US']

  if (!watchProvider) return <></>

  const { buy, flatrate, rent } = watchProvider

  return (
    <DropdownMenu {...dropdownMenuProps}>
      <DropdownMenuTrigger asChild data-testid="watch-providers-trigger">
        <Badge variant="outline" className="cursor-pointer">
          <Play className="mr-1.5" size={12} />

          {dictionary.watch_providers.label}
        </Badge>
      </DropdownMenuTrigger>

      <DropdownMenuContent data-testid="watch-providers-content">
        {flatrate && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs" data-testid="flat-rate">
              {dictionary.watch_providers.stream}
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {flatrate.map((item) => (
                <DropdownMenuItem key={item.provider_id}>
                  <WatchProviderItem item={item} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {rent && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs">
              {dictionary.watch_providers.rent}
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {rent.map((item) => (
                <DropdownMenuItem key={item.provider_id}>
                  <WatchProviderItem item={item} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {buy && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs">
              {dictionary.watch_providers.buy}
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {buy.map((item) => (
                <DropdownMenuItem key={item.provider_id}>
                  <WatchProviderItem item={item} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
