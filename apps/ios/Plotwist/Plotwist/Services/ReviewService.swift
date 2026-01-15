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

    let encoder = JSONEncoder()
    encoder.keyEncodingStrategy = .convertToSnakeCase
    request.httpBody = try encoder.encode(reviewData)

    let (_, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw ReviewError.invalidResponse
    }

    guard http.statusCode == 200 || http.statusCode == 201 else {
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

    let encoder = JSONEncoder()
    encoder.keyEncodingStrategy = .convertToSnakeCase
    request.httpBody = try encoder.encode(reviewData)

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
}

enum ReviewError: LocalizedError {
  case invalidURL
  case invalidResponse
  case notFound

  var errorDescription: String? {
    switch self {
    case .invalidURL: return "Invalid URL"
    case .invalidResponse: return "Invalid response"
    case .notFound: return "Review not found"
    }
  }
}
