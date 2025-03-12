'use client'

import { StreamingServicesBadge } from '../streaming-services-badge'
import { DoramaListContent } from './dorama-list-content'

export const DoramaList = () => {
  return (
    <div className="space-y-4">
      <StreamingServicesBadge />

      <DoramaListContent />
    </div>
  )
}
