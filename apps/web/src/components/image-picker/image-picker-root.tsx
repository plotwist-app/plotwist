'use client'

import { PropsWithChildren, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { ScrollArea } from '../ui/scroll-area'
import { ChevronLeft } from 'lucide-react'
import { Input } from '../ui/input'
import {
  ImagePickerInitialList,
  ImagePickerList,
  ImagePickerListResults,
} from './image-picker-list'
import { useDebounce } from '@uidotdev/usehooks'
import { useLanguage } from '@/context/language'

export type SelectedItem = { id: number; type: 'tv' | 'movie'; title: string }

export const ImagePickerRoot = ({ children }: PropsWithChildren) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<null | SelectedItem>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const { dictionary } = useLanguage()

  const content = useMemo(() => {
    if (selectedItem) {
      return (
        <ImagePickerList
          selectedItem={selectedItem}
          handleCloseDialog={() => setOpenDialog(false)}
        />
      )
    }

    if (debouncedSearch === '') {
      return (
        <ImagePickerInitialList
          onSelect={(selectedItem) => setSelectedItem(selectedItem)}
        />
      )
    }

    if (debouncedSearch !== '') {
      return (
        <ImagePickerListResults
          search={debouncedSearch}
          onSelect={(selectedItem) => setSelectedItem(selectedItem)}
        />
      )
    }
  }, [debouncedSearch, selectedItem])

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      {children}

      <DialogContent className="gap-0 p-0">
        <DialogHeader className="items-start space-y-4 border-b p-4">
          <DialogTitle>Select an image</DialogTitle>

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
