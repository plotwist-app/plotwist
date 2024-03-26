'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import { DetailedCollection } from '@plotwist/tmdb'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@plotwist/ui'

import { CollectionListDropdown } from '@/components/lists/collection-list-button'

import { MovieCard } from '@/components/movie-card'

import { useLanguage } from '@/context/language'

type MovieCollectionDialogProps = { collection: DetailedCollection }

export const MovieCollectionDialog = ({
  collection,
}: MovieCollectionDialogProps) => {
  const { name, parts } = collection

  const [openDialog, setOpenDialog] = useState(false)
  const pathname = usePathname()
  const { dictionary, language } = useLanguage()

  useEffect(() => {
    if (openDialog) {
      setOpenDialog(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      <Button onClick={() => setOpenDialog(true)}>
        {dictionary.movie_collection.see_collection}
      </Button>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-h-[75vh] overflow-y-auto sm:max-w-[768px]">
          <DialogHeader className="space-x-2 text-start">
            <DialogTitle className="flex items-center space-x-2">
              {name}

              <div className="ml-2">
                <CollectionListDropdown items={parts} />
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
            {parts.map((movie) => (
              <MovieCard movie={movie} key={movie.id} language={language} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
