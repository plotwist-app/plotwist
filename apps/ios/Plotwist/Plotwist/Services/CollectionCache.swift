//
//  CollectionCache.swift
//  Plotwist
//

import Foundation

// MARK: - Collection Cache
final class CollectionCache {
  static let shared = CollectionCache()
  private init() {}

  // Cache for user items by status
  private var itemsCache: [String: [UserItemSummary]] = [:]
  // Cache for total count
  private var totalCountCache: Int?
  // Cache for reviews count
  private var reviewsCountCache: Int?
  // Cache for user profile
  private var userCache: User?
  // Cache timestamp
  private var lastUpdated: Date?
  // Cache duration (5 minutes)
  private let cacheDuration: TimeInterval = 300
  // Flag to track if initial load was done
  private var hasLoadedOnce = false

  private func cacheKey(userId: String, status: String) -> String {
    return "\(userId)_\(status)"
  }

  // MARK: - User Cache

  var user: User? {
    guard !isCacheExpired else { return nil }
    return userCache
  }

  func setUser(_ user: User?) {
    userCache = user
    lastUpdated = Date()
    hasLoadedOnce = true
  }

  // MARK: - Items Cache

  func getItems(userId: String, status: String) -> [UserItemSummary]? {
    guard !isCacheExpired else {
      return nil
    }
    return itemsCache[cacheKey(userId: userId, status: status)]
  }

  func setItems(_ items: [UserItemSummary], userId: String, status: String) {
    itemsCache[cacheKey(userId: userId, status: status)] = items
    lastUpdated = Date()
    hasLoadedOnce = true
  }

  // MARK: - Total Count Cache

  func getTotalCount() -> Int? {
    guard !isCacheExpired else {
      return nil
    }
    return totalCountCache
  }

  func setTotalCount(_ count: Int) {
    totalCountCache = count
    lastUpdated = Date()
  }

  // MARK: - Reviews Count Cache

  func getReviewsCount() -> Int? {
    guard !isCacheExpired else {
      return nil
    }
    return reviewsCountCache
  }

  func setReviewsCount(_ count: Int) {
    reviewsCountCache = count
    lastUpdated = Date()
  }

  // MARK: - Cache State

  var shouldShowSkeleton: Bool {
    !hasLoadedOnce
  }

  var isDataAvailable: Bool {
    userCache != nil || !itemsCache.isEmpty
  }

  // MARK: - Cache Management

  private var isCacheExpired: Bool {
    guard let lastUpdated else { return true }
    return Date().timeIntervalSince(lastUpdated) > cacheDuration
  }

  func clearCache() {
    itemsCache.removeAll()
    totalCountCache = nil
    reviewsCountCache = nil
    userCache = nil
    lastUpdated = nil
    // Don't reset hasLoadedOnce to avoid showing skeleton again
  }

  func invalidateCache() {
    clearCache()
    NotificationCenter.default.post(name: .collectionCacheInvalidated, object: nil)
  }

  func fullReset() {
    clearCache()
    hasLoadedOnce = false
  }
}

// MARK: - Notification Names
extension Notification.Name {
  static let collectionCacheInvalidated = Notification.Name("collectionCacheInvalidated")
}
