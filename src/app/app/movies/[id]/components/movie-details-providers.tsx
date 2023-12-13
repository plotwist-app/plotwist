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

import { TMDB } from '@/services/TMDB'

import { Play } from 'lucide-react'
import Image from 'next/image'
import { Buy, Rent } from 'tmdb-ts'

type MovieDetailsProviderProps = { movieId: number }
type MovieDetailsProviderItemProps = { item: Buy | Rent }

const MovieDetailsProviderItem = ({ item }: MovieDetailsProviderItemProps) => {
  const src = `https://image.tmdb.org/t/p/original/${item.logo_path}`

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative aspect-square h-6 w-6 overflow-hidden rounded-lg"
        key={item.provider_id}
      >
        <Image
          className="aspect-square w-full"
          src={src}
          alt={item.provider_name}
          fill
        />
      </div>

      <span className="text-xs">{item.provider_name}</span>
    </div>
  )
}

export const MovieDetailsProvider = async ({
  movieId,
}: MovieDetailsProviderProps) => {
  const { results } = await TMDB.movies.watchProviders(movieId)

  const { buy, flatrate, rent } = results.US // TODO: CHANGE BY USER LOCALE

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge variant="outline" className="cursor-pointer">
          <Play className="mr-1.5" size={12} />
          Watch Providers
        </Badge>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {flatrate && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs">
              Stream
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {flatrate.map((item) => (
                <DropdownMenuItem key={item.provider_id}>
                  <MovieDetailsProviderItem item={item} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {rent && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs">
              Rent
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {rent.map((item) => (
                <DropdownMenuItem key={item.provider_id}>
                  <MovieDetailsProviderItem item={item} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {buy && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs">
              Buy
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              {buy.map((item) => (
                <DropdownMenuItem key={item.provider_id}>
                  <MovieDetailsProviderItem item={item} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
