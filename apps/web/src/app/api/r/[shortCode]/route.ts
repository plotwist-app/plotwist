import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    return new NextResponse('API URL not configured', { status: 500 })
  }

  try {
    // In the Node.js runtime (not Edge), redirect: 'manual' preserves the
    // 302 status and Location header so we can redirect without an extra hop.
    const res = await fetch(`${apiUrl}/shared-url/${shortCode}`, {
      redirect: 'manual',
    })

    const location = res.headers.get('location')

    if ((res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) && location) {
      return NextResponse.redirect(location)
    }

    // Fallback: if backend returned 200 or short code not found
    if (res.status === 404) {
      return new NextResponse('Short URL not found', { status: 404 })
    }

    return new NextResponse('Unexpected response', { status: 502 })
  } catch (err) {
    console.error('[/api/r] Failed to resolve short code:', shortCode, err)
    return new NextResponse('Not found', { status: 404 })
  }
}
