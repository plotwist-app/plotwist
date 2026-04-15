//
//  ActivityService.swift
//  Plotwist
//

import Foundation

class ActivityService {
  static let shared = ActivityService()
  private init() {}

  func getUserActivities(
    userId: String,
    pageSize: Int = 20,
    cursor: String? = nil,
    language: String = "pt-BR"
  ) async throws -> ActivitiesResponse {
    guard var components = URLComponents(string: "\(API.baseURL)/user/\(userId)/activities") else {
      throw ActivityError.invalidURL
    }

    var queryItems: [URLQueryItem] = [
      URLQueryItem(name: "pageSize", value: "\(pageSize)"),
      URLQueryItem(name: "language", value: language),
    ]
    if let cursor {
      queryItems.append(URLQueryItem(name: "cursor", value: cursor))
    }
    components.queryItems = queryItems

    guard let url = components.url else {
      throw ActivityError.invalidURL
    }

    var request = URLRequest(url: url)
    if let token = UserDefaults.standard.string(forKey: "token") {
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    }

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      AnalyticsService.trackAPIError(endpoint: "/user/\(userId)/activities", statusCode: code)
      throw ActivityError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    return try decoder.decode(ActivitiesResponse.self, from: data)
  }

  func getNetworkActivities(
    userId: String,
    pageSize: Int = 15,
    cursor: String? = nil,
    language: String = "pt-BR"
  ) async throws -> ActivitiesResponse {
    guard var components = URLComponents(string: "\(API.baseURL)/network/activities") else {
      throw ActivityError.invalidURL
    }

    var queryItems: [URLQueryItem] = [
      URLQueryItem(name: "userId", value: userId),
      URLQueryItem(name: "pageSize", value: "\(pageSize)"),
      URLQueryItem(name: "language", value: language),
    ]
    if let cursor {
      queryItems.append(URLQueryItem(name: "cursor", value: cursor))
    }
    components.queryItems = queryItems

    guard let url = components.url else {
      throw ActivityError.invalidURL
    }

    var request = URLRequest(url: url)
    if let token = UserDefaults.standard.string(forKey: "token") {
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    }

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      AnalyticsService.trackAPIError(endpoint: "/network/activities", statusCode: code)
      throw ActivityError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    return try decoder.decode(ActivitiesResponse.self, from: data)
  }
}

// MARK: - Models

struct ActivitiesResponse: Codable {
  let userActivities: [UserActivity]
  let nextCursor: String?
}

struct UserActivity: Codable, Identifiable {
  let id: String
  let userId: String
  let activityType: String
  let entityType: String?
  let entityId: String?
  let metadata: AnyCodable?
  let createdAt: String
  let owner: ActivityOwner
  let additionalInfo: ActivityAdditionalInfo?

  var relativeTime: String {
    let isoFormatter = ISO8601DateFormatter()
    isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    guard let date = isoFormatter.date(from: createdAt) else {
      return ""
    }
    let interval = Date().timeIntervalSince(date)
    if interval < 60 { return "now" }
    if interval < 3600 { return "\(Int(interval / 60))m" }
    if interval < 86400 { return "\(Int(interval / 3600))h" }
    if interval < 2592000 { return "\(Int(interval / 86400))d" }
    if interval < 31536000 { return "\(Int(interval / 2592000))mo" }
    return "\(Int(interval / 31536000))y"
  }
}

struct ActivityOwner: Codable {
  let id: String
  let username: String
  let avatarUrl: String?
}

struct ActivityAdditionalInfo: Codable {
  // Shared fields
  let tmdbId: Int?
  let mediaType: String?
  let title: String?

  // List item activity
  let listId: String?
  let listTitle: String?

  // Follow activity
  let id: String?
  let username: String?
  let avatarUrl: String?

  // Review activity
  let review: String?
  let rating: Double?
  let seasonNumber: Int?
  let episodeNumber: Int?
  let author: ActivityOwner?

  // Change status
  let status: String?

  // Watch episode
  let episodes: [ActivityEpisode]?

  // Reply activity — nested review object
  let reply: String?

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    tmdbId = try container.decodeIfPresent(Int.self, forKey: .tmdbId)
    mediaType = try container.decodeIfPresent(String.self, forKey: .mediaType)
    title = try container.decodeIfPresent(String.self, forKey: .title)
    listId = try container.decodeIfPresent(String.self, forKey: .listId)
    listTitle = try container.decodeIfPresent(String.self, forKey: .listTitle)
    id = try container.decodeIfPresent(String.self, forKey: .id)
    username = try container.decodeIfPresent(String.self, forKey: .username)
    avatarUrl = try container.decodeIfPresent(String.self, forKey: .avatarUrl)
    review = try container.decodeIfPresent(String.self, forKey: .review)
    rating = try container.decodeIfPresent(Double.self, forKey: .rating)
    seasonNumber = try container.decodeIfPresent(Int.self, forKey: .seasonNumber)
    episodeNumber = try container.decodeIfPresent(Int.self, forKey: .episodeNumber)
    author = try container.decodeIfPresent(ActivityOwner.self, forKey: .author)
    status = try container.decodeIfPresent(String.self, forKey: .status)
    episodes = try container.decodeIfPresent([ActivityEpisode].self, forKey: .episodes)
    reply = try container.decodeIfPresent(String.self, forKey: .reply)
  }

  enum CodingKeys: String, CodingKey {
    case tmdbId, mediaType, title, listId, listTitle
    case id, username, avatarUrl
    case review, rating, seasonNumber, episodeNumber, author
    case status, episodes, reply
  }
}

struct ActivityEpisode: Codable {
  let tmdbId: Int
  let seasonNumber: Int
  let episodeNumber: Int
  let runtime: Int?
}

struct AnyCodable: Codable {
  init(from decoder: Decoder) throws {
    // We don't need to decode metadata, just skip it
  }

  func encode(to encoder: Encoder) throws {}
}

enum ActivityError: LocalizedError {
  case invalidURL
  case invalidResponse

  var errorDescription: String? {
    switch self {
    case .invalidURL: return "Invalid URL"
    case .invalidResponse: return "Invalid response from server"
    }
  }
}
