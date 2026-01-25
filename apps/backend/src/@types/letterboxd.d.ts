type ProfileRecord = {
  'Date Joined': string
  Username: string
  'Given Name': string
  'Family Name': string
  'Email Address': string
  Location: string
  Website: string
  Bio: string
  Pronoun: string
  'Favorite Films': string
}

export type WatchedRecord = {
  Date: string
  Name: string
  Year: string
  'Letterboxd URI': string
}

type WatchlistRecord = {
  Date: string
  Name: string
  Year: string
  'Letterboxd URI': string
}

type RatingsRecord = WatchedRecord & {
  Rating: string
}

type ReviewsRecord = RatingsRecord & {
  Rewatch: string
  Review: string
  Tags: string
  'Watched Date': string
}

export type LetterboxdImport = {
  'profile.csv': ProfileRecord[]
  'watched.csv': WatchlistRecord[]
  'watchlist.csv': WatchedRecord[]
  'ratings.csv': RatingsRecord[]
  'reviews.csv': ReviewsRecord[]
}
