import type { GetUserPreferences200 } from '@/api/endpoints.schemas'
import { formatDateToURL } from '@/utils/date/format-date-to-url'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import type { MoviesListFiltersFormValues } from '.'

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

type QueryPart = {
  key: string
  value: string | Date
}

export const buildQueryStringFromValues = (
  values: MoviesListFiltersFormValues
) => {
  const parts: string[] = []
  const entries = Object.entries(values)

  for (const [key, value] of entries) {
    if (!value) continue

    const queryParts = extractQueryParts(key, value)

    parts.push(
      ...queryParts.map(part => formatValueForQueryString(part.key, part.value))
    )
  }

  return parts.join('&')
}

const extractQueryParts = (key: string, value: unknown): QueryPart[] => {
  if (!isValidValue(value)) return []

  if (Array.isArray(value)) {
    return handleArrayValue(key, value)
  }

  if (typeof value === 'object') {
    return handleObjectValue(key, value as Record<string, unknown>)
  }

  return [{ key, value: value as string | Date }]
}

const isValidValue = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length > 0
  return value !== null && value !== undefined
}

const handleArrayValue = (key: string, value: unknown[]): QueryPart[] => {
  return [{ key, value: value.join('|') }]
}

const handleObjectValue = (
  key: string,
  obj: Record<string, unknown>
): QueryPart[] => {
  const parts: QueryPart[] = []

  for (const [subKey, subValue] of Object.entries(obj)) {
    if (subValue) {
      parts.push({ key: `${key}.${subKey}`, value: subValue as string | Date })
    }
  }

  return parts
}

export const getDefaultValues = (
  searchParams: ReadonlyURLSearchParams,
  userPreferences?: GetUserPreferences200['userPreferences']
) => {
  const parseList = (param: string): number[] | undefined => {
    const value = searchParams.get(param)
    return value ? value.split('|').map(Number) : undefined
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

  const defaultWatchProvidersIds = userPreferences?.watchProvidersIds
    ? userPreferences.watchProvidersIds
    : parseList('with_watch_providers')

  return {
    genres: parseList('genres'),
    with_watch_providers: defaultWatchProvidersIds,
    with_original_language: getString('with_original_language'),
    watch_region: getString('watch_region'),
    release_date: {
      gte: getDate('release_date.gte'),
      lte: getDate('release_date.lte'),
    },
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
