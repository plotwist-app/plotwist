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

import { tmdb } from '@/services/tmdb2'
import { Buy, Rent } from '@/services/tmdb2/types/watch-providers'
import { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'
import { tmdbImage } from '@/utils/tmdb/image'

import { Play } from 'lucide-react'

import Image from 'next/image'

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

type WatchProvidersProps = {
  id: number
  variant: 'movie' | 'tv'
  language: Language
}

export const WatchProviders = async ({
  id,
  variant,
  language,
}: WatchProvidersProps) => {
  const { results } = await tmdb.watchProviders(variant, id)
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

  const { buy, flatrate, rent } =
    resultsByLanguage[language] ?? resultsByLanguage['en-US']

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge variant="outline" className="cursor-pointer">
          <Play className="mr-1.5" size={12} />

          {dictionary.watch_providers.label}
        </Badge>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {flatrate && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs">
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
