'use client'

import NextImage from 'next/image'

import ReactMasonryCss from 'react-masonry-css'
import { tmdbImage } from '@/utils/tmdb/image'
import { Image } from '@/services/tmdb/requests'

type ImagesMasonryProps = {
  images: Image[]
}

export const ImagesMasonry = ({ images }: ImagesMasonryProps) => {
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
