'use client'

import { useLanguage } from '@/context/language'
import { Separator } from '@plotwist/ui/components/ui/separator'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

export const Followers = () => {
  const { dictionary } = useLanguage()
  const isLoading = false

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="flex gap-1">
        {isLoading ? (
          <Skeleton className="aspect-square w-[2ch]" />
        ) : (
          <span className="font-medium text-foreground">{0}</span>
        )}

        <p>{dictionary.followers}</p>
      </div>

      <Separator orientation="vertical" className="h-4" />

      <div className="flex gap-1">
        {isLoading ? (
          <Skeleton className="aspect-square w-[2ch]" />
        ) : (
          <span className="font-medium text-foreground">{0}</span>
        )}

        <p>{dictionary.following}</p>
      </div>
    </div>
  )
}
