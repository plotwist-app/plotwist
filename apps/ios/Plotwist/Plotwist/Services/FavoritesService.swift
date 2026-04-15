//
//  FavoritesService.swift
//  Plotwist
//

import Foundation

// MARK: - Models

struct UserFavorite: Codable, Identifiable {
  let id: String
  let userId: String
  let tmdbId: Int
  let mediaType: String
  let position: Int
  let createdAt: String
}

struct UserFavoritesResponse: Codable {
  let favorites: [UserFavorite]
}

struct ToggleFavoriteResponse: Codable {
  let favorite: UserFavorite?
  let action: String
}

struct CheckFavoriteResponse: Codable {
  let isFavorite: Bool
}

// MARK: - Errors

enum FavoritesError: LocalizedError {
  case invalidURL
  case invalidResponse
  case unauthorized

  var errorDescription: String? {
    switch self {
    case .invalidURL: return "Invalid URL"
    case .invalidResponse: return "Invalid response"
    case .unauthorized: return "Unauthorized"
    }
  }
}

// MARK: - Service

class FavoritesService {
  static let shared = FavoritesService()
  private init() {}

  private var cache: [String: CachedFavorites] = [:]
  private var checkCache: [String: CachedCheck] = [:]
  private let cacheDuration: TimeInterval = 300

  private struct CachedFavorites {
    let favorites: [UserFavorite]
    let timestamp: Date
  }

  private struct CachedCheck {
    let isFavorite: Bool
    let timestamp: Date
  }

  private func checkKey(_ tmdbId: Int, _ mediaType: String) -> String {
    "\(tmdbId)-\(mediaType)"
  }

  func invalidateCache(userId: String) {
    cache.removeValue(forKey: userId)
  }

  func invalidateCheckCache(tmdbId: Int, mediaType: String) {
    checkCache.removeValue(forKey: checkKey(tmdbId, mediaType))
  }

  // MARK: - Get Favorites

  func getFavorites(userId: String) async throws -> [UserFavorite] {
    if let cached = cache[userId],
       Date().timeIntervalSince(cached.timestamp) < cacheDuration {
      return cached.favorites
    }

    guard let url = URL(string: "\(API.baseURL)/user/favorites?userId=\(userId)") else {
      throw FavoritesError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw FavoritesError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(UserFavoritesResponse.self, from: data)

    cache[userId] = CachedFavorites(favorites: result.favorites, timestamp: Date())
    return result.favorites
  }

  // MARK: - Toggle Favorite

  func toggleFavorite(tmdbId: Int, mediaType: String, position: Int = 0) async throws -> ToggleFavoriteResponse {
    guard let token = UserDefaults.standard.string(forKey: "token"),
          let url = URL(string: "\(API.baseURL)/user/favorite") else {
      throw FavoritesError.unauthorized
    }

    var request = URLRequest(url: url)
    request.httpMethod = "PUT"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let body: [String: Any] = [
      "tmdbId": tmdbId,
      "mediaType": mediaType,
      "position": position,
    ]
    request.httpBody = try JSONSerialization.data(withJSONObject: body)

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw FavoritesError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(ToggleFavoriteResponse.self, from: data)

    let isFav = result.action == "added"
    checkCache[checkKey(tmdbId, mediaType)] = CachedCheck(isFavorite: isFav, timestamp: Date())

    if let userId = CollectionCache.shared.user?.id {
      invalidateCache(userId: userId)
    }

    return result
  }

  // MARK: - Check Favorite

  func checkFavorite(tmdbId: Int, mediaType: String) async throws -> Bool {
    let key = checkKey(tmdbId, mediaType)

    if let cached = checkCache[key],
       Date().timeIntervalSince(cached.timestamp) < cacheDuration {
      return cached.isFavorite
    }

    guard let token = UserDefaults.standard.string(forKey: "token"),
          let url = URL(string: "\(API.baseURL)/user/favorite/check?tmdbId=\(tmdbId)&mediaType=\(mediaType)") else {
      throw FavoritesError.unauthorized
    }

    var request = URLRequest(url: url)
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw FavoritesError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(CheckFavoriteResponse.self, from: data)

    checkCache[key] = CachedCheck(isFavorite: result.isFavorite, timestamp: Date())
    return result.isFavorite
  }
}
