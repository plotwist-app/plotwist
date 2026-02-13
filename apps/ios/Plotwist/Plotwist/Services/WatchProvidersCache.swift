//
//  WatchProvidersCache.swift
//  Plotwist
//

import Foundation

// MARK: - Watch Providers Cache
final class WatchProvidersCache {
  static let shared = WatchProvidersCache()
  private init() {}

  // Dictionary cache: key = "{mediaType}_{id}", value = cached entry
  private var cache: [String: CacheEntry] = [:]

  // Cache duration (15 minutes — providers change infrequently)
  private let cacheDuration: TimeInterval = 900

  // MARK: - Cache Entry

  private struct CacheEntry {
    let providers: WatchProviderCountry?
    let createdAt: Date
  }

  // MARK: - Public API

  func providers(for mediaId: Int, mediaType: String) -> WatchProviderCountry?? {
    let key = cacheKey(mediaId: mediaId, mediaType: mediaType)
    guard let entry = cache[key], !isExpired(entry) else {
      return nil // cache miss
    }
    return entry.providers // cache hit (value may be nil if no providers exist)
  }

  func setProviders(_ providers: WatchProviderCountry?, for mediaId: Int, mediaType: String) {
    let key = cacheKey(mediaId: mediaId, mediaType: mediaType)
    cache[key] = CacheEntry(providers: providers, createdAt: Date())
  }

  // MARK: - Cache Management

  func clearCache() {
    cache.removeAll()
  }

  func removeEntry(for mediaId: Int, mediaType: String) {
    let key = cacheKey(mediaId: mediaId, mediaType: mediaType)
    cache.removeValue(forKey: key)
  }

  // MARK: - Private Helpers

  private func cacheKey(mediaId: Int, mediaType: String) -> String {
    "\(mediaType)_\(mediaId)"
  }

  private func isExpired(_ entry: CacheEntry) -> Bool {
    Date().timeIntervalSince(entry.createdAt) > cacheDuration
  }
}
