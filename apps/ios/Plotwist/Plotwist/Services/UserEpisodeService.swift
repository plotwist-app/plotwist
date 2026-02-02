//
//  UserEpisodeService.swift
//  Plotwist
//

import Foundation

// MARK: - User Episode Models
struct UserEpisode: Codable, Identifiable {
  let id: String
  let userId: String
  let tmdbId: Int
  let seasonNumber: Int
  let episodeNumber: Int
  let watchedAt: String
}

struct CreateUserEpisodeData: Codable {
  let tmdbId: Int
  let seasonNumber: Int
  let episodeNumber: Int
  let runtime: Int?
}

struct DeleteUserEpisodesData: Codable {
  let ids: [String]
}

// MARK: - User Episode Service
class UserEpisodeService {
  static let shared = UserEpisodeService()
  private init() {}

  // MARK: - Cache
  private var episodeCache: [String: [UserEpisode]] = [:]
  private let cacheDuration: TimeInterval = 300 // 5 minutes
  private var cacheTimestamps: [String: Date] = [:]

  private func cacheKey(tmdbId: Int) -> String {
    return "\(tmdbId)"
  }

  func invalidateCache(tmdbId: Int) {
    let key = cacheKey(tmdbId: tmdbId)
    episodeCache.removeValue(forKey: key)
    cacheTimestamps.removeValue(forKey: key)
  }

  // MARK: - Get Watched Episodes
  func getWatchedEpisodes(tmdbId: Int) async throws -> [UserEpisode] {
    let key = cacheKey(tmdbId: tmdbId)

    // Check cache
    if let cached = episodeCache[key],
       let timestamp = cacheTimestamps[key],
       Date().timeIntervalSince(timestamp) < cacheDuration {
      return cached
    }

    guard let url = URL(string: "\(API.baseURL)/user/episodes?tmdbId=\(tmdbId)"),
          let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw UserEpisodeError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw UserEpisodeError.invalidResponse
    }

    // Empty array is valid when no episodes are watched
    if http.statusCode == 200 {
      let decoder = JSONDecoder()
      let episodes = try decoder.decode([UserEpisode].self, from: data)

      // Cache result
      episodeCache[key] = episodes
      cacheTimestamps[key] = Date()

      return episodes
    }

    throw UserEpisodeError.invalidResponse
  }

  // MARK: - Mark Episode as Watched
  func markAsWatched(tmdbId: Int, seasonNumber: Int, episodeNumber: Int, runtime: Int? = nil) async throws -> UserEpisode {
    guard let url = URL(string: "\(API.baseURL)/user/episodes"),
          let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw UserEpisodeError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let episodeData = CreateUserEpisodeData(
      tmdbId: tmdbId,
      seasonNumber: seasonNumber,
      episodeNumber: episodeNumber,
      runtime: runtime
    )

    let encoder = JSONEncoder()
    request.httpBody = try encoder.encode([episodeData])

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw UserEpisodeError.invalidResponse
    }

    if http.statusCode == 409 {
      throw UserEpisodeError.alreadyExists
    }

    guard http.statusCode == 201 else {
      print("Mark as watched failed with status: \(http.statusCode)")
      if let responseString = String(data: data, encoding: .utf8) {
        print("Response: \(responseString)")
      }
      throw UserEpisodeError.invalidResponse
    }

    let decoder = JSONDecoder()
    let episodes = try decoder.decode([UserEpisode].self, from: data)

    guard let episode = episodes.first else {
      throw UserEpisodeError.invalidResponse
    }

    // Track episode watched
    AnalyticsService.shared.track(.episodeWatched(
      tmdbId: tmdbId,
      season: seasonNumber,
      episode: episodeNumber
    ))

    // Invalidate cache
    invalidateCache(tmdbId: tmdbId)

    return episode
  }

  // MARK: - Unmark Episode as Watched
  func unmarkAsWatched(id: String, tmdbId: Int) async throws {
    guard let url = URL(string: "\(API.baseURL)/user/episodes"),
          let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw UserEpisodeError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "DELETE"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let deleteData = DeleteUserEpisodesData(ids: [id])

    let encoder = JSONEncoder()
    request.httpBody = try encoder.encode(deleteData)

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw UserEpisodeError.invalidResponse
    }

    guard http.statusCode == 204 else {
      print("Unmark as watched failed with status: \(http.statusCode)")
      if let responseString = String(data: data, encoding: .utf8) {
        print("Response: \(responseString)")
      }
      throw UserEpisodeError.invalidResponse
    }

    // Invalidate cache
    invalidateCache(tmdbId: tmdbId)
  }
}

// MARK: - Error Types
enum UserEpisodeError: Error {
  case invalidURL
  case invalidResponse
  case alreadyExists
}
