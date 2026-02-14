//
//  UserItemService.swift
//  Plotwist
//

import Foundation

class UserItemService {
  static let shared = UserItemService()
  private init() {}

  // MARK: - Cache
  private var userItemCache: [String: CachedUserItem] = [:]
  private let cacheDuration: TimeInterval = 300  // 5 minutes

  private struct CachedUserItem {
    let userItem: UserItem?
    let timestamp: Date
  }

  private func cacheKey(tmdbId: Int, mediaType: String) -> String {
    return "\(tmdbId)-\(mediaType)"
  }

  func invalidateCache(tmdbId: Int, mediaType: String) {
    let key = cacheKey(tmdbId: tmdbId, mediaType: mediaType)
    userItemCache.removeValue(forKey: key)
  }

  func invalidateAllCache() {
    userItemCache.removeAll()
  }

  // MARK: - Get All User Items by Status
  func getAllUserItems(userId: String, status: String) async throws -> [UserItemSummary] {
    guard let url = URL(string: "\(API.baseURL)/user/items/all?userId=\(userId)&status=\(status)")
    else {
      throw UserItemError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw UserItemError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(AllUserItemsResponse.self, from: data)
    return result.userItems
  }

  // MARK: - Get User Items Count
  func getUserItemsCount(userId: String) async throws -> Int {
    guard let url = URL(string: "\(API.baseURL)/user/items/count?userId=\(userId)")
    else {
      throw UserItemError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw UserItemError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(UserItemsCountResponse.self, from: data)
    return result.count
  }

  // MARK: - Get User Item
  func getUserItem(tmdbId: Int, mediaType: String) async throws -> UserItem? {
    let key = cacheKey(tmdbId: tmdbId, mediaType: mediaType)

    // Check cache
    if let cached = userItemCache[key],
       Date().timeIntervalSince(cached.timestamp) < cacheDuration {
      return cached.userItem
    }

    guard let token = UserDefaults.standard.string(forKey: "token"),
      let url = URL(string: "\(API.baseURL)/user/item?tmdbId=\(tmdbId)&mediaType=\(mediaType)")
    else {
      throw UserItemError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw UserItemError.invalidResponse
    }

    if http.statusCode == 404 {
      // Cache nil result
      userItemCache[key] = CachedUserItem(userItem: nil, timestamp: Date())
      return nil
    }

    guard http.statusCode == 200 else {
      AnalyticsService.trackAPIError(endpoint: "/user/item", statusCode: http.statusCode)
      throw UserItemError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(UserItemResponse.self, from: data)

    // Cache result
    userItemCache[key] = CachedUserItem(userItem: result.userItem, timestamp: Date())

    return result.userItem
  }

  // MARK: - Upsert User Item (Create or Update)
  func upsertUserItem(tmdbId: Int, mediaType: String, status: UserItemStatus) async throws
    -> UserItem
  {
    guard let url = URL(string: "\(API.baseURL)/user/item"),
      let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw UserItemError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "PUT"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let body: [String: Any] = [
      "tmdbId": tmdbId,
      "mediaType": mediaType,
      "status": status.rawValue,
    ]

    request.httpBody = try JSONSerialization.data(withJSONObject: body)

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw UserItemError.invalidResponse
    }

    guard http.statusCode == 200 || http.statusCode == 201 else {
      AnalyticsService.trackAPIError(endpoint: "/user/item", statusCode: http.statusCode)
      throw UserItemError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(UpsertUserItemResponse.self, from: data)

    // Update cache with new value
    let key = cacheKey(tmdbId: tmdbId, mediaType: mediaType)
    userItemCache[key] = CachedUserItem(userItem: result.userItem, timestamp: Date())

    return result.userItem
  }

  // MARK: - Delete User Item
  func deleteUserItem(id: String, tmdbId: Int, mediaType: String) async throws {
    guard let url = URL(string: "\(API.baseURL)/user/item/\(id)"),
      let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw UserItemError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "DELETE"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let (_, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw UserItemError.invalidResponse
    }

    guard http.statusCode == 200 || http.statusCode == 204 else {
      throw UserItemError.invalidResponse
    }

    // Invalidate cache
    invalidateCache(tmdbId: tmdbId, mediaType: mediaType)
  }

  // MARK: - Add Watch Entry (Rewatch)
  func addWatchEntry(userItemId: String, watchedAt: Date = Date()) async throws -> WatchEntry {
    guard let url = URL(string: "\(API.baseURL)/watch-entry"),
      let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw UserItemError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

    let body: [String: Any] = [
      "userItemId": userItemId,
      "watchedAt": formatter.string(from: watchedAt),
    ]

    request.httpBody = try JSONSerialization.data(withJSONObject: body)

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw UserItemError.invalidResponse
    }

    guard http.statusCode == 200 || http.statusCode == 201 else {
      throw UserItemError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(WatchEntryResponse.self, from: data)
    return result.watchEntry
  }

  // MARK: - Delete Watch Entry
  func deleteWatchEntry(id: String) async throws {
    guard let url = URL(string: "\(API.baseURL)/watch-entry/\(id)"),
      let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw UserItemError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "DELETE"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let (_, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw UserItemError.invalidResponse
    }

    guard http.statusCode == 200 || http.statusCode == 204 else {
      throw UserItemError.invalidResponse
    }
  }

  // MARK: - Update Watch Entry Date
  func updateWatchEntry(id: String, watchedAt: Date) async throws -> WatchEntry {
    guard let url = URL(string: "\(API.baseURL)/watch-entry/\(id)"),
      let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw UserItemError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "PUT"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

    let body: [String: Any] = [
      "watchedAt": formatter.string(from: watchedAt)
    ]

    request.httpBody = try JSONSerialization.data(withJSONObject: body)

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw UserItemError.invalidResponse
    }

    guard http.statusCode == 200 else {
      throw UserItemError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(WatchEntryResponse.self, from: data)
    return result.watchEntry
  }
}

// MARK: - Models
enum UserItemStatus: String, CaseIterable {
  case watched = "WATCHED"
  case watching = "WATCHING"
  case watchlist = "WATCHLIST"
  case dropped = "DROPPED"

  var icon: String {
    switch self {
    case .watched: return "eye.fill"
    case .watching: return "play.circle.fill"
    case .watchlist: return "clock.fill"
    case .dropped: return "xmark.circle.fill"
    }
  }

  func displayName(strings: Strings) -> String {
    switch self {
    case .watched: return strings.watched
    case .watching: return strings.watching
    case .watchlist: return strings.watchlist
    case .dropped: return strings.dropped
    }
  }
}

struct WatchEntry: Codable, Identifiable {
  let id: String
  let watchedAt: String

  var date: Date? {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter.date(from: watchedAt)
  }
}

struct UserItem: Codable, Identifiable {
  let id: String
  let userId: String
  let tmdbId: Int
  let mediaType: String
  let status: String
  let addedAt: String
  let updatedAt: String
  let watchEntries: [WatchEntry]?

  var statusEnum: UserItemStatus? {
    UserItemStatus(rawValue: status)
  }
}

struct UserItemResponse: Codable {
  let userItem: UserItem?
}

struct UpsertUserItemResponse: Codable {
  let userItem: UserItem
}

struct WatchEntryResponse: Codable {
  let watchEntry: WatchEntry
}

struct WatchEntriesResponse: Codable {
  let watchEntries: [WatchEntry]
}

struct UserItemSummary: Codable, Identifiable {
  let id: String
  let mediaType: String
  let tmdbId: Int
}

struct AllUserItemsResponse: Codable {
  let userItems: [UserItemSummary]
}

struct UserItemsCountResponse: Codable {
  let count: Int
}

enum UserItemError: LocalizedError {
  case invalidURL
  case invalidResponse
  case serverError(String)

  var errorDescription: String? {
    switch self {
    case .invalidURL: return "Invalid URL"
    case .invalidResponse: return "Invalid response from server"
    case .serverError(let message): return "Server error: \(message)"
    }
  }
}
