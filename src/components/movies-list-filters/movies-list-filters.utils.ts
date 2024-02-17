import { formatDateToURL } from '@/utils/date/format-date-to-url'
import { MoviesListFiltersFormValues } from '.'
import { ReadonlyURLSearchParams } from 'next/navigation'

export const formatValueForQueryString = (
  key: string,
  value: Date | string,
): string => {
  if (value instanceof Date) {
    return `${encodeURIComponent(key)}=${encodeURIComponent(
      formatDateToURL(value),
    )}`
  }

  return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
}

export const buildQueryStringFromValues = (
  values: MoviesListFiltersFormValues,
): string => {
  const parts: string[] = []

  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        if (value.length > 0) return parts.push(`${key}=${value.join(',')}`)
      }

      Object.entries(value).forEach(([subKey, subValue]) => {
        if (subValue) {
          parts.push(formatValueForQueryString(`${key}.${subKey}`, subValue))
        }
      })

      return
    }

    if (value) {
      parts.push(formatValueForQueryString(key, value))
    }
  })

  return parts.join('&')
}

export const getDefaultValues = (searchParams: ReadonlyURLSearchParams) => {
  const startDate = searchParams.get('release_date.gte')
  const endDate = searchParams.get('release_date.lte')

  const watchProviders = searchParams
    .get('with_watch_providers')
    ?.split(',')
    .map(Number)

  return {
    genres: searchParams.get('genres')?.split(',').map(Number),
    with_original_language:
      searchParams.get('with_original_language') ?? undefined,
    watch_region: searchParams.get('watch_region') ?? undefined,
    with_watch_providers: watchProviders ?? undefined,
    release_date: {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    },
    sort_by: searchParams.get('sort_by') ?? undefined,
  }
}
