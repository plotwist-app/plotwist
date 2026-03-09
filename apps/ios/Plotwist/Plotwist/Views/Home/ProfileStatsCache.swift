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
    let movieHours: Double
    let seriesHours: Double
    let monthlyHours: [MonthlyHoursEntry]
    let watchedGenres: [WatchedGenre]
    let bestReviews: [BestReview]
    let timestamp: Date
  }

  private func cacheKey(userId: String, period: String) -> String {
    "\(userId)_\(period)"
  }
  
  func get(userId: String, period: String = "all") -> (totalHours: Double, movieHours: Double, seriesHours: Double, monthlyHours: [MonthlyHoursEntry], watchedGenres: [WatchedGenre], bestReviews: [BestReview])? {
    let key = cacheKey(userId: userId, period: period)
    guard let cached = cache[key],
          Date().timeIntervalSince(cached.timestamp) < cacheDuration else {
      return nil
    }
    return (cached.totalHours, cached.movieHours, cached.seriesHours, cached.monthlyHours, cached.watchedGenres, cached.bestReviews)
  }
  
  func set(userId: String, period: String = "all", totalHours: Double, movieHours: Double = 0, seriesHours: Double = 0, monthlyHours: [MonthlyHoursEntry] = [], watchedGenres: [WatchedGenre], bestReviews: [BestReview]) {
    let key = cacheKey(userId: userId, period: period)
    cache[key] = CachedStats(totalHours: totalHours, movieHours: movieHours, seriesHours: seriesHours, monthlyHours: monthlyHours, watchedGenres: watchedGenres, bestReviews: bestReviews, timestamp: Date())
  }
  
  func invalidate(userId: String, period: String? = nil) {
    if let period {
      cache.removeValue(forKey: cacheKey(userId: userId, period: period))
    } else {
      let keysToRemove = cache.keys.filter { $0.hasPrefix("\(userId)_") }
      for key in keysToRemove {
        cache.removeValue(forKey: key)
      }
    }
  }
  
  func invalidateAll() {
    cache.removeAll()
  }
}
