//
//  ReviewService.swift
//  Plotwist
//

import Foundation

class ReviewService {
  static let shared = ReviewService()
  private init() {}

  // MARK: - Get User Review
  func getUserReview(
    tmdbId: Int,
    mediaType: String,
    seasonNumber: Int? = nil,
    episodeNumber: Int? = nil
  ) async throws -> Review? {
    var urlString = "\(API.baseURL)/review?tmdbId=\(tmdbId)&mediaType=\(mediaType)"

    if let seasonNumber = seasonNumber {
      urlString += "&seasonNumber=\(seasonNumber)"
    }

    if let episodeNumber = episodeNumber {
      urlString += "&episodeNumber=\(episodeNumber)"
    }

    guard let url = URL(string: urlString),
      let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw ReviewError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw ReviewError.invalidResponse
    }

    if http.statusCode == 404 {
      return nil
    }

    guard http.statusCode == 200 else {
      throw ReviewError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(ReviewResponse.self, from: data)
    return result.review
  }

  // MARK: - Create Review
  func createReview(_ reviewData: ReviewData) async throws {
    guard let url = URL(string: "\(API.baseURL)/review"),
      let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw ReviewError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    // Create JSON dictionary with camelCase keys (as expected by Drizzle schema)
    var jsonDict: [String: Any] = [
      "tmdbId": reviewData.tmdbId,
      "mediaType": reviewData.mediaType,
      "review": reviewData.review,
      "rating": reviewData.rating,
      "hasSpoilers": reviewData.hasSpoilers,
      "language": reviewData.language,
    ]

    // Only add optional values if they exist
    if let seasonNumber = reviewData.seasonNumber {
      jsonDict["seasonNumber"] = seasonNumber
    }
    if let episodeNumber = reviewData.episodeNumber {
      jsonDict["episodeNumber"] = episodeNumber
    }

    let jsonData = try JSONSerialization.data(withJSONObject: jsonDict, options: [])
    request.httpBody = jsonData

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw ReviewError.invalidResponse
    }

    guard http.statusCode == 200 || http.statusCode == 201 else {
      if let errorString = String(data: data, encoding: .utf8) {
        throw ReviewError.serverError(errorString)
      }
      throw ReviewError.invalidResponse
    }
  }

  // MARK: - Update Review
  func updateReview(id: String, _ reviewData: ReviewData) async throws {
    guard let url = URL(string: "\(API.baseURL)/review/by/\(id)"),
      let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw ReviewError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "PUT"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    // For update, we only send the fields that can be updated (camelCase)
    let jsonDict: [String: Any] = [
      "rating": reviewData.rating,
      "review": reviewData.review,
      "hasSpoilers": reviewData.hasSpoilers,
    ]

    let jsonData = try JSONSerialization.data(withJSONObject: jsonDict, options: [])
    request.httpBody = jsonData

    let (_, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw ReviewError.invalidResponse
    }

    guard http.statusCode == 200 else {
      throw ReviewError.invalidResponse
    }
  }

  // MARK: - Delete Review
  func deleteReview(id: String) async throws {
    guard let url = URL(string: "\(API.baseURL)/review/by/\(id)"),
      let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw ReviewError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "DELETE"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let (_, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw ReviewError.invalidResponse
    }

    guard http.statusCode == 200 || http.statusCode == 204 else {
      throw ReviewError.invalidResponse
    }
  }
}

// MARK: - Models
struct Review: Codable, Identifiable {
  let id: String
  let userId: String
  let tmdbId: Int
  let mediaType: String
  let review: String
  let rating: Double
  let hasSpoilers: Bool
  let seasonNumber: Int?
  let episodeNumber: Int?
  let language: String
  let createdAt: String
  let updatedAt: String
}

struct ReviewResponse: Codable {
  let review: Review?
}

struct ReviewData: Codable {
  let tmdbId: Int
  let mediaType: String
  let review: String
  let rating: Double
  let hasSpoilers: Bool
  let seasonNumber: Int?
  let episodeNumber: Int?
  let language: String

  enum CodingKeys: String, CodingKey {
    case tmdbId = "tmdb_id"
    case mediaType = "media_type"
    case review
    case rating
    case hasSpoilers = "has_spoilers"
    case seasonNumber = "season_number"
    case episodeNumber = "episode_number"
    case language
  }

  func encode(to encoder: Encoder) throws {
    var container = encoder.container(keyedBy: CodingKeys.self)
    try container.encode(tmdbId, forKey: .tmdbId)
    try container.encode(mediaType, forKey: .mediaType)
    try container.encode(review, forKey: .review)
    try container.encode(rating, forKey: .rating)
    try container.encode(hasSpoilers, forKey: .hasSpoilers)
    try container.encode(language, forKey: .language)

    // Only encode optional values if they're not nil
    if let seasonNumber = seasonNumber {
      try container.encode(seasonNumber, forKey: .seasonNumber)
    }
    if let episodeNumber = episodeNumber {
      try container.encode(episodeNumber, forKey: .episodeNumber)
    }
  }
}

enum ReviewError: LocalizedError {
  case invalidURL
  case invalidResponse
  case notFound
  case serverError(String)

  var errorDescription: String? {
    switch self {
    case .invalidURL: return "Invalid URL"
    case .invalidResponse: return "Invalid response from server"
    case .notFound: return "Review not found"
    case .serverError(let message): return "Server error: \(message)"
    }
  }
}
