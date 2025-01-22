import type { Language } from '@/types/languages'
import type { MediaType } from '@/types/media-type'

type EpisodeBadgeProps = {
  seasonNumber?: number | null
  episodeNumber?: number | null
}

export function getEpisodeBadge({
  seasonNumber,
  episodeNumber,
}: EpisodeBadgeProps) {
  if (seasonNumber && episodeNumber) {
    return ` (S${String(seasonNumber).padStart(2, '0')}E${String(episodeNumber).padStart(2, '0')})`
  }

  if (seasonNumber) {
    return ` (S${String(seasonNumber).padStart(2, '0')})`
  }

  return undefined
}

type ReviewHrefProps = {
  language: Language
  mediaType: MediaType
  tmdbId: number
  seasonNumber?: number | null
  episodeNumber?: number | null
}

export function getReviewHref({
  language,
  mediaType,
  tmdbId,
  seasonNumber,
  episodeNumber,
}: ReviewHrefProps) {
  if (mediaType === 'MOVIE') {
    return `/${language}/movies/${tmdbId}`
  }

  if (seasonNumber && episodeNumber) {
    return `/${language}/tv-series/${tmdbId}/seasons/${seasonNumber}/episodes/${episodeNumber}`
  }

  if (seasonNumber) {
    return `/${language}/tv-series/${tmdbId}/seasons/${seasonNumber}`
  }

  return `/${language}/tv-series/${tmdbId}`
}
