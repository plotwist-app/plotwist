'use client'

import { Link } from 'next-view-transitions'
import { useSession } from '@/context/session'
import { useLanguage } from '@/context/language'
import { Badge } from '@plotwist/ui/components/ui/badge'

export function StreamingServicesBadge() {
  const { user } = useSession()
  const { language, dictionary } = useLanguage()

  if (!user) return null

  return (
    <Link href={`/${language}/${user?.username}?tab=preferences`}>
      <Badge variant="secondary">
        {dictionary.available_on_streaming_services}
      </Badge>
    </Link>
  )
}
