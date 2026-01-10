'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'
import { Input } from '@plotwist/ui/components/ui/input'
import { ScrollArea } from '@plotwist/ui/components/ui/scroll-area'
import { useDebounce } from '@uidotdev/usehooks'
import { ChevronLeft } from 'lucide-react'
import { type PropsWithChildren, useMemo, useState } from 'react'
import { useLanguage } from '@/context/language'
import type { Image } from '@/services/tmdb'
import { ImagePickerCrop, type ImagePickerCropProps } from './image-picker-crop'
import {
  ImagePickerInitialList,
  ImagePickerList,
  ImagePickerListResults,
} from './image-picker-list'

export type SelectedItem = { id: number; type: 'tv' | 'movie'; title: string }

export type OnSelect = (
  imageUrl: string,
  closeModal: () => void
) => Promise<void>

export type ImagePickerRootProps = Pick<ImagePickerCropProps, 'variant'> & {
  onSelect: OnSelect
}

export const ImagePickerRoot = (
  props: ImagePickerRootProps & PropsWithChildren
) => {
  const { children, variant, onSelect } = props

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<null | SelectedItem>(null)
  const [selectedImage, setSelectImage] = useState<null | Image>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  const { dictionary } = useLanguage()

  const content = useMemo(() => {
    const onClose = () => setOpenDialog(false)

    const handleReset = () => {
      onClose()
      setSelectImage(null)
      setSelectedItem(null)
    }

    if (selectedImage) {
      return (
        <ImagePickerCrop
          image={selectedImage}
          setSelectImage={setSelectImage}
          variant={variant}
          onClose={onClose}
          onSelect={async imageURL => {
            await onSelect(imageURL, onClose)
            handleReset()
          }}
        />
      )
    }

    if (selectedItem) {
      return (
        <ScrollArea className="h-[500px] p-4">
          <ImagePickerList
            selectedItem={selectedItem}
            onSelect={image => setSelectImage(image)}
          />
        </ScrollArea>
      )
    }

    if (debouncedSearch === '') {
      return (
        <ScrollArea className="h-[500px] p-4">
          <ImagePickerInitialList
            onSelect={selectedItem => setSelectedItem(selectedItem)}
          />
        </ScrollArea>
      )
    }

    if (debouncedSearch !== '') {
      return (
        <ScrollArea className="h-[500px] p-4">
          <ImagePickerListResults
            search={debouncedSearch}
            onSelect={selectedItem => setSelectedItem(selectedItem)}
          />
        </ScrollArea>
      )
    }
  }, [debouncedSearch, selectedItem, selectedImage, variant, onSelect])

  const header = useMemo(() => {
    if (selectedImage) {
      return null
    }

    if (selectedItem) {
      return (
        <div className="flex gap-2">
          <ChevronLeft
            className="cursor-pointer"
            onClick={() => setSelectedItem(null)}
          />

          {selectedItem.title}
        </div>
      )
    }

    return (
      <Input
        id="search"
        type="text"
        placeholder={dictionary.search_movies_or_series}
        onChange={({ target: { value } }) => setSearch(value)}
        defaultValue={search}
      />
    )
  }, [selectedImage, selectedItem, dictionary, search])

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      {children}

      <DialogContent className="gap-0 p-0">
        <DialogHeader className="items-start space-y-4 border-b p-4">
          <DialogTitle>
            {selectedImage ? dictionary.edit_image : dictionary.select_an_image}
          </DialogTitle>

          {header}
        </DialogHeader>

        {content}
      </DialogContent>
    </Dialog>
  )
}

export const ImagePickerTrigger = (props: PropsWithChildren) => (
  <DialogTrigger asChild {...props} />
)
