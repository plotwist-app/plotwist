'use client'

import NextImage from 'next/image'
import { Image } from '@plotwist/tmdb'
import ReactMasonryCss from 'react-masonry-css'

import { tmdbImage } from '@/utils/tmdb/image'
import { Skeleton } from '../ui/skeleton'

type ImagesMasonryProps = {
  images: Image[]
  onSelect?: (image: Image) => void
}

export const ImagesMasonry = ({ images, onSelect }: ImagesMasonryProps) => {
  return (
    <ReactMasonryCss
      className="flex space-x-4"
      breakpointCols={{
        default: 3,
        1080: 2,
      }}
      data-testid="images-masonry"
    >
      {images.map(({ file_path: filePath, aspect_ratio: aspectRatio }) => {
        const previewURL = tmdbImage(filePath, 'w500')
        const qualityURL = tmdbImage(filePath, 'original')

        if (onSelect) {
          return (
            <div
              className="relative mb-4 flex w-full overflow-hidden rounded-md border bg-background/50 shadow"
              key={filePath}
              style={{ aspectRatio }}
            >
              <NextImage
                fill
                className="object-cover"
                src={previewURL}
                alt={filePath}
                loading="lazy"
                sizes="100%"
              />
            </div>
          )
        }

        return (
          <a
            className="relative mb-4 flex w-full overflow-hidden rounded-md border bg-background/50 shadow"
            target="_blank"
            href={qualityURL}
            key={filePath}
            style={{ aspectRatio }}
          >
            <NextImage
              fill
              className="object-cover"
              src={previewURL}
              alt={filePath}
              loading="lazy"
              sizes="100%"
            />
          </a>
        )
      })}
    </ReactMasonryCss>
  )
}

type ReactMasonrySkeletonProps = {
  count: number // Número de Skeletons a serem renderizados
}

export const ReactMasonrySkeleton = ({ count }: ReactMasonrySkeletonProps) => {
  const aspectRatios = ['16/9', '2/3']

  return (
    <ReactMasonryCss
      className="flex space-x-4"
      breakpointCols={{
        default: 3,
        1080: 2,
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          className="mb-4 flex w-full overflow-hidden rounded-md bg-background/50"
          key={index}
          style={{
            aspectRatio:
              aspectRatios[Math.floor(Math.random() * aspectRatios.length)],
          }}
        >
          <Skeleton className="h-full w-full" />
        </div>
      ))}
    </ReactMasonryCss>
  )
}
