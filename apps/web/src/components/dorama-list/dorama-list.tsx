'use client'

import { useLanguage } from '@/context/language'
import { DoramaListContent } from './dorama-list-content'
import { useUserPreferences } from '@/context/user-preferences'
import { Badge } from '@plotwist/ui/components/ui/badge'

export const DoramaList = () => {
  const { dictionary } = useLanguage()
  const { userPreferences } = useUserPreferences()

  const hasPreferences =
    userPreferences?.watchProvidersIds &&
    userPreferences?.watchProvidersIds.length > 0

  return (
    <div className="space-y-4">
      {hasPreferences && (
        <Badge variant="secondary">
          {dictionary.available_on_streaming_services}
        </Badge>
      )}

      <DoramaListContent />
    </div>
  )
}
