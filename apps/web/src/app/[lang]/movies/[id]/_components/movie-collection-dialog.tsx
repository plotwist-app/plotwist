'use client'

import type { DetailedCollection } from '@/services/tmdb'
import Link from 'next/link'
import { useState } from 'react'

import { PosterCard } from '@/components/poster-card'
import { Button } from '@plotwist/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@plotwist/ui/components/ui/dialog'

import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'

type MovieCollectionDialogProps = { collection: DetailedCollection }

export const MovieCollectionDialog = ({
  collection,
}: MovieCollectionDialogProps) => {
  const { name, parts } = collection

  const [openDialog, setOpenDialog] = useState(false)
  const { dictionary, language } = useLanguage()

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
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 grid grid-cols-3 gap-4">
            {parts.map(movie => (
              <Link href={`/${language}/movies/${movie.id}`} key={movie.id}>
                <PosterCard.Root>
                  <PosterCard.Image
                    src={tmdbImage(movie.poster_path, 'w500')}
                    alt={movie.title}
                  />
                </PosterCard.Root>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
