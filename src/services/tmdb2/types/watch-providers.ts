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
export interface WatchLocale {
  AR: {
    link: string
    flatrate: Flatrate[]
    rent: Rent[]
    buy: Buy[]
  }
  AT: {
    link: string
    rent: Rent[]
    buy: Buy[]
  }
  AU: {
    link: string
    flatrate: Flatrate[]
    rent: Rent[]
    buy: Buy[]
  }
  BE: {
    link: string
    buy: Buy[]
    flatrate: Flatrate[]
    rent: Rent[]
  }
  BR: {
    link: string
    rent: Rent[]
    buy: Buy[]
    flatrate: Flatrate[]
  }
  CA: {
    link: string
    rent: Rent[]
    flatrate: Flatrate[]
    buy: Buy[]
  }
  CH: {
    link: string
    rent: Rent[]
    buy: Buy[]
    flatrate: Flatrate[]
  }
  CL: {
    link: string
    flatrate: Flatrate[]
    buy: Buy[]
    rent: Rent[]
  }
  CO: {
    link: string
    flatrate: Flatrate[]
    rent: Rent[]
    buy: Buy[]
  }
  CZ: {
    link: string
    buy: Buy[]
    flatrate: Flatrate[]
    rent: Rent[]
  }
  DE: {
    link: string
    rent: Rent[]
    buy: Buy[]
  }
  DK: {
    link: string
    rent: Rent[]
    buy: Buy[]
    flatrate: Flatrate[]
  }
  EC: {
    link: string
    flatrate: Flatrate[]
    buy: Buy[]
    rent: Rent[]
  }
  EE: {
    link: string
    flatrate: Flatrate[]
    buy: Buy[]
    rent: Rent[]
  }
  ES: {
    link: string
    rent: Rent[]
    flatrate: Flatrate[]
    buy: Buy[]
  }
  FI: {
    link: string
    buy: Buy[]
    flatrate: Flatrate[]
    rent: Rent[]
  }
  FR: {
    link: string
    flatrate: Flatrate[]
    buy: Buy[]
    rent: Rent[]
  }
  GB: {
    link: string
    rent: Rent[]
    flatrate: Flatrate[]
    buy: Buy[]
  }
  GR: {
    link: string
    flatrate: Flatrate[]
    rent: Rent[]
    buy: Buy[]
  }
  HU: {
    link: string
    rent: Rent[]
    buy: Buy[]
    flatrate: Flatrate[]
  }
  ID: {
    link: string
    flatrate: Flatrate[]
    rent: Rent[]
    buy: Buy[]
  }
  IE: {
    link: string
    rent: Rent[]
    flatrate: Flatrate[]
    buy: Buy[]
  }
  IN: {
    link: string
    buy: Buy[]
    flatrate: Flatrate[]
    rent: Rent[]
  }
  IT: {
    link: string
    buy: Buy[]
    flatrate: Flatrate[]
    rent: Rent[]
  }
  JP: {
    link: string
    rent: Rent[]
    flatrate: Flatrate[]
    buy: Buy[]
  }
  KR: {
    link: string
    buy: Buy[]
    rent: Rent[]
    flatrate: Flatrate[]
  }
  LT: {
    link: string
    buy: Buy[]
    flatrate: Flatrate[]
  }
  LV: {
    link: string
    buy: Buy[]
    flatrate: Flatrate[]
  }
  MX: {
    link: string
    flatrate: Flatrate[]
    rent: Rent[]
    buy: Buy[]
  }
  MY: {
    link: string
    rent: Rent[]
    flatrate: Flatrate[]
    buy: Buy[]
  }
  NL: {
    link: string
    flatrate: Flatrate[]
    buy: Buy[]
    rent: Rent[]
  }
  NO: {
    link: string
    buy: Buy[]
    rent: Rent[]
    flatrate: Flatrate[]
  }
  NZ: {
    link: string
    buy: Buy[]
    rent: Rent[]
    flatrate: Flatrate[]
  }
  PE: {
    link: string
    flatrate: Flatrate[]
    rent: Rent[]
    buy: Buy[]
  }
  PH: {
    link: string
    rent: Rent[]
    buy: Buy[]
    flatrate: Flatrate[]
  }
  PL: {
    link: string
    rent: Rent[]
    flatrate: Flatrate[]
    buy: Buy[]
  }
  PT: {
    link: string
    rent: Rent[]
    flatrate: Flatrate[]
    buy: Buy[]
  }
  RO: {
    link: string
    flatrate: Flatrate[]
  }
  RU: {
    link: string
    rent: Rent[]
    flatrate: Flatrate[]
    buy: Buy[]
  }
  SE: {
    link: string
    rent: Rent[]
    flatrate: Flatrate[]
    buy: Buy[]
  }
  SG: {
    link: string
    flatrate: Flatrate[]
    buy: Buy[]
    rent: Rent[]
  }
  TH: {
    link: string
    flatrate: Flatrate[]
    rent: Rent[]
    buy: Buy[]
  }
  TR: {
    link: string
    buy: Buy[]
    rent: Rent[]
    flatrate: Flatrate[]
  }
  US: {
    link: string
    rent: Rent[]
    buy: Buy[]
    flatrate: Flatrate[]
  }
  VE: {
    link: string
    flatrate: Flatrate[]
    rent: Rent[]
    buy: Buy[]
  }
  ZA: {
    link: string
    rent: Rent[]
    buy: Buy[]
    flatrate: Flatrate[]
  }
}

export interface WatchProviders {
  id: number
  results: WatchLocale
}
