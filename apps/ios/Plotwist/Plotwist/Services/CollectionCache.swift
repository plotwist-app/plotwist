//
//  CollectionCache.swift
//  Plotwist
//

import Foundation

// MARK: - Collection Cache
class CollectionCache {
  static let shared = CollectionCache()
  private init() {}

  // Cache for user items by status
  private var itemsCache: [String: [UserItemSummary]] = [:]
  // Cache for total count
  private var totalCountCache: Int?
  // Cache timestamp
  private var lastUpdated: Date?
  // Cache duration (5 minutes)
  private let cacheDuration: TimeInterval = 300

  private func cacheKey(userId: String, status: String) -> String {
    return "\(userId)_\(status)"
  }

  // MARK: - Items Cache

  func getItems(userId: String, status: String) -> [UserItemSummary]? {
    guard !isCacheExpired else {
      clearCache()
      return nil
    }
    return itemsCache[cacheKey(userId: userId, status: status)]
  }

  func setItems(_ items: [UserItemSummary], userId: String, status: String) {
    itemsCache[cacheKey(userId: userId, status: status)] = items
    lastUpdated = Date()
  }

  // MARK: - Total Count Cache

  func getTotalCount() -> Int? {
    guard !isCacheExpired else {
      clearCache()
      return nil
    }
    return totalCountCache
  }

  func setTotalCount(_ count: Int) {
    totalCountCache = count
    lastUpdated = Date()
  }

  // MARK: - Cache Management

  private var isCacheExpired: Bool {
    guard let lastUpdated else { return true }
    return Date().timeIntervalSince(lastUpdated) > cacheDuration
  }

  func clearCache() {
    itemsCache.removeAll()
    totalCountCache = nil
    lastUpdated = nil
  }

  func invalidateCache() {
    clearCache()
    NotificationCenter.default.post(name: .collectionCacheInvalidated, object: nil)
  }
}

// MARK: - Notification Names
extension Notification.Name {
  static let collectionCacheInvalidated = Notification.Name("collectionCacheInvalidated")
}
