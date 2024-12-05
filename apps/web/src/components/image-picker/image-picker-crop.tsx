import { cn } from '@/lib/utils'
import { tmdbImage } from '@/utils/tmdb/image'
import { Button } from '@plotwist/ui/components/ui/button'
import type { Image } from '@plotwist_app/tmdb'
import { useState } from 'react'
import Cropper from 'react-easy-crop'

export type ImagePickerCropProps = {
  image: Image
  setSelectImage: (image: Image | null) => void
  aspectRatio: 'banner' | 'square'
  onSelect: (image: Image, closeModal: () => void) => void
  onClose: () => void
}

export function ImagePickerCrop({
  image,
  setSelectImage,
  aspectRatio,
  onSelect,
  onClose,
}: ImagePickerCropProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  return (
    <div className="flex flex-col">
      <div
        className={cn('flex-1 w-full border-b overflow-hidden relative')}
        style={{
          aspectRatio: image.aspect_ratio,
        }}
      >
        <Cropper
          image={tmdbImage(image.file_path)}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio === 'banner' ? 16 / 7.5 : 1 / 1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
        />
      </div>

      <div className="flex gap-2 p-4 justify-end">
        <Button variant="outline" onClick={() => setSelectImage(null)}>
          Cancelar
        </Button>

        <Button
          onClick={() => {
            console.log(crop)
            // onSelect(image, onClose)
          }}
        >
          Aplicar
        </Button>
      </div>
    </div>
  )
}
