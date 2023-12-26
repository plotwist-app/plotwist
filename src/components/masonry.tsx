'use client'

import Image from 'next/image'
import { Image as ImageTMDB } from 'tmdb-ts'
import ReactMasonryCss from 'react-masonry-css'
import { tmdbImage } from '@/utils/tmdb/image'

type MasonryProps = {
  images: ImageTMDB[]
}

export const Masonry = ({ images }: MasonryProps) => {
  console.log({ images })
  return (
    <ReactMasonryCss
      className="flex space-x-4"
      breakpointCols={{
        default: 3,
        1080: 2,
      }}
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
            <Image
              fill
              className="object-cover"
              src={previewURL}
              alt={filePath}
              loading="lazy"
            />
          </a>
        )
      })}
    </ReactMasonryCss>
  )
}
