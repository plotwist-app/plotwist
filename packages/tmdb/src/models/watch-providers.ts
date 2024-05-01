export type Flatrate = {
  display_priority: number
  logo_path: string
  provider_id: number
  provider_name: string
}

export type Rent = {
  display_priority: number
  logo_path: string
  provider_id: number
  provider_name: string
}

export type Buy = {
  display_priority: number
  logo_path: string
  provider_id: number
  provider_name: string
}

type WatchLocaleItem = {
  link: string
  flatrate: Flatrate[]
  rent: Rent[]
  buy: Buy[]
}

type CountryCode =
  | 'AR'
  | 'AT'
  | 'AU'
  | 'BE'
  | 'BR'
  | 'CA'
  | 'CH'
  | 'CL'
  | 'CO'
  | 'CZ'
  | 'DE'
  | 'DK'
  | 'EC'
  | 'EE'
  | 'ES'
  | 'FI'
  | 'FR'
  | 'GB'
  | 'GR'
  | 'HU'
  | 'ID'
  | 'IE'
  | 'IN'
  | 'IT'
  | 'JP'
  | 'KR'
  | 'LT'
  | 'LV'
  | 'MX'
  | 'MY'
  | 'NL'
  | 'NO'
  | 'NZ'
  | 'PE'
  | 'PH'
  | 'PL'
  | 'PT'
  | 'RO'
  | 'RU'
  | 'SE'
  | 'SG'
  | 'TH'
  | 'TR'
  | 'US'
  | 'VE'
  | 'ZA'

export type WatchLocale = {
  [key in CountryCode]: WatchLocaleItem
}

export type WatchProviders = {
  id: number
  results: WatchLocale
}

export type GetWatchProvidersResponse = {
  results: Array<{
    display_priorities: Record<string, number>
    display_priority: number
    logo_path: string
    provider_name: string
    provider_id: number
  }>
}

export type GetAvailableRegionsResponse = {
  results: Array<{
    english_name: string
    iso_3166_1: string
    native_name: string
  }>
}
