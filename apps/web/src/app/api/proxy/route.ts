import axios from 'axios'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL é necessária' }, { status: 400 })
  }

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const contentType =
      response.headers['content-type'] || 'application/octet-stream'

    return new Response(response.data, {
      headers: {
        'Content-Type': contentType,
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
