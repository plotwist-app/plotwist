'use client'

import Link from 'next/link'

import { Forward } from 'lucide-react'
import { Button } from '@plotwist/ui/components/ui/button'

import { useAuth } from '@/context/auth'
import { useLanguage } from '@/context/language'

import { RecommendationDialogProfiles } from './recommendation-dialog-profiles'

export const RecommendationDialog = () => {
  const { user } = useAuth()
  const { language, dictionary } = useLanguage()

  if (!user) {
    return (
      <Button className="h-6 px-2.5 py-0.5 text-xs" variant="outline" asChild>
        <Link href={`/${language}/login`}>
          <Forward className="mr-2 size-3" />
          {dictionary.recommend}
        </Link>
      </Button>
    )
  }

  return <RecommendationDialogProfiles />
}
