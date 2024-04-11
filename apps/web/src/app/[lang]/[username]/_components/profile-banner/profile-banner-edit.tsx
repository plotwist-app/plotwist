import { PropsWithChildren, useMemo, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useDebounce } from '@uidotdev/usehooks'
import { ChevronLeft } from 'lucide-react'

import { ProfileBannerEditSearchInitialResults } from './profile-banner-edit-search-initial-results'
import { ProfileBannerEditSearchResults } from './profile-banner-edit-search-results'
import { ProfileBannerEditImages } from './profile-banner-edit-images'

export type SelectedItem = { id: number; type: 'tv' | 'movie'; title: string }

type ProfileBannerEditProps = PropsWithChildren
export const ProfileBannerEdit = ({ children }: ProfileBannerEditProps) => {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [selectedItem, setSelectedItem] = useState<null | SelectedItem>(null)
  const [openDialog, setOpenDialog] = useState(false)

  const content = useMemo(() => {
    if (selectedItem) {
      return (
        <ProfileBannerEditImages
          selectedItem={selectedItem}
          handleCloseDialog={() => setOpenDialog(false)}
        />
      )
    }

    if (debouncedSearch === '') {
      return (
        <ProfileBannerEditSearchInitialResults
          onSelect={(selectedItem) => setSelectedItem(selectedItem)}
        />
      )
    }

    if (debouncedSearch !== '') {
      return (
        <ProfileBannerEditSearchResults
          search={debouncedSearch}
          onSelect={(selectedItem) => setSelectedItem(selectedItem)}
        />
      )
    }
  }, [debouncedSearch, selectedItem])

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <section className="group relative flex h-[30dvh] max-h-[720px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-none border lg:h-[55dvh] lg:rounded-lg">
          <div className="absolute z-20 h-full w-full bg-black/30 opacity-0 transition-all group-hover:opacity-100" />

          <p className="spacing z-30 scale-0 text-xs  font-bold uppercase tracking-wider text-white transition-all group-hover:scale-100">
            Change banner
          </p>

          {children}
        </section>
      </DialogTrigger>

      <DialogContent className="gap-0 p-0">
        <DialogHeader className="items-start space-y-4 border-b p-4">
          <DialogTitle>Change profile banner</DialogTitle>

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
              placeholder="Search movies or series..."
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
