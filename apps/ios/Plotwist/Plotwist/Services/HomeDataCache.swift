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
  // Cache timestamp
  private var lastUpdated: Date?
  // Cache duration (5 minutes)
  private let cacheDuration: TimeInterval = 300
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

  func clearCache() {
    watchingItemsCache = nil
    watchlistItemsCache = nil
    userCache = nil
    lastUpdated = nil
    // Don't reset hasLoadedOnce to avoid showing skeleton again
  }

  func invalidateCache() {
    clearCache()
    NotificationCenter.default.post(name: .homeDataCacheInvalidated, object: nil)
  }

  func fullReset() {
    clearCache()
    hasLoadedOnce = false
  }
}

// MARK: - Notification Names
extension Notification.Name {
  static let homeDataCacheInvalidated = Notification.Name("homeDataCacheInvalidated")
}
