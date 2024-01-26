export interface Flatrate {
  display_priority: number
  logo_path: string
  provider_id: number
  provider_name: string
}
export interface Rent {
  display_priority: number
  logo_path: string
  provider_id: number
  provider_name: string
}
export interface Buy {
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

export interface WatchProviders {
  id: number
  results: WatchLocale
}
