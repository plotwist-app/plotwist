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
    let itemsStatus: [ItemStatusStat]
    let bestReviews: [BestReview]
    let watchedCast: [WatchedCastMember]
    let watchedCountries: [WatchedCountry]
    let mostWatchedSeries: [MostWatchedSeries]
    let timestamp: Date
  }
  
  func get(userId: String) -> (totalHours: Double, movieHours: Double, seriesHours: Double, monthlyHours: [MonthlyHoursEntry], watchedGenres: [WatchedGenre], itemsStatus: [ItemStatusStat], bestReviews: [BestReview], watchedCast: [WatchedCastMember], watchedCountries: [WatchedCountry], mostWatchedSeries: [MostWatchedSeries])? {
    guard let cached = cache[userId],
          Date().timeIntervalSince(cached.timestamp) < cacheDuration else {
      return nil
    }
    return (cached.totalHours, cached.movieHours, cached.seriesHours, cached.monthlyHours, cached.watchedGenres, cached.itemsStatus, cached.bestReviews, cached.watchedCast, cached.watchedCountries, cached.mostWatchedSeries)
  }
  
  func set(userId: String, totalHours: Double, movieHours: Double = 0, seriesHours: Double = 0, monthlyHours: [MonthlyHoursEntry] = [], watchedGenres: [WatchedGenre], itemsStatus: [ItemStatusStat], bestReviews: [BestReview], watchedCast: [WatchedCastMember] = [], watchedCountries: [WatchedCountry] = [], mostWatchedSeries: [MostWatchedSeries] = []) {
    cache[userId] = CachedStats(totalHours: totalHours, movieHours: movieHours, seriesHours: seriesHours, monthlyHours: monthlyHours, watchedGenres: watchedGenres, itemsStatus: itemsStatus, bestReviews: bestReviews, watchedCast: watchedCast, watchedCountries: watchedCountries, mostWatchedSeries: mostWatchedSeries, timestamp: Date())
  }
  
  func invalidate(userId: String) {
    cache.removeValue(forKey: userId)
  }
  
  func invalidateAll() {
    cache.removeAll()
  }
}
