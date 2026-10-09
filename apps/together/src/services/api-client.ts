const CLIENT_NAME = 'together-web'

const getBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL
  if (!base) throw new Error('NEXT_PUBLIC_API_URL is not set')
  return base.replace(/\/$/, '')
}

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

export type ApiResponse<T> = { data: T; status: number; headers: Headers }

export const customFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> => {
  const targetUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`

  const headers = new Headers(options?.headers ?? {})
  headers.set('X-Client', CLIENT_NAME)
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

  if (response.status >= 400) {
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      data,
      response.headers
    )
  }

  return { data: data as T, status: response.status, headers: response.headers }
}
