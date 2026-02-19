//
//  ProfileStatsCache.swift
//  Plotwist
//

import Foundation

class ProfileStatsCache {
  static let shared = ProfileStatsCache()
  private init() {}
  
  private var cache: [String: CachedStats] = [:]
  private let cacheDuration: TimeInterval = 300 // 5 minutes
  
  private struct CachedStats {
    let totalHours: Double
    let watchedGenres: [WatchedGenre]
    let itemsStatus: [ItemStatusStat]
    let bestReviews: [BestReview]
    let timestamp: Date
  }
  
  func get(userId: String) -> (totalHours: Double, watchedGenres: [WatchedGenre], itemsStatus: [ItemStatusStat], bestReviews: [BestReview])? {
    guard let cached = cache[userId],
          Date().timeIntervalSince(cached.timestamp) < cacheDuration else {
      return nil
    }
    return (cached.totalHours, cached.watchedGenres, cached.itemsStatus, cached.bestReviews)
  }
  
  func set(userId: String, totalHours: Double, watchedGenres: [WatchedGenre], itemsStatus: [ItemStatusStat], bestReviews: [BestReview]) {
    cache[userId] = CachedStats(totalHours: totalHours, watchedGenres: watchedGenres, itemsStatus: itemsStatus, bestReviews: bestReviews, timestamp: Date())
  }
  
  func invalidate(userId: String) {
    cache.removeValue(forKey: userId)
  }
  
  func invalidateAll() {
    cache.removeAll()
  }
}
