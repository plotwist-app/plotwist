//
//  HomeDataCache.swift
//  Plotwist
//

import Foundation

// MARK: - Home Data Cache
final class HomeDataCache {
  static let shared = HomeDataCache()
  private init() {}

  // Cache for watching items
  private var watchingItemsCache: [SearchResult]?
  // Cache for watchlist items
  private var watchlistItemsCache: [SearchResult]?
  // Cache for user data
  private var userCache: User?
  // Cache for discovery content
  private var popularMoviesCache: [SearchResult]?
  private var popularTVSeriesCache: [SearchResult]?
  // Cache for new personalized sections
  private var featuredItemCache: SearchResult?
  private var forYouItemsCache: [SearchResult]?
  private var trendingItemsCache: [SearchResult]?
  private var animeItemsCache: [SearchResult]?
  private var doramaItemsCache: [SearchResult]?
  private var nowPlayingItemsCache: [SearchResult]?
  private var airingTodayItemsCache: [SearchResult]?
  private var topRatedItemsCache: [SearchResult]?
  // Cache timestamp
  private var lastUpdated: Date?
  private var discoveryLastUpdated: Date?
  // Cache duration (5 minutes for user data, 15 minutes for discovery)
  private let cacheDuration: TimeInterval = 300
  private let discoveryCacheDuration: TimeInterval = 900
  // Flag to track if initial load was done
  private var hasLoadedOnce = false

  // MARK: - Watching Items

  var watchingItems: [SearchResult]? {
    guard !isCacheExpired else {
      return nil
    }
    return watchingItemsCache
  }

  func setWatchingItems(_ items: [SearchResult]) {
    watchingItemsCache = items
    lastUpdated = Date()
    hasLoadedOnce = true
  }

  // MARK: - Watchlist Items

  var watchlistItems: [SearchResult]? {
    guard !isCacheExpired else {
      return nil
    }
    return watchlistItemsCache
  }

  func setWatchlistItems(_ items: [SearchResult]) {
    watchlistItemsCache = items
    lastUpdated = Date()
    hasLoadedOnce = true
  }

  // MARK: - User

  var user: User? {
    guard !isCacheExpired else {
      return nil
    }
    return userCache
  }

  func setUser(_ user: User?) {
    userCache = user
    lastUpdated = Date()
  }

  // MARK: - Popular Movies

  var popularMovies: [SearchResult]? {
    guard !isDiscoveryCacheExpired else {
      return nil
    }
    return popularMoviesCache
  }

  func setPopularMovies(_ items: [SearchResult]) {
    popularMoviesCache = items
    discoveryLastUpdated = Date()
  }

  // MARK: - Popular TV Series

  var popularTVSeries: [SearchResult]? {
    guard !isDiscoveryCacheExpired else {
      return nil
    }
    return popularTVSeriesCache
  }

  func setPopularTVSeries(_ items: [SearchResult]) {
    popularTVSeriesCache = items
    discoveryLastUpdated = Date()
  }

  // MARK: - Featured Item

  var featuredItem: SearchResult? {
    guard !isDiscoveryCacheExpired else { return nil }
    return featuredItemCache
  }

  func setFeaturedItem(_ item: SearchResult?) {
    featuredItemCache = item
    discoveryLastUpdated = Date()
  }

  // MARK: - For You Items

  var forYouItems: [SearchResult]? {
    guard !isDiscoveryCacheExpired else { return nil }
    return forYouItemsCache
  }

  func setForYouItems(_ items: [SearchResult]) {
    forYouItemsCache = items
    discoveryLastUpdated = Date()
  }

  // MARK: - Trending Items

  var trendingItems: [SearchResult]? {
    guard !isDiscoveryCacheExpired else { return nil }
    return trendingItemsCache
  }

  func setTrendingItems(_ items: [SearchResult]) {
    trendingItemsCache = items
    discoveryLastUpdated = Date()
  }

  // MARK: - Anime Items

  var animeItems: [SearchResult]? {
    guard !isDiscoveryCacheExpired else { return nil }
    return animeItemsCache
  }

  func setAnimeItems(_ items: [SearchResult]) {
    animeItemsCache = items
    discoveryLastUpdated = Date()
  }

  // MARK: - Dorama Items

  var doramaItems: [SearchResult]? {
    guard !isDiscoveryCacheExpired else { return nil }
    return doramaItemsCache
  }

  func setDoramaItems(_ items: [SearchResult]) {
    doramaItemsCache = items
    discoveryLastUpdated = Date()
  }

  // MARK: - Now Playing Items

  var nowPlayingItems: [SearchResult]? {
    guard !isDiscoveryCacheExpired else { return nil }
    return nowPlayingItemsCache
  }

  func setNowPlayingItems(_ items: [SearchResult]) {
    nowPlayingItemsCache = items
    discoveryLastUpdated = Date()
  }

  // MARK: - Airing Today Items

  var airingTodayItems: [SearchResult]? {
    guard !isDiscoveryCacheExpired else { return nil }
    return airingTodayItemsCache
  }

  func setAiringTodayItems(_ items: [SearchResult]) {
    airingTodayItemsCache = items
    discoveryLastUpdated = Date()
  }

  // MARK: - Top Rated Items

  var topRatedItems: [SearchResult]? {
    guard !isDiscoveryCacheExpired else { return nil }
    return topRatedItemsCache
  }

  func setTopRatedItems(_ items: [SearchResult]) {
    topRatedItemsCache = items
    discoveryLastUpdated = Date()
  }

  // MARK: - Cache State

  var shouldShowSkeleton: Bool {
    !hasLoadedOnce
  }

  var isDataAvailable: Bool {
    watchingItemsCache != nil || watchlistItemsCache != nil
  }

  // MARK: - Cache Management

  private var isCacheExpired: Bool {
    guard let lastUpdated else { return true }
    return Date().timeIntervalSince(lastUpdated) > cacheDuration
  }

  private var isDiscoveryCacheExpired: Bool {
    guard let discoveryLastUpdated else { return true }
    return Date().timeIntervalSince(discoveryLastUpdated) > discoveryCacheDuration
  }

  func clearCache() {
    watchingItemsCache = nil
    watchlistItemsCache = nil
    userCache = nil
    lastUpdated = nil
    // Don't clear discovery cache as it changes less frequently
    // Don't reset hasLoadedOnce to avoid showing skeleton again
  }

  func clearDiscoveryCache() {
    popularMoviesCache = nil
    popularTVSeriesCache = nil
    featuredItemCache = nil
    forYouItemsCache = nil
    trendingItemsCache = nil
    animeItemsCache = nil
    doramaItemsCache = nil
    nowPlayingItemsCache = nil
    airingTodayItemsCache = nil
    topRatedItemsCache = nil
    discoveryLastUpdated = nil
  }

  func invalidateCache() {
    clearCache()
    NotificationCenter.default.post(name: .homeDataCacheInvalidated, object: nil)
  }

  func fullReset() {
    clearCache()
    clearDiscoveryCache()
    hasLoadedOnce = false
  }
}

// MARK: - Notification Names
extension Notification.Name {
  static let homeDataCacheInvalidated = Notification.Name("homeDataCacheInvalidated")
}
