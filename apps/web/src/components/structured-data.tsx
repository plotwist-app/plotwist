type JsonLdProps = {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return <script type="application/ld+json">{JSON.stringify(data)}</script>
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Plotwist',
        url: 'https://plotwist.app',
        description:
          'Track movies, series, anime, and doramas. Build your watchlist, rate content, and discover new titles.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate:
              'https://plotwist.app/en-US/movies/discover?query={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  )
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Plotwist',
        url: 'https://plotwist.app',
        logo: 'https://plotwist.app/logo-black.png',
        sameAs: [
          'https://x.com/plotwist_cinema',
          'https://github.com/plotwist-app/plotwist',
          'https://discord.gg/ZsBJm9Qk',
        ],
      }}
    />
  )
}

type MovieJsonLdProps = {
  name: string
  description: string
  image: string
  datePublished: string
  rating: number
  url: string
}

export function MovieJsonLd({
  name,
  description,
  image,
  datePublished,
  rating,
  url,
}: MovieJsonLdProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name,
        description,
        image,
        datePublished,
        url,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: rating,
          bestRating: 10,
          worstRating: 0,
          ratingCount: 1,
        },
      }}
    />
  )
}

type BreadcrumbItem = {
  name: string
  url: string
}

type BreadcrumbJsonLdProps = {
  items: BreadcrumbItem[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  )
}

type TvSeriesJsonLdProps = {
  name: string
  description: string
  image: string
  url: string
}

export function TvSeriesJsonLd({
  name,
  description,
  image,
  url,
}: TvSeriesJsonLdProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'TVSeries',
        name,
        description,
        image,
        url,
      }}
    />
  )
}
