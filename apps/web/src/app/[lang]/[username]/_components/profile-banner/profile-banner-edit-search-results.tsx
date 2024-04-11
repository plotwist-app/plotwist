import { useQuery } from '@tanstack/react-query'

import { MovieWithMediaType, TvSerieWithMediaType, tmdb } from '@plotwist/tmdb'

import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'

import {
  ProfileBannerEditItem,
  ProfileBannerEditItemSkeleton,
} from './profile-banner-edit-item'
import { SelectedItem } from './profile-banner-edit'

type ProfileBannerEditSearchResultsProps = {
  search: string
  onSelect: (selectedItem: SelectedItem) => void
}

export const ProfileBannerEditSearchResults = ({
  search,
  onSelect,
}: ProfileBannerEditSearchResultsProps) => {
  const { language } = useLanguage()

  const { data, isLoading } = useQuery({
    queryKey: ['multi-search', search],
    queryFn: async () => await tmdb.search.multi(search, language),
  })

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <ProfileBannerEditItemSkeleton key={index} />
        ))}
      </div>
    )
  }

  const movies = data?.results.filter(
    (result) => result.media_type === 'movie',
  ) as MovieWithMediaType[]

  const tvSeries = data?.results.filter(
    (result) => result.media_type === 'tv',
  ) as TvSerieWithMediaType[]

  return (
    <div className="flex flex-col gap-4">
      {movies?.map((movie) => {
        if (!movie.backdrop_path) return null

        return (
          <ProfileBannerEditItem.Root
            key={movie.id}
            onClick={() =>
              onSelect({ id: movie.id, type: 'movie', title: movie.title })
            }
          >
            {movie.backdrop_path && (
              <ProfileBannerEditItem.Image
                src={tmdbImage(movie.backdrop_path)}
              />
            )}

            <ProfileBannerEditItem.Title>
              {movie.title}
            </ProfileBannerEditItem.Title>
          </ProfileBannerEditItem.Root>
        )
      })}

      {tvSeries?.map((tvSerie) => {
        if (!tvSerie.backdrop_path) return null

        return (
          <ProfileBannerEditItem.Root
            key={tvSerie.id}
            onClick={() =>
              onSelect({ id: tvSerie.id, type: 'tv', title: tvSerie.name })
            }
          >
            {tvSerie.backdrop_path && (
              <ProfileBannerEditItem.Image
                src={tmdbImage(tvSerie.backdrop_path)}
              />
            )}

            <ProfileBannerEditItem.Title>
              {tvSerie.name}
            </ProfileBannerEditItem.Title>
          </ProfileBannerEditItem.Root>
        )
      })}
    </div>
  )
}
