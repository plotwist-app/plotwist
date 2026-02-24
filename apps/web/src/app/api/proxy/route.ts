import axios from 'axios'
import { NextResponse } from 'next/server'

// Limit function execution time to 10 seconds
export const maxDuration = 10

// Allowed domains for proxy requests (security measure)
const ALLOWED_DOMAINS = [
  'image.tmdb.org',
  'i.scdn.co', // Spotify images
  'mosaic.scdn.co', // Spotify mosaic images
]

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return ALLOWED_DOMAINS.some(domain => url.hostname.endsWith(domain))
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL é necessária' }, { status: 400 })
  }

  // Validate URL is from allowed domains
  if (!isAllowedUrl(url)) {
    return NextResponse.json(
      { error: 'Domínio não permitido' },
      { status: 403 }
    )
  }

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 8000, // 8 seconds timeout (less than maxDuration)
    })
    const contentType =
      response.headers['content-type'] || 'application/octet-stream'

    return new Response(response.data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error('Erro ao buscar imagem:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar imagem' },
      { status: 500 }
    )
  }
}
