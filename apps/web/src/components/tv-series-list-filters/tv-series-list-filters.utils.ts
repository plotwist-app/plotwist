import { formatDateToURL } from '@/utils/date/format-date-to-url'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import type { TvSeriesListFiltersFormValues } from '.'

export const formatValueForQueryString = (
  key: string,
  value: Date | string
): string => {
  if (value instanceof Date) {
    return `${encodeURIComponent(key)}=${encodeURIComponent(
      formatDateToURL(value)
    )}`
  }

  return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
}

export const buildQueryStringFromValues = (
  values: TvSeriesListFiltersFormValues
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
  const parseList = (param: string): number[] | undefined => {
    const value = searchParams.get(param)
    return value ? value.split(',').map(Number) : undefined
  }

  const getDate = (param: string): Date | undefined => {
    const value = searchParams.get(param)
    return value ? new Date(value) : undefined
  }

  const getNumberOrDefault = (param: string, defaultValue: number): number => {
    const value = searchParams.get(param)
    return value ? Number(value) : defaultValue
  }

  const getString = (param: string): string | undefined => {
    const value = searchParams.get(param)
    return value || undefined
  }

  return {
    air_date: {
      gte: getDate('air_date.gte'),
      lte: getDate('air_date.lte'),
    },
    genres: parseList('genres'),
    with_watch_providers: parseList('with_watch_providers'),
    with_original_language: getString('with_original_language'),
    watch_region: getString('watch_region'),
    sort_by: getString('sort_by'),
    vote_average: {
      gte: getNumberOrDefault('vote_average.gte', 0),
      lte: getNumberOrDefault('vote_average.lte', 10),
    },
    vote_count: {
      gte: getNumberOrDefault('vote_count.gte', 0),
    },
  }
}
