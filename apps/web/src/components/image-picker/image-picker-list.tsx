'use client'

import { useQuery } from '@tanstack/react-query'

import { ImagesMasonry, ReactMasonrySkeleton } from '@/components/images'
import {
  type Image,
  type MovieWithMediaType,
  type TvSerieWithMediaType,
  tmdb,
} from '@/services/tmdb'

import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'
import { v4 } from 'uuid'
import { ImagePickerItem, ImagePickerItemSkeleton } from './image-picker-item'
import type { SelectedItem } from './image-picker-root'

type ImagePickerListProps = {
  selectedItem: SelectedItem
  onSelect: (image: Image) => void
}

export const ImagePickerList = ({
  selectedItem,
  onSelect,
}: ImagePickerListProps) => {
  const { id, type } = selectedItem
  const { dictionary } = useLanguage()

  const { data, isLoading } = useQuery({
    queryKey: ['images', id],
    queryFn: async () => await tmdb.images(type, id),
  })

  if (!data || isLoading) return <ReactMasonrySkeleton count={20} />

  const images = () => {
    return [...data.backdrops, ...data.posters].sort(
      (a, b) => b.vote_count - a.vote_count
    )
  }

  return <ImagesMasonry images={images()} onSelect={onSelect} />
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
      {data?.results.map(movie => (
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
          <ImagePickerItemSkeleton key={v4()} />
        ))}
      </div>
    )
  }

  const movies = data?.results.filter(
    result => result.media_type === 'movie'
  ) as MovieWithMediaType[]

  const tvSeries = data?.results.filter(
    result => result.media_type === 'tv'
  ) as TvSerieWithMediaType[]

  return (
    <div className="flex flex-col gap-4">
      {movies?.map(movie => {
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

      {tvSeries?.map(tvSerie => {
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
