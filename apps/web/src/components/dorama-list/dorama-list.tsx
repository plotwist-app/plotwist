'use client'

import { DoramaListContent } from './dorama-list-content'
import { StreamingServicesBadge } from '../streaming-services-badge'

export const DoramaList = () => {
  return (
    <div className="space-y-4">
      <StreamingServicesBadge />

      <DoramaListContent />
    </div>
  )
}
