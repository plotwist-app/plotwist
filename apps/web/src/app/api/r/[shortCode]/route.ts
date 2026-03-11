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
    const res = await fetch(`${apiUrl}/shared-url/${shortCode}`, {
      redirect: 'follow',
    })

    if (res.redirected && res.url) {
      return NextResponse.redirect(res.url)
    }

    return new NextResponse('Not found', { status: 404 })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
