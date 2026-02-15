//
//  UserStatsService.swift
//  Plotwist
//

import Foundation

class UserStatsService {
  static let shared = UserStatsService()
  private init() {}

  // MARK: - Get User Stats (followers, following, watched counts)
  func getUserStats(userId: String) async throws -> UserStats {
    guard let url = URL(string: "\(API.baseURL)/user/\(userId)/stats") else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    API.addIOSTokenHeader(to: &request)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      AnalyticsService.trackAPIError(endpoint: "/user/stats", statusCode: code)
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    return try decoder.decode(UserStats.self, from: data)
  }

  // MARK: - Get Total Hours Watched
  func getTotalHours(userId: String) async throws -> Double {
    guard let url = URL(string: "\(API.baseURL)/user/\(userId)/total-hours") else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    API.addIOSTokenHeader(to: &request)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      AnalyticsService.trackAPIError(endpoint: "/user/total-hours", statusCode: code)
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(TotalHoursResponse.self, from: data)
    return result.totalHours
  }

  // MARK: - Get Watched Genres
  func getWatchedGenres(userId: String, language: String = "en-US") async throws -> [WatchedGenre] {
    guard let url = URL(string: "\(API.baseURL)/user/\(userId)/watched-genres?language=\(language)") else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    API.addIOSTokenHeader(to: &request)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(WatchedGenresResponse.self, from: data)
    return result.genres
  }

  // MARK: - Get Items Status Distribution
  func getItemsStatus(userId: String) async throws -> [ItemStatusStat] {
    guard let url = URL(string: "\(API.baseURL)/user/\(userId)/items-status") else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    API.addIOSTokenHeader(to: &request)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(ItemsStatusResponse.self, from: data)
    return result.userItems
  }
  // MARK: - Get Best Reviews
  func getBestReviews(userId: String, language: String = "en-US", limit: Int = 50) async throws -> [BestReview] {
    guard let url = URL(string: "\(API.baseURL)/user/\(userId)/best-reviews?language=\(language)&limit=\(limit)") else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    API.addIOSTokenHeader(to: &request)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(BestReviewsResponse.self, from: data)
    return result.bestReviews
  }
}

// MARK: - Models
// Note: UserStats is defined in AuthService.swift

struct TotalHoursResponse: Codable {
  let totalHours: Double
}

struct WatchedGenre: Codable, Identifiable {
  let name: String
  let count: Int
  let percentage: Double

  var id: String { name }
}

struct WatchedGenresResponse: Codable {
  let genres: [WatchedGenre]
}

struct ItemStatusStat: Codable, Identifiable {
  let status: String
  let count: Int
  let percentage: Double

  var id: String { status }
}

struct ItemsStatusResponse: Codable {
  let userItems: [ItemStatusStat]
}

struct BestReview: Codable, Identifiable {
  let id: String
  let userId: String
  let tmdbId: Int
  let mediaType: String
  let review: String
  let rating: Double
  let hasSpoilers: Bool
  let seasonNumber: Int?
  let episodeNumber: Int?
  let language: String?
  let createdAt: String
  let title: String
  let posterPath: String?
  let date: String?
  
  var posterURL: URL? {
    guard let posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w342\(posterPath)")
  }
}

struct BestReviewsResponse: Codable {
  let bestReviews: [BestReview]
}

enum UserStatsError: LocalizedError {
  case invalidURL
  case invalidResponse

  var errorDescription: String? {
    switch self {
    case .invalidURL: return "Invalid URL"
    case .invalidResponse: return "Invalid response from server"
    }
  }
}
