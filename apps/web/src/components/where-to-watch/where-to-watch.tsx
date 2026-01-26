import { cn } from '@plotwist/ui/lib/utils'
import type { Buy, Language, Rent } from '@plotwist_app/tmdb'
import { X } from 'lucide-react'
import Image from 'next/image'
import { tmdb } from '@/services/tmdb'
import { getDictionary } from '@/utils/dictionaries'
import { tmdbImage } from '@/utils/tmdb/image'

type WhereToWatchProps = {
  id: number
  variant: 'movie' | 'tv'
  language: Language
}

export async function WhereToWatch({
  id,
  language,
  variant,
}: WhereToWatchProps) {
  const { results } = await tmdb.watchProviders.item(variant, id)
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

  return (
    <div className="space-y-8 md:space-y-0 md:grid-cols-3 md:grid md:gap-8">
      <div className="">
        <div className="text-md font-medium">
          {dictionary.watch_providers.stream}
        </div>

        <div className="">
          {watchProvider?.flatrate ? (
            watchProvider.flatrate.map((item, index, array) => (
              <div key={item.provider_id}>
                <WhereToWatchItem
                  item={item}
                  isLast={index === array.length - 1}
                />
              </div>
            ))
          ) : (
            <Unavailable message={dictionary.unavailable} />
          )}
        </div>
      </div>

      <div className="">
        <div className="text-md font-medium">
          {dictionary.watch_providers.rent}
        </div>

        <div className="">
          {watchProvider?.rent ? (
            watchProvider.rent.map((item, index, array) => (
              <div key={item.provider_id}>
                <WhereToWatchItem
                  item={item}
                  isLast={index === array.length - 1}
                />
              </div>
            ))
          ) : (
            <Unavailable message={dictionary.unavailable} />
          )}
        </div>
      </div>

      <div className="">
        <div className="text-md font-medium">
          {dictionary.watch_providers.buy}
        </div>

        <div className="">
          {watchProvider?.buy ? (
            watchProvider.buy.map((item, index, array) => (
              <div key={item.provider_id}>
                <WhereToWatchItem
                  item={item}
                  isLast={index === array.length - 1}
                />
              </div>
            ))
          ) : (
            <Unavailable message={dictionary.unavailable} />
          )}
        </div>
      </div>
    </div>
  )
}

type WatchProviderItemProps = { item: Buy | Rent; isLast: boolean }

export const WhereToWatchItem = ({ item, isLast }: WatchProviderItemProps) => {
  const src = tmdbImage(item.logo_path)

  return (
    <div
      className={cn(
        'flex items-center gap-2 py-2',
        !isLast && 'border-b border-dashed'
      )}
    >
      <div
        className="relative aspect-square h-6 w-6 overflow-hidden rounded-lg border"
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

      <span className="text-sm">{item.provider_name}</span>
    </div>
  )
}
function Unavailable({ message }: { message: string }) {
  return (
    <div className="py-2 flex gap-2 items-center text-sm  text-muted-foreground">
      <div className="w-6 h-6 border rounded-lg flex items-center justify-center">
        <X size="16" />
      </div>
      {message}
    </div>
  )
}
