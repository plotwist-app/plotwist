//
//  SearchDataCache.swift
//  Plotwist
//

import Foundation

// MARK: - Search Data Cache
final class SearchDataCache {
  static let shared = SearchDataCache()
  private init() {}

  // Cache for popular movies
  private var popularMoviesCache: [SearchResult]?
  // Cache for popular TV series
  private var popularTVSeriesCache: [SearchResult]?
  // Cache for popular animes
  private var popularAnimesCache: [SearchResult]?
  // Cache for popular doramas
  private var popularDoramasCache: [SearchResult]?
  // Cache timestamp
  private var lastUpdated: Date?
  // Cache duration (5 minutes)
  private let cacheDuration: TimeInterval = 300
  // Flag to track if initial load was done
  private var hasLoadedOnce = false
  // Store the preferences hash to invalidate when preferences change
  private var lastPreferencesHash: String?

  // MARK: - Popular Movies

  var popularMovies: [SearchResult]? {
    guard !isCacheExpired else { return nil }
    return popularMoviesCache
  }

  func setPopularMovies(_ items: [SearchResult]) {
    popularMoviesCache = items
    lastUpdated = Date()
    hasLoadedOnce = true
  }

  // MARK: - Popular TV Series

  var popularTVSeries: [SearchResult]? {
    guard !isCacheExpired else { return nil }
    return popularTVSeriesCache
  }

  func setPopularTVSeries(_ items: [SearchResult]) {
    popularTVSeriesCache = items
    lastUpdated = Date()
    hasLoadedOnce = true
  }

  // MARK: - Popular Animes

  var popularAnimes: [SearchResult]? {
    guard !isCacheExpired else { return nil }
    return popularAnimesCache
  }

  func setPopularAnimes(_ items: [SearchResult]) {
    popularAnimesCache = items
    lastUpdated = Date()
    hasLoadedOnce = true
  }

  // MARK: - Popular Doramas

  var popularDoramas: [SearchResult]? {
    guard !isCacheExpired else { return nil }
    return popularDoramasCache
  }

  func setPopularDoramas(_ items: [SearchResult]) {
    popularDoramasCache = items
    lastUpdated = Date()
    hasLoadedOnce = true
  }

  // MARK: - Preferences Hash

  func setPreferencesHash(_ hash: String) {
    if lastPreferencesHash != hash {
      // Preferences changed, invalidate cache
      clearCache()
      lastPreferencesHash = hash
    }
  }

  // MARK: - Cache State

  var shouldShowSkeleton: Bool {
    !hasLoadedOnce
  }

  var isDataAvailable: Bool {
    popularMoviesCache != nil || popularTVSeriesCache != nil ||
    popularAnimesCache != nil || popularDoramasCache != nil
  }

  // MARK: - Cache Management

  private var isCacheExpired: Bool {
    guard let lastUpdated else { return true }
    return Date().timeIntervalSince(lastUpdated) > cacheDuration
  }

  func clearCache() {
    popularMoviesCache = nil
    popularTVSeriesCache = nil
    popularAnimesCache = nil
    popularDoramasCache = nil
    lastUpdated = nil
    // Don't reset hasLoadedOnce to avoid showing skeleton again
  }

  func invalidateCache() {
    clearCache()
    NotificationCenter.default.post(name: .searchDataCacheInvalidated, object: nil)
  }

  func fullReset() {
    clearCache()
    hasLoadedOnce = false
    lastPreferencesHash = nil
  }
}

// MARK: - Notification Names
extension Notification.Name {
  static let searchDataCacheInvalidated = Notification.Name("searchDataCacheInvalidated")
}
