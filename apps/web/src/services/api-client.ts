/**
 * Fetch-based API client (uses undici in Node 18+).
 * Replaces axios for Orval-generated API calls.
 */

let _authToken: string | null = null

export function setAuthToken(token: string | null) {
  _authToken = token
}

export function getAuthToken() {
  return _authToken
}

const getBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL
  if (!base) throw new Error('NEXT_PUBLIC_API_URL is not set')
  return base.replace(/\/$/, '')
}

/** Error thrown on 4xx/5xx responses (axios-like behavior) */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: unknown,
    public readonly headers: Headers
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Matches Orval-generated RequestInit for full type compatibility */
export type CustomFetchOptions = RequestInit

export const customFetch = async <T>(
  url: string,
  options?: CustomFetchOptions
): Promise<T> => {
  const baseUrl = getBaseUrl()
  const targetUrl = url.startsWith('http') ? url : `${baseUrl}${url}`

  const headers = new Headers((options?.headers as HeadersInit) ?? {})
  headers.set('X-Client', 'web')
  if (_authToken) {
    headers.set('Authorization', `Bearer ${_authToken}`)
  }
  if (
    options?.body &&
    typeof options.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(targetUrl, {
    method: options?.method ?? 'GET',
    headers,
    body: options?.body,
    signal: options?.signal,
  })

  const contentType = response.headers.get('content-type')
  let data: unknown
  if (contentType?.includes('application/json')) {
    const text = await response.text()
    data = text ? JSON.parse(text) : null
  } else if ([204, 205].includes(response.status)) {
    data = null
  } else {
    data = await response.text()
  }

  const result = {
    data,
    status: response.status,
    headers: response.headers,
  } as T

  if (response.status >= 400) {
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      data,
      response.headers
    )
  }

  return result
}

/** Request body type for mutations (identity) */
export type BodyType<BodyData> = BodyData

/** Error type for react-query */
export type ErrorType<Error> = Error
