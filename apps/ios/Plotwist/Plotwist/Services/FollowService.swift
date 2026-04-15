//
//  FollowService.swift
//  Plotwist
//

import Foundation

class FollowService {
  static let shared = FollowService()
  private init() {}

  // MARK: - Check Follow Status
  func getFollow(userId: String) async throws -> Follow? {
    guard let token = UserDefaults.standard.string(forKey: "token") else {
      return nil
    }

    guard var components = URLComponents(string: "\(API.baseURL)/follow") else {
      throw FollowError.invalidURL
    }
    components.queryItems = [URLQueryItem(name: "userId", value: userId)]

    guard let url = components.url else {
      throw FollowError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      AnalyticsService.trackAPIError(endpoint: "/follow", statusCode: code)
      throw FollowError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(GetFollowResponse.self, from: data)
    return result.follow
  }

  // MARK: - Follow User
  func followUser(userId: String) async throws {
    guard let token = UserDefaults.standard.string(forKey: "token"),
          let url = URL(string: "\(API.baseURL)/follow") else {
      throw FollowError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(["userId": userId])

    let (_, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, (200...201).contains(http.statusCode) else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      if code == 409 {
        return
      }
      AnalyticsService.trackAPIError(endpoint: "/follow POST", statusCode: code)
      throw FollowError.invalidResponse
    }
  }

  // MARK: - Unfollow User
  func unfollowUser(userId: String) async throws {
    guard let token = UserDefaults.standard.string(forKey: "token"),
          let url = URL(string: "\(API.baseURL)/follow") else {
      throw FollowError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "DELETE"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(["userId": userId])

    let (_, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, (200...204).contains(http.statusCode) else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      AnalyticsService.trackAPIError(endpoint: "/follow DELETE", statusCode: code)
      throw FollowError.invalidResponse
    }
  }

  // MARK: - Check if a user follows the current user
  func doesUserFollowMe(userId targetUserId: String) async throws -> Bool {
    guard let currentUserId = CollectionCache.shared.user?.id else {
      return false
    }
    let response = try await getFollowers(followedId: currentUserId, pageSize: 100)
    return response.followers.contains { $0.followerId == targetUserId }
  }

  // MARK: - Get Followers / Following List
  func getFollowers(
    followedId: String? = nil,
    followerId: String? = nil,
    pageSize: Int = 20,
    cursor: String? = nil
  ) async throws -> FollowersResponse {
    guard var components = URLComponents(string: "\(API.baseURL)/followers") else {
      throw FollowError.invalidURL
    }

    var queryItems: [URLQueryItem] = [
      URLQueryItem(name: "pageSize", value: "\(pageSize)")
    ]
    if let followedId {
      queryItems.append(URLQueryItem(name: "followedId", value: followedId))
    }
    if let followerId {
      queryItems.append(URLQueryItem(name: "followerId", value: followerId))
    }
    if let cursor {
      queryItems.append(URLQueryItem(name: "cursor", value: cursor))
    }
    components.queryItems = queryItems

    guard let url = components.url else {
      throw FollowError.invalidURL
    }

    let (data, response) = try await URLSession.shared.data(from: url)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      AnalyticsService.trackAPIError(endpoint: "/followers", statusCode: code)
      throw FollowError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    return try decoder.decode(FollowersResponse.self, from: data)
  }
}

// MARK: - Models

struct Follow: Codable {
  let followerId: String
  let followedId: String
  let createdAt: String
}

struct GetFollowResponse: Codable {
  let follow: Follow?
}

struct FollowerItem: Codable, Identifiable {
  let followerId: String
  let followedId: String
  let createdAt: String
  let username: String
  let avatarUrl: String?
  let subscriptionType: String

  var id: String { "\(followerId)-\(followedId)" }

  var avatarImageURL: URL? {
    guard let avatarUrl else { return nil }
    return URL(string: avatarUrl)
  }

  var isPro: Bool {
    subscriptionType == "PRO"
  }
}

struct FollowersResponse: Codable {
  let followers: [FollowerItem]
  let nextCursor: String?
}

enum FollowError: LocalizedError {
  case invalidURL
  case invalidResponse

  var errorDescription: String? {
    switch self {
    case .invalidURL: return "Invalid URL"
    case .invalidResponse: return "Invalid response from server"
    }
  }
}
