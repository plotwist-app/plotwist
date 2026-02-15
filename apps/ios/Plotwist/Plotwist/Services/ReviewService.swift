//
//  ReviewService.swift
//  Plotwist
//

import Foundation

class ReviewService {
  static let shared = ReviewService()
  private init() {}

  // MARK: - Cache
  private var reviewCache: [String: CachedReview] = [:]
  private let cacheDuration: TimeInterval = 300  // 5 minutes

  private struct CachedReview {
    let review: Review?
    let timestamp: Date
  }

  private func cacheKey(tmdbId: Int, mediaType: String, seasonNumber: Int?, episodeNumber: Int?)
    -> String
  {
    var key = "\(tmdbId)-\(mediaType)"
    if let season = seasonNumber { key += "-s\(season)" }
    if let episode = episodeNumber { key += "-e\(episode)" }
    return key
  }

  func invalidateCache(tmdbId: Int, mediaType: String, seasonNumber: Int? = nil, episodeNumber: Int? = nil) {
    let key = cacheKey(tmdbId: tmdbId, mediaType: mediaType, seasonNumber: seasonNumber, episodeNumber: episodeNumber)
    reviewCache.removeValue(forKey: key)
  }

  func invalidateAllCache() {
    reviewCache.removeAll()
  }

  // MARK: - Get User Review
  func getUserReview(
    tmdbId: Int,
    mediaType: String,
    seasonNumber: Int? = nil,
    episodeNumber: Int? = nil
  ) async throws -> Review? {
    let key = cacheKey(tmdbId: tmdbId, mediaType: mediaType, seasonNumber: seasonNumber, episodeNumber: episodeNumber)

    // Check cache
    if let cached = reviewCache[key],
       Date().timeIntervalSince(cached.timestamp) < cacheDuration {
      return cached.review
    }

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
    API.addIOSTokenHeader(to: &request)
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw ReviewError.invalidResponse
    }

    if http.statusCode == 404 {
      // Cache nil result
      reviewCache[key] = CachedReview(review: nil, timestamp: Date())
      return nil
    }

    guard http.statusCode == 200 else {
      throw ReviewError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(ReviewResponse.self, from: data)

    // Cache result
    reviewCache[key] = CachedReview(review: result.review, timestamp: Date())

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
    API.addIOSTokenHeader(to: &request)
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

    // Invalidate cache
    invalidateCache(
      tmdbId: reviewData.tmdbId,
      mediaType: reviewData.mediaType,
      seasonNumber: reviewData.seasonNumber,
      episodeNumber: reviewData.episodeNumber
    )
  }

  // MARK: - Update Review
  func updateReview(id: String, _ reviewData: ReviewData) async throws {
    guard let url = URL(string: "\(API.baseURL)/review/by/\(id)"),
      let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw ReviewError.invalidURL
    }

    var request = URLRequest(url: url)
    API.addIOSTokenHeader(to: &request)
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

    // Invalidate cache
    invalidateCache(
      tmdbId: reviewData.tmdbId,
      mediaType: reviewData.mediaType,
      seasonNumber: reviewData.seasonNumber,
      episodeNumber: reviewData.episodeNumber
    )
  }

  // MARK: - Delete Review
  func deleteReview(id: String, tmdbId: Int, mediaType: String, seasonNumber: Int? = nil, episodeNumber: Int? = nil) async throws {
    guard let url = URL(string: "\(API.baseURL)/review/by/\(id)"),
      let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw ReviewError.invalidURL
    }

    var request = URLRequest(url: url)
    API.addIOSTokenHeader(to: &request)
    request.httpMethod = "DELETE"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let (_, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw ReviewError.invalidResponse
    }

    guard http.statusCode == 200 || http.statusCode == 204 else {
      throw ReviewError.invalidResponse
    }

    // Invalidate cache
    invalidateCache(
      tmdbId: tmdbId,
      mediaType: mediaType,
      seasonNumber: seasonNumber,
      episodeNumber: episodeNumber
    )
  }

  // MARK: - Get User Reviews Count
  func getUserReviewsCount(userId: String) async throws -> Int {
    guard let url = URL(string: "\(API.baseURL)/user/\(userId)/reviews-count") else {
      throw ReviewError.invalidURL
    }

    let (data, response) = try await URLSession.shared.data(from: url)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw ReviewError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(ReviewsCountResponse.self, from: data)
    return result.reviewsCount
  }

  // MARK: - Get User Detailed Reviews (for profile with pagination)
  func getUserDetailedReviews(
    userId: String,
    language: String = Language.current.rawValue,
    orderBy: String = "createdAt",
    page: Int = 1,
    limit: Int = 20
  ) async throws -> DetailedReviewsPageResponse {
    let urlString = "\(API.baseURL)/detailed/reviews?userId=\(userId)&language=\(language)&orderBy=\(orderBy)&page=\(page)&limit=\(limit)"
    
    guard let url = URL(string: urlString) else {
      throw ReviewError.invalidURL
    }
    
    var request = URLRequest(url: url)
    API.addIOSTokenHeader(to: &request)
    if let token = UserDefaults.standard.string(forKey: "token") {
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    }
    let (data, response) = try await URLSession.shared.data(for: request)
    
    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw ReviewError.invalidResponse
    }
    
    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    return try decoder.decode(DetailedReviewsPageResponse.self, from: data)
  }
  
  // MARK: - Get Reviews List
  func getReviews(
    tmdbId: Int,
    mediaType: String,
    orderBy: String = "createdAt",
    limit: Int = 50,
    seasonNumber: Int? = nil,
    episodeNumber: Int? = nil
  ) async throws -> [ReviewListItem] {
    var urlString =
      "\(API.baseURL)/reviews?tmdbId=\(tmdbId)&mediaType=\(mediaType)&orderBy=\(orderBy)&limit=\(limit)"

    if let seasonNumber = seasonNumber {
      urlString += "&seasonNumber=\(seasonNumber)"
    }

    if let episodeNumber = episodeNumber {
      urlString += "&episodeNumber=\(episodeNumber)"
    }

    guard let url = URL(string: urlString) else {
      throw ReviewError.invalidURL
    }

    var request = URLRequest(url: url)
    API.addIOSTokenHeader(to: &request)
    // Add token if available (optional auth)
    if let token = UserDefaults.standard.string(forKey: "token") {
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    }

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw ReviewError.invalidResponse
    }

    guard http.statusCode == 200 else {
      throw ReviewError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    return try decoder.decode([ReviewListItem].self, from: data)
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
  let language: String?
  let createdAt: String
}

struct ReviewResponse: Codable {
  let review: Review?
}

struct ReviewsCountResponse: Codable {
  let reviewsCount: Int
}

struct ReviewUser: Codable {
  let id: String
  let username: String
  let avatarUrl: String?
}

struct UserLike: Codable {
  let id: String
  let entityId: String
  let userId: String
  let createdAt: String
}

struct ReviewListItem: Codable, Identifiable {
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
  let user: ReviewUser
  let likeCount: Int
  let replyCount: Int
  let userLike: UserLike?
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

// MARK: - Detailed Review (for profile reviews list)
struct DetailedReview: Codable, Identifiable {
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
  let user: ReviewUser
  let likeCount: Int
  let replyCount: Int
  let userLike: UserLike?
  let title: String
  let posterPath: String?
  let backdropPath: String?
  
  var posterURL: URL? {
    guard let posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w342\(posterPath)")
  }
  
  var formattedDate: String {
    let inputFormatter = ISO8601DateFormatter()
    inputFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    
    guard let date = inputFormatter.date(from: createdAt) else {
      // Try without fractional seconds
      inputFormatter.formatOptions = [.withInternetDateTime]
      guard let date = inputFormatter.date(from: createdAt) else {
        return createdAt
      }
      return formatDate(date)
    }
    return formatDate(date)
  }
  
  private func formatDate(_ date: Date) -> String {
    let outputFormatter = DateFormatter()
    outputFormatter.dateFormat = "dd/MM/yyyy"
    return outputFormatter.string(from: date)
  }
  
  var seasonBadge: String? {
    guard mediaType == "TV_SHOW", let season = seasonNumber else { return nil }
    if let episode = episodeNumber {
      return "(S\(String(format: "%02d", season))E\(String(format: "%02d", episode)))"
    }
    return "(S\(String(format: "%02d", season)))"
  }
}

struct PaginationInfo: Codable {
  let page: Int
  let limit: Int
  let hasMore: Bool
}

struct DetailedReviewsPageResponse: Codable {
  let reviews: [DetailedReview]
  let pagination: PaginationInfo
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
