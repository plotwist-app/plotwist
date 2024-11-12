/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Plotwist
 * OpenAPI spec version: 0.1.0
 */
export type GetUserItems200ItemStatus =
  (typeof GetUserItems200ItemStatus)[keyof typeof GetUserItems200ItemStatus]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetUserItems200ItemStatus = {
  WATCHLIST: 'WATCHLIST',
  WATCHED: 'WATCHED',
  WATCHING: 'WATCHING',
} as const

export type GetUserItems200ItemMediaType =
  (typeof GetUserItems200ItemMediaType)[keyof typeof GetUserItems200ItemMediaType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetUserItems200ItemMediaType = {
  TV_SHOW: 'TV_SHOW',
  MOVIE: 'MOVIE',
} as const

export type GetUserItems200Item = {
  addedAt: string
  /** @nullable */
  backdropPath: string | null
  id: string
  mediaType: GetUserItems200ItemMediaType
  /** @nullable */
  position: number | null
  /** @nullable */
  posterPath: string | null
  status: GetUserItems200ItemStatus
  title: string
  tmdbId: number
  userId: string
}

export type GetUserItemsLanguage =
  (typeof GetUserItemsLanguage)[keyof typeof GetUserItemsLanguage]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetUserItemsLanguage = {
  'en-US': 'en-US',
  'es-ES': 'es-ES',
  'fr-FR': 'fr-FR',
  'de-DE': 'de-DE',
  'it-IT': 'it-IT',
  'pt-BR': 'pt-BR',
  'ja-JP': 'ja-JP',
} as const

export type GetUserItemsStatus =
  (typeof GetUserItemsStatus)[keyof typeof GetUserItemsStatus]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetUserItemsStatus = {
  WATCHLIST: 'WATCHLIST',
  WATCHED: 'WATCHED',
  WATCHING: 'WATCHING',
} as const

export type GetUserItemsParams = {
  status: GetUserItemsStatus
  language: GetUserItemsLanguage
}

export type PostUserItem201ListItemMediaType =
  (typeof PostUserItem201ListItemMediaType)[keyof typeof PostUserItem201ListItemMediaType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PostUserItem201ListItemMediaType = {
  TV_SHOW: 'TV_SHOW',
  MOVIE: 'MOVIE',
} as const

export type PostUserItem201ListItem = {
  createdAt: string
  id: string
  listId: string
  mediaType: PostUserItem201ListItemMediaType
  /** @nullable */
  position: number | null
  tmdbId: number
}

export type PostUserItem201 = {
  listItem: PostUserItem201ListItem
}

export type PostUserItemBodyStatus =
  (typeof PostUserItemBodyStatus)[keyof typeof PostUserItemBodyStatus]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PostUserItemBodyStatus = {
  WATCHLIST: 'WATCHLIST',
  WATCHED: 'WATCHED',
  WATCHING: 'WATCHING',
} as const

export type PostUserItemBodyMediaType =
  (typeof PostUserItemBodyMediaType)[keyof typeof PostUserItemBodyMediaType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PostUserItemBodyMediaType = {
  TV_SHOW: 'TV_SHOW',
  MOVIE: 'MOVIE',
} as const

export type PostUserItemBody = {
  mediaType: PostUserItemBodyMediaType
  status: PostUserItemBodyStatus
  tmdbId: number
}

export type GetListItemsByListId200ItemMediaType =
  (typeof GetListItemsByListId200ItemMediaType)[keyof typeof GetListItemsByListId200ItemMediaType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetListItemsByListId200ItemMediaType = {
  TV_SHOW: 'TV_SHOW',
  MOVIE: 'MOVIE',
} as const

export type GetListItemsByListId200Item = {
  /** @nullable */
  backdropPath: string | null
  createdAt: string
  id: string
  listId: string
  mediaType: GetListItemsByListId200ItemMediaType
  /** @nullable */
  position: number | null
  /** @nullable */
  posterPath: string | null
  title: string
  tmdbId: number
}

export type GetListItemsByListIdLanguage =
  (typeof GetListItemsByListIdLanguage)[keyof typeof GetListItemsByListIdLanguage]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetListItemsByListIdLanguage = {
  'en-US': 'en-US',
  'es-ES': 'es-ES',
  'fr-FR': 'fr-FR',
  'de-DE': 'de-DE',
  'it-IT': 'it-IT',
  'pt-BR': 'pt-BR',
  'ja-JP': 'ja-JP',
} as const

export type GetListItemsByListIdParams = {
  language: GetListItemsByListIdLanguage
}

export type PostListItem201ListItemMediaType =
  (typeof PostListItem201ListItemMediaType)[keyof typeof PostListItem201ListItemMediaType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PostListItem201ListItemMediaType = {
  TV_SHOW: 'TV_SHOW',
  MOVIE: 'MOVIE',
} as const

export type PostListItem201ListItem = {
  createdAt: string
  id: string
  listId: string
  mediaType: PostListItem201ListItemMediaType
  /** @nullable */
  position: number | null
  tmdbId: number
}

export type PostListItem201 = {
  listItem: PostListItem201ListItem
}

export type PostListItemBodyMediaType =
  (typeof PostListItemBodyMediaType)[keyof typeof PostListItemBodyMediaType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PostListItemBodyMediaType = {
  TV_SHOW: 'TV_SHOW',
  MOVIE: 'MOVIE',
} as const

export type PostListItemBody = {
  listId: string
  mediaType: PostListItemBodyMediaType
  tmdbId: number
}

/**
 * User not found
 */
export type PostReviewsCreate404 = {
  message: string
}

/**
 * Review created.
 */
export type PostReviewsCreate201 = {
  review: PostReviewsCreate201Review
}

/**
 * @nullable
 */
export type PostReviewsCreate201ReviewMediaType =
  | (typeof PostReviewsCreate201ReviewMediaType)[keyof typeof PostReviewsCreate201ReviewMediaType]
  | null

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PostReviewsCreate201ReviewMediaType = {
  TV_SHOW: 'TV_SHOW',
  MOVIE: 'MOVIE',
} as const

/**
 * @nullable
 */
export type PostReviewsCreate201ReviewLanguage =
  | (typeof PostReviewsCreate201ReviewLanguage)[keyof typeof PostReviewsCreate201ReviewLanguage]
  | null

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PostReviewsCreate201ReviewLanguage = {
  'en-US': 'en-US',
  'es-ES': 'es-ES',
  'fr-FR': 'fr-FR',
  'it-IT': 'it-IT',
  'de-DE': 'de-DE',
  'pt-BR': 'pt-BR',
  'ja-JP': 'ja-JP',
} as const

export type PostReviewsCreate201Review = {
  createdAt?: string
  /** @nullable */
  hasSpoilers?: boolean | null
  id?: string
  /** @nullable */
  language?: PostReviewsCreate201ReviewLanguage
  /** @nullable */
  mediaType?: PostReviewsCreate201ReviewMediaType
  rating: number
  review: string
  /** @nullable */
  tmdbId?: number | null
  /** @nullable */
  tmdbOverview?: string | null
  /** @nullable */
  tmdbPosterPath?: string | null
  /** @nullable */
  tmdbTitle?: string | null
  userId: string
}

export type PostReviewsCreateBodyMediaType =
  (typeof PostReviewsCreateBodyMediaType)[keyof typeof PostReviewsCreateBodyMediaType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PostReviewsCreateBodyMediaType = {
  TV_SHOW: 'TV_SHOW',
  MOVIE: 'MOVIE',
} as const

export type PostReviewsCreateBodyLanguage =
  (typeof PostReviewsCreateBodyLanguage)[keyof typeof PostReviewsCreateBodyLanguage]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PostReviewsCreateBodyLanguage = {
  'en-US': 'en-US',
  'es-ES': 'es-ES',
  'fr-FR': 'fr-FR',
  'it-IT': 'it-IT',
  'de-DE': 'de-DE',
  'pt-BR': 'pt-BR',
  'ja-JP': 'ja-JP',
} as const

export type PostReviewsCreateBody = {
  hasSpoilers?: boolean
  language: PostReviewsCreateBodyLanguage
  mediaType: PostReviewsCreateBodyMediaType
  rating: number
  review: string
  tmdbId?: number
  tmdbOverview?: string
  tmdbPosterPath?: string
  tmdbTitle?: string
  userId: string
}

/**
 * Invalid email or password.
 */
export type PostLogin400 = {
  message: string
}

export type PostLogin200 = {
  token: string
}

export type PostLoginBody = {
  email: string
  /** @minLength 8 */
  password?: string
}

/**
 * List not found.
 */
export type PatchListBanner404 = {
  message: string
}

export type PatchListBanner200ListVisibility =
  (typeof PatchListBanner200ListVisibility)[keyof typeof PatchListBanner200ListVisibility]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PatchListBanner200ListVisibility = {
  PUBLIC: 'PUBLIC',
  NETWORK: 'NETWORK',
  PRIVATE: 'PRIVATE',
} as const

export type PatchListBanner200List = {
  /** @nullable */
  bannerPath: string | null
  createdAt: string
  /** @nullable */
  description: string | null
  id: string
  title: string
  userId: string
  visibility: PatchListBanner200ListVisibility
}

export type PatchListBanner200 = {
  list: PatchListBanner200List
}

export type PatchListBannerBody = {
  bannerPath: string
  listId: string
}

/**
 * List not found.
 */
export type GetListById404 = {
  message: string
}

export type GetListById200ListVisibility =
  (typeof GetListById200ListVisibility)[keyof typeof GetListById200ListVisibility]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetListById200ListVisibility = {
  PUBLIC: 'PUBLIC',
  NETWORK: 'NETWORK',
  PRIVATE: 'PRIVATE',
} as const

export type GetListById200List = {
  /** @nullable */
  bannerPath: string | null
  createdAt: string
  /** @nullable */
  description: string | null
  id: string
  title: string
  userId: string
  visibility: GetListById200ListVisibility
}

export type GetListById200 = {
  list: GetListById200List
}

/**
 * List not found.
 */
export type PutListId404 = {
  message: string
}

export type PutListId200ListVisibility =
  (typeof PutListId200ListVisibility)[keyof typeof PutListId200ListVisibility]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PutListId200ListVisibility = {
  PUBLIC: 'PUBLIC',
  NETWORK: 'NETWORK',
  PRIVATE: 'PRIVATE',
} as const

export type PutListId200List = {
  /** @nullable */
  bannerPath: string | null
  createdAt: string
  /** @nullable */
  description: string | null
  id: string
  title: string
  userId: string
  visibility: PutListId200ListVisibility
}

export type PutListId200 = {
  list: PutListId200List
}

export type PutListIdBodyVisibility =
  (typeof PutListIdBodyVisibility)[keyof typeof PutListIdBodyVisibility]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PutListIdBodyVisibility = {
  PUBLIC: 'PUBLIC',
  NETWORK: 'NETWORK',
  PRIVATE: 'PRIVATE',
} as const

export type PutListIdBody = {
  /** @nullable */
  description?: string | null
  title: string
  visibility: PutListIdBodyVisibility
}

/**
 * List not found.
 */
export type DeleteListId404 = {
  message: string
}

/**
 * @nullable
 */
export type DeleteListId204 =
  | (typeof DeleteListId204)[keyof typeof DeleteListId204]
  | null

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DeleteListId204 = {
  null: 'null',
} as const

export type GetLists404 = {
  message: string
}

export type GetLists200ListsItemVisibility =
  (typeof GetLists200ListsItemVisibility)[keyof typeof GetLists200ListsItemVisibility]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetLists200ListsItemVisibility = {
  PUBLIC: 'PUBLIC',
  NETWORK: 'NETWORK',
  PRIVATE: 'PRIVATE',
} as const

export type GetLists200ListsItemUser = {
  id: string
  /** @nullable */
  imagePath: string | null
  username: string
}

export type GetLists200ListsItem = {
  /** @nullable */
  bannerPath: string | null
  createdAt: string
  /** @nullable */
  description: string | null
  hasLiked: boolean
  id: string
  items: GetLists200ListsItemItemsItem[]
  likeCount: number
  title: string
  user: GetLists200ListsItemUser
  userId: string
  visibility: GetLists200ListsItemVisibility
}

export type GetLists200 = {
  lists: GetLists200ListsItem[]
}

export type GetLists200ListsItemItemsItemMediaType =
  (typeof GetLists200ListsItemItemsItemMediaType)[keyof typeof GetLists200ListsItemItemsItemMediaType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetLists200ListsItemItemsItemMediaType = {
  TV_SHOW: 'TV_SHOW',
  MOVIE: 'MOVIE',
} as const

export type GetLists200ListsItemItemsItem = {
  id: string
  mediaType: GetLists200ListsItemItemsItemMediaType
  tmdbId: number
}

export type GetListsParams = {
  userId?: string
  limit?: number
}

/**
 * User not found
 */
export type PostList404 = {
  message: string
}

export type PostList201ListVisibility =
  (typeof PostList201ListVisibility)[keyof typeof PostList201ListVisibility]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PostList201ListVisibility = {
  PUBLIC: 'PUBLIC',
  NETWORK: 'NETWORK',
  PRIVATE: 'PRIVATE',
} as const

export type PostList201List = {
  /** @nullable */
  bannerPath: string | null
  createdAt: string
  /** @nullable */
  description: string | null
  id: string
  title: string
  userId: string
  visibility: PostList201ListVisibility
}

/**
 * List created.
 */
export type PostList201 = {
  list: PostList201List
}

export type PostListBodyVisibility =
  (typeof PostListBodyVisibility)[keyof typeof PostListBodyVisibility]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PostListBodyVisibility = {
  PUBLIC: 'PUBLIC',
  NETWORK: 'NETWORK',
  PRIVATE: 'PRIVATE',
} as const

export type PostListBody = {
  /** @nullable */
  description?: string | null
  title: string
  visibility: PostListBodyVisibility
}

export type PatchUserBanner200UserSubscriptionType =
  (typeof PatchUserBanner200UserSubscriptionType)[keyof typeof PatchUserBanner200UserSubscriptionType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PatchUserBanner200UserSubscriptionType = {
  MEMBER: 'MEMBER',
  PRO: 'PRO',
} as const

export type PatchUserBanner200User = {
  /** @nullable */
  bannerPath: string | null
  /** @nullable */
  createdAt: string | null
  email: string
  id: string
  /** @nullable */
  imagePath: string | null
  /** @nullable */
  isLegacy: boolean | null
  subscriptionType: PatchUserBanner200UserSubscriptionType
  username: string
}

export type PatchUserBanner200 = {
  user: PatchUserBanner200User
}

export type PatchUserBannerBody = {
  bannerPath: string
}

export type PatchUserImage200UserSubscriptionType =
  (typeof PatchUserImage200UserSubscriptionType)[keyof typeof PatchUserImage200UserSubscriptionType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PatchUserImage200UserSubscriptionType = {
  MEMBER: 'MEMBER',
  PRO: 'PRO',
} as const

export type PatchUserImage200User = {
  /** @nullable */
  bannerPath: string | null
  /** @nullable */
  createdAt: string | null
  email: string
  id: string
  /** @nullable */
  imagePath: string | null
  /** @nullable */
  isLegacy: boolean | null
  subscriptionType: PatchUserImage200UserSubscriptionType
  username: string
}

export type PatchUserImage200 = {
  user: PatchUserImage200User
}

export type PatchUserImageBody = {
  imagePath: string
}

export type GetMe200UserSubscriptionType =
  (typeof GetMe200UserSubscriptionType)[keyof typeof GetMe200UserSubscriptionType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetMe200UserSubscriptionType = {
  MEMBER: 'MEMBER',
  PRO: 'PRO',
} as const

export type GetMe200User = {
  /** @nullable */
  bannerPath: string | null
  /** @nullable */
  createdAt: string | null
  email: string
  id: string
  /** @nullable */
  imagePath: string | null
  /** @nullable */
  isLegacy: boolean | null
  subscriptionType: GetMe200UserSubscriptionType
  username: string
}

export type GetMe200 = {
  user: GetMe200User
}

/**
 * Fail to hash password.
 */
export type GetUserById500 = {
  message: string
}

/**
 * Email or username is already registered.
 */
export type GetUserById409 = {
  message: string
}

export type GetUserById201UserSubscriptionType =
  (typeof GetUserById201UserSubscriptionType)[keyof typeof GetUserById201UserSubscriptionType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetUserById201UserSubscriptionType = {
  MEMBER: 'MEMBER',
  PRO: 'PRO',
} as const

export type GetUserById201User = {
  /** @nullable */
  bannerPath?: string | null
  /** @nullable */
  createdAt?: string | null
  email: string
  id?: string
  /** @nullable */
  imagePath?: string | null
  /** @nullable */
  isLegacy?: boolean | null
  subscriptionType?: GetUserById201UserSubscriptionType
  username: string
}

/**
 * User created.
 */
export type GetUserById201 = {
  user: GetUserById201User
}

export type GetUsersUsername200UserSubscriptionType =
  (typeof GetUsersUsername200UserSubscriptionType)[keyof typeof GetUsersUsername200UserSubscriptionType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetUsersUsername200UserSubscriptionType = {
  MEMBER: 'MEMBER',
  PRO: 'PRO',
} as const

export type GetUsersUsername200User = {
  /** @nullable */
  bannerPath: string | null
  /** @nullable */
  createdAt: string | null
  email: string
  id: string
  /** @nullable */
  imagePath: string | null
  /** @nullable */
  isLegacy: boolean | null
  subscriptionType: GetUsersUsername200UserSubscriptionType
  username: string
}

export type GetUsersUsername200 = {
  user: GetUsersUsername200User
}

/**
 * Email is already registered.
 */
export type GetUsersAvailableEmail409 = {
  message: string
}

export type GetUsersAvailableEmail200 = {
  available: boolean
}

export type GetUsersAvailableEmailParams = {
  email: string
}

/**
 * Username is already registered.
 */
export type GetUsersAvailableUsername409 = {
  message: string
}

export type GetUsersAvailableUsername200 = {
  available: boolean
}

export type GetUsersAvailableUsernameParams = {
  username: string
}

/**
 * Fail to hash password.
 */
export type PostUsersCreate500 = {
  message: string
}

/**
 * Email or username is already registered.
 */
export type PostUsersCreate409 = {
  message: string
}

export type PostUsersCreate201UserSubscriptionType =
  (typeof PostUsersCreate201UserSubscriptionType)[keyof typeof PostUsersCreate201UserSubscriptionType]

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PostUsersCreate201UserSubscriptionType = {
  MEMBER: 'MEMBER',
  PRO: 'PRO',
} as const

export type PostUsersCreate201User = {
  /** @nullable */
  bannerPath?: string | null
  /** @nullable */
  createdAt?: string | null
  email: string
  id?: string
  /** @nullable */
  imagePath?: string | null
  /** @nullable */
  isLegacy?: boolean | null
  subscriptionType?: PostUsersCreate201UserSubscriptionType
  username: string
}

/**
 * User created.
 */
export type PostUsersCreate201 = {
  user: PostUsersCreate201User
}

export type PostUsersCreateBody = {
  email: string
  /** @minLength 8 */
  password: string
  /** @minLength 3 */
  username: string
}
