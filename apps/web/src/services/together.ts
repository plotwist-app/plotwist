import { ApiError, customFetch, getAuthToken } from '@/services/api-client'

export type TogetherMediaType = 'MOVIE' | 'TV_SHOW'
export type TogetherDecision = 'LIKE' | 'PASS' | 'MAYBE'

export type TogetherRoom = {
  id: string
  code: string
  watchProviderIds: number[] | null
  watchRegion: string
  maxRuntime: number | null
  mood: string
  maxParticipants: number
  createdAt: string
}

export type TogetherParticipant = {
  id: string
  displayName: string
  userId?: string | null
  createdAt?: string
}

export type TogetherSession = {
  room: TogetherRoom
  participant: TogetherParticipant
  participantToken: string
}

export type TogetherRoomState = {
  room: TogetherRoom
  participants: TogetherParticipant[]
  me: { id: string; displayName: string } | null
  swipedIds: { tmdbId: number; mediaType: string }[]
}

export type TogetherMatch = {
  tmdbId: number
  mediaType: string
  title: string
  posterPath: string | null
  voteAverage: number | null
  releaseDate: string | null
  overview?: string | null
  likeCount: number
  maybeCount?: number
  interestCount?: number
  matchPercent: number
  highlighted?: boolean
}

type Envelope<T> = { data: T; status: number; headers: Headers }
const TOGETHER_ROOM_FULL_MESSAGE = 'Room is full.'

export function isTogetherRoomFullError(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 400) return false
  if (
    typeof error.data !== 'object' ||
    error.data === null ||
    !('message' in error.data)
  ) {
    return false
  }

  return error.data.message === TOGETHER_ROOM_FULL_MESSAGE
}

const tokenKey = (code: string) => `plotwist.together.${code.toUpperCase()}`

export function getTogetherToken(code: string) {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(tokenKey(code))
}

export function setTogetherToken(code: string, token: string) {
  localStorage.setItem(tokenKey(code), token)
}

export function clearTogetherToken(code: string) {
  localStorage.removeItem(tokenKey(code))
}

async function togetherFetch<T>(
  path: string,
  options: {
    method?: string
    body?: unknown
    token?: string | null
  } = {}
) {
  const headers = new Headers()
  if (options.token) {
    headers.set('X-Together-Token', options.token)
  }
  if (getAuthToken()) {
    headers.set('Authorization', `Bearer ${getAuthToken()}`)
  }

  const { data } = await customFetch<Envelope<T>>(path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  return data
}

export function createTogetherRoom(body: {
  displayName: string
  watchProviderIds: number[]
  watchRegion: string
}) {
  return togetherFetch<TogetherSession>('/together/rooms', {
    method: 'POST',
    body,
  })
}

export function getTogetherRoom(code: string, token?: string | null) {
  return togetherFetch<TogetherRoomState>(
    `/together/rooms/${code.toUpperCase()}`,
    { token }
  )
}

export function joinTogetherRoom(
  code: string,
  body: { displayName: string },
  token?: string | null
) {
  return togetherFetch<TogetherSession>(
    `/together/rooms/${code.toUpperCase()}/join`,
    { method: 'POST', body, token }
  )
}

export function createTogetherSwipe(
  code: string,
  token: string,
  body: {
    tmdbId: number
    mediaType: TogetherMediaType
    decision: TogetherDecision
    title: string
    posterPath?: string | null
    voteAverage?: number | null
    releaseDate?: string | null
    overview?: string | null
  }
) {
  return togetherFetch<{
    swipe: { id: string; tmdbId: number; decision: TogetherDecision }
    match: TogetherMatch | null
  }>(`/together/rooms/${code.toUpperCase()}/swipes`, {
    method: 'POST',
    body,
    token,
  })
}

export function getTogetherMatches(code: string, token: string) {
  return togetherFetch<{ matches: TogetherMatch[] }>(
    `/together/rooms/${code.toUpperCase()}/matches`,
    { token }
  )
}
