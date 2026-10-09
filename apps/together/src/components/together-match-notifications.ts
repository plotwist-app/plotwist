import type { TogetherMatch } from '@/services/together'

const acknowledgedMatchesKey = (roomCode: string) =>
  `plotwist.together.acknowledged-matches.${roomCode.toUpperCase()}`

export function togetherMatchKey(
  match: Pick<TogetherMatch, 'mediaType' | 'tmdbId'>
) {
  return `${match.mediaType}:${match.tmdbId}`
}

export function getAcknowledgedTogetherMatchKeys(roomCode: string) {
  if (typeof window === 'undefined') return new Set<string>()

  const stored = sessionStorage.getItem(acknowledgedMatchesKey(roomCode))
  if (!stored) return new Set<string>()

  try {
    const keys: unknown = JSON.parse(stored)
    return new Set(
      Array.isArray(keys)
        ? keys.filter((key): key is string => typeof key === 'string')
        : []
    )
  } catch {
    return new Set<string>()
  }
}

export function acknowledgeTogetherMatch(
  roomCode: string,
  match: Pick<TogetherMatch, 'mediaType' | 'tmdbId'>
) {
  const acknowledged = getAcknowledgedTogetherMatchKeys(roomCode)
  acknowledged.add(togetherMatchKey(match))
  sessionStorage.setItem(
    acknowledgedMatchesKey(roomCode),
    JSON.stringify([...acknowledged])
  )
}

export function firstUnacknowledgedTogetherMatch(
  roomCode: string,
  matches: TogetherMatch[]
) {
  const acknowledged = getAcknowledgedTogetherMatchKeys(roomCode)
  return (
    matches.find(match => !acknowledged.has(togetherMatchKey(match))) ?? null
  )
}
