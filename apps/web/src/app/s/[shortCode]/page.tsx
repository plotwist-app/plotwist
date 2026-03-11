import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMovieMetadata } from '@/utils/seo/get-movie-metadata'
import { getTvMetadata } from '@/utils/seo/get-tv-metadata'
import { ShortCodeRedirect } from './_redirect'

type ShortCodePageProps = {
  params: Promise<{ shortCode: string }>
}

async function resolveShortCode(shortCode: string): Promise<string | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) return null

  try {
    const res = await fetch(`${apiUrl}/shared-url/${shortCode}`, {
      redirect: 'manual',
    })
    const location = res.headers.get('location')
    if ((res.status === 301 || res.status === 302) && location) {
      return location
    }
  } catch {}

  return null
}

function parseOriginalUrl(url: string) {
  try {
    const { pathname } = new URL(url)
    // pathname: /en-US/movies/12345 or /en-US/tv-series/12345
    const [, lang, type, id] = pathname.split('/')
    if (lang && type && id) return { lang, type, id }
  } catch {}
  return null
}

export async function generateMetadata(
  props: ShortCodePageProps
): Promise<Metadata> {
  const { shortCode } = await props.params
  const originalUrl = await resolveShortCode(shortCode)
  if (!originalUrl) return {}

  const parsed = parseOriginalUrl(originalUrl)
  if (!parsed) return {}

  const { lang, type, id } = parsed

  try {
    if (type === 'movies') return getMovieMetadata(Number(id), lang)
    if (type === 'tv-series') return getTvMetadata(Number(id), lang)
  } catch {}

  return {}
}

export default async function ShortCodePage(props: ShortCodePageProps) {
  const { shortCode } = await props.params
  const originalUrl = await resolveShortCode(shortCode)

  if (!originalUrl) notFound()

  // Serve OG tags to social bots via generateMetadata(), then redirect real
  // users via JS. Bots don't execute JS so they read the OG tags from the HTML.
  return <ShortCodeRedirect url={originalUrl} />
}
