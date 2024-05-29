'use client'

import { Forward } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { RecommendationDialogProfiles } from './recommendation-dialog-profiles'
import { useAuth } from '@/context/auth'
import Link from 'next/link'
import { useLanguage } from '@/context/language'

export const RecommendationDialog = () => {
  const { user } = useAuth()
  const { language } = useLanguage()

  if (!user) {
    return (
      <Button className="h-6 px-2.5 py-0.5 text-xs" variant="outline" asChild>
        <Link href={`/${language}/login`}>
          <Forward className="mr-2 size-3" />
          Recomendar
        </Link>
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-6 px-2.5 py-0.5 text-xs" variant="outline">
          <Forward className="mr-2 size-3" />
          Recomendar
        </Button>
      </DialogTrigger>

      <DialogContent className="gap-0 p-0">
        <RecommendationDialogProfiles />
      </DialogContent>
    </Dialog>
  )
}
