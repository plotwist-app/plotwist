'use client'

import { Badge } from '@plotwist/ui/components/ui/badge'
import { Link } from 'next-view-transitions'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'

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
