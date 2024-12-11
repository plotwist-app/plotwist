import { usePostImage } from '@/api/images'
import { cn } from '@/lib/utils'
import { tmdbImage } from '@/utils/tmdb/image'
import { Button } from '@plotwist/ui/components/ui/button'
import type { Image } from '@plotwist_app/tmdb'
import { useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import type { OnSelect } from './image-picker-root'

import type { PostImageFolder } from '@/api/endpoints.schemas'
import { useLanguage } from '@/context/language'
import { useParams } from 'next/navigation'

export type ImagePickerCropProps = {
  image: Image
  setSelectImage: (image: Image | null) => void
  onClose: () => void
  onSelect: OnSelect
  variant: PostImageFolder
}

const aspectRatio: Record<PostImageFolder, number> = {
  banner: 16 / 7,
  list: 16 / 7,
  avatar: 1 / 1,
}

export function ImagePickerCrop({
  image,
  setSelectImage,
  variant,
  onSelect,
  onClose,
}: ImagePickerCropProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const createImage = usePostImage()
  const { dictionary } = useLanguage()
  const params = useParams()

  const handleCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const handleApply = async () => {
    if (croppedAreaPixels) {
      try {
        setIsLoading(true)

        const croppedBlob = (await getCroppedImg(
          tmdbImage(image.file_path),
          croppedAreaPixels
        )) as Blob

        const { url } = await createImage.mutateAsync({
          data: {
            file: croppedBlob,
          },
          params: {
            folder: variant,
            fileName: String(params.id),
          },
        })

        await onSelect(url, onClose)
      } catch {
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'flex-1 w-full border-b overflow-hidden relative max-h-[50vh]'
        )}
        style={{
          aspectRatio: image.aspect_ratio,
        }}
      >
        <Cropper
          image={tmdbImage(image.file_path)}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio[variant]}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>

      <div className="flex gap-2 p-4 justify-end">
        <Button variant="outline" onClick={() => setSelectImage(null)}>
          {dictionary.cancel}
        </Button>

        <Button onClick={() => handleApply()} loading={isLoading}>
          {dictionary.apply}
        </Button>
      </div>
    </div>
  )
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = src

    image.onload = () => resolve(image)
    image.onerror = err => reject(err)
  })
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area) {
  const image = await loadImage(`/api/proxy?url=${imageSrc}`)
  const canvas = document.createElement('canvas')

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  const ctx = canvas.getContext('2d')

  ctx?.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Canvas is empty'))
        return
      }

      resolve(blob)
    }, 'image/webp')
  })
}
