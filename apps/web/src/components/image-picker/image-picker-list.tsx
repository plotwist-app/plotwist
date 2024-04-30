'use client'

import { useQuery } from '@tanstack/react-query'

import { MovieWithMediaType, TvSerieWithMediaType, tmdb } from '@plotwist/tmdb'
import { ImagesMasonry, ReactMasonrySkeleton } from '@/components/images'
import { useProfile } from '@/hooks/use-profile'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language'
import { SelectedItem } from './image-picker-root'
import { ImagePickerItem, ImagePickerItemSkeleton } from './image-picker-item'
import { tmdbImage } from '@/utils/tmdb/image'

type ImagePickerListProps = {
  selectedItem: SelectedItem
  handleCloseDialog: () => void
}

export const ImagePickerList = ({
  selectedItem,
  handleCloseDialog,
}: ImagePickerListProps) => {
  const { id, type } = selectedItem

  const { dictionary } = useLanguage()
  const { username } = useParams()
  const { updateBannerPathMutation } = useProfile()

  const { data, isLoading } = useQuery({
    queryKey: ['images', id],
    queryFn: async () => await tmdb.images(type, id),
  })

  if (!data || isLoading) return <ReactMasonrySkeleton count={20} />

  const images = () => {
    return [...data.backdrops, ...data.posters].sort(
      (a, b) => b.vote_count - a.vote_count,
    )
  }

  return (
    <ImagesMasonry
      images={images()}
      onSelect={(image) =>
        updateBannerPathMutation.mutate(
          {
            newBannerPath: image.file_path,
            username: String(username),
          },
          {
            onSettled: () => {
              handleCloseDialog()
              toast.success(dictionary.profile_banner.changed_successfully)
            },
          },
        )
      }
    />
  )
}

type ImagePickerInitialListProps = {
  onSelect: (selectedItem: SelectedItem) => void
}

export const ImagePickerInitialList = ({
  onSelect,
}: ImagePickerInitialListProps) => {
  const { language } = useLanguage()

  const { data } = useQuery({
    queryKey: ['top-rated-movies'],
    queryFn: async () =>
      await tmdb.movies.list({ language, list: 'top_rated', page: 1 }),
  })

  return (
    <div className="flex flex-col gap-4">
      {data?.results.map((movie) => (
        <ImagePickerItem.Root
          key={movie.id}
          onClick={() =>
            onSelect({ id: movie.id, type: 'movie', title: movie.title })
          }
        >
          {movie.backdrop_path && (
            <ImagePickerItem.Image src={tmdbImage(movie.backdrop_path)} />
          )}

          <ImagePickerItem.Title>{movie.title}</ImagePickerItem.Title>
        </ImagePickerItem.Root>
      ))}
    </div>
  )
}

type ImagePickerListResultsProps = {
  search: string
  onSelect: (selectedItem: SelectedItem) => void
}

export const ImagePickerListResults = ({
  search,
  onSelect,
}: ImagePickerListResultsProps) => {
  const { language } = useLanguage()

  const { data, isLoading } = useQuery({
    queryKey: ['multi-search', search],
    queryFn: async () => await tmdb.search.multi(search, language),
  })

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <ImagePickerItemSkeleton key={index} />
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
          <ImagePickerItem.Root
            key={movie.id}
            onClick={() =>
              onSelect({ id: movie.id, type: 'movie', title: movie.title })
            }
          >
            {movie.backdrop_path && (
              <ImagePickerItem.Image src={tmdbImage(movie.backdrop_path)} />
            )}

            <ImagePickerItem.Title>{movie.title}</ImagePickerItem.Title>
          </ImagePickerItem.Root>
        )
      })}

      {tvSeries?.map((tvSerie) => {
        if (!tvSerie.backdrop_path) return null

        return (
          <ImagePickerItem.Root
            key={tvSerie.id}
            onClick={() =>
              onSelect({ id: tvSerie.id, type: 'tv', title: tvSerie.name })
            }
          >
            {tvSerie.backdrop_path && (
              <ImagePickerItem.Image src={tmdbImage(tvSerie.backdrop_path)} />
            )}

            <ImagePickerItem.Title>{tvSerie.name}</ImagePickerItem.Title>
          </ImagePickerItem.Root>
        )
      })}
    </div>
  )
}
