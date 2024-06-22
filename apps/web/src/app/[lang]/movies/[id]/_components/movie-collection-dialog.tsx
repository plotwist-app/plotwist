'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { DetailedCollection } from '@plotwist/tmdb'

import { CollectionListDropdown } from '@/components/lists/collection-list-button'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PosterCard } from '@/components/poster-card'

import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'

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
        <DialogContent className="max-h-[75vh] overflow-y-auto sm:max-w-xl">
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
              <Link href={`/${language}/movies/${movie.id}`} key={movie.id}>
                <PosterCard.Root>
                  <PosterCard.Image
                    src={tmdbImage(movie.poster_path, 'w500')}
                    alt={movie.title}
                  />

                  <PosterCard.Details>
                    <PosterCard.Title>{movie.title}</PosterCard.Title>
                    <PosterCard.Year>
                      {movie.release_date.split('-')[0]}
                    </PosterCard.Year>
                  </PosterCard.Details>
                </PosterCard.Root>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
