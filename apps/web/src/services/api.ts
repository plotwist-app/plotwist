const URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
const baseURL = URL ? `http://${URL}/api` : 'http://localhost:3000/api'

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
) {
  const { timeout = 30000, ...init } = options
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    clearTimeout(id)
    const data = await res.json().catch(() => null)
    return { data, status: res.status, headers: res.headers }
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

export const api = {
  post: (path: string, body?: unknown) =>
    fetchWithTimeout(`${baseURL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }),
}
