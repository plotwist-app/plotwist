'use client'

import { MovieCard } from '@/components/movie-card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DetailedCollection } from 'tmdb-ts'

type MovieCollectionDialogProps = { collection: DetailedCollection }

export const MovieCollectionDialog = ({
  collection,
}: MovieCollectionDialogProps) => {
  const { name, overview, parts } = collection

  const [openDialog, setOpenDialog] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (openDialog) {
      setOpenDialog(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      <Button onClick={() => setOpenDialog(true)}>See collection</Button>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-h-[75vh] overflow-y-auto sm:max-w-[978px]">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
            <DialogDescription>{overview}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-x-4 gap-y-8">
            {parts.map((movie) => (
              <MovieCard movie={movie} key={movie.id} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
