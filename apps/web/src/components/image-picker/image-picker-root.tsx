'use client'

import { useDebounce } from '@uidotdev/usehooks'
import { type PropsWithChildren, useMemo, useState } from 'react'

import type { Image } from '@/services/tmdb'

import { useLanguage } from '@/context/language'
import { ChevronLeft } from 'lucide-react'
import {
  ImagePickerInitialList,
  ImagePickerList,
  ImagePickerListResults,
} from './image-picker-list'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'
import { Input } from '@plotwist/ui/components/ui/input'
import { ScrollArea } from '@plotwist/ui/components/ui/scroll-area'

export type SelectedItem = { id: number; type: 'tv' | 'movie'; title: string }

export type ImagePickerRootProps = {
  onSelect: (image: Image, closeModal: () => void) => void
} & PropsWithChildren

export const ImagePickerRoot = (props: ImagePickerRootProps) => {
  const { onSelect, children } = props

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<null | SelectedItem>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  const { dictionary } = useLanguage()

  const content = useMemo(() => {
    const closeModal = () => setOpenDialog(false)

    if (selectedItem) {
      return (
        <ImagePickerList
          selectedItem={selectedItem}
          onSelect={image => onSelect(image, closeModal)}
        />
      )
    }

    if (debouncedSearch === '') {
      return (
        <ImagePickerInitialList
          onSelect={selectedItem => setSelectedItem(selectedItem)}
        />
      )
    }

    if (debouncedSearch !== '') {
      return (
        <ImagePickerListResults
          search={debouncedSearch}
          onSelect={selectedItem => setSelectedItem(selectedItem)}
        />
      )
    }
  }, [debouncedSearch, onSelect, selectedItem])

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      {children}

      <DialogContent className="gap-0 p-0">
        <DialogHeader className="items-start space-y-4 border-b p-4">
          <DialogTitle>{dictionary.select_an_image}</DialogTitle>

          {selectedItem ? (
            <div className="flex gap-2">
              <ChevronLeft
                className="cursor-pointer"
                onClick={() => setSelectedItem(null)}
              />

              {selectedItem.title}
            </div>
          ) : (
            <Input
              id="search"
              type="text"
              placeholder={dictionary.search_movies_or_series}
              onChange={({ target: { value } }) => setSearch(value)}
              defaultValue={search}
            />
          )}
        </DialogHeader>

        <ScrollArea className="h-[500px] p-4">{content}</ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export const ImagePickerTrigger = (props: PropsWithChildren) => (
  <DialogTrigger asChild {...props} />
)
