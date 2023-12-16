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
import { MovieDetailsProviderItem } from './movie-details-providers-item'

type MovieDetailsProviderProps = { movieId: number }

export const MovieDetailsProvider = async ({
  movieId,
}: MovieDetailsProviderProps) => {
  const { results } = await TMDB.movies.watchProviders(movieId)

  if (!results.US) return <></>

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
