//
//  UserItemService.swift
//  Plotwist
//

import Foundation

class UserItemService {
  static let shared = UserItemService()
  private init() {}

  // MARK: - Get User Item
  func getUserItem(tmdbId: Int, mediaType: String) async throws -> UserItem? {
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
      return nil
    }

    guard http.statusCode == 200 else {
      throw UserItemError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(UserItemResponse.self, from: data)
    return result.userItem
  }

  // MARK: - Upsert User Item (Create or Update)
  func upsertUserItem(tmdbId: Int, mediaType: String, status: UserItemStatus) async throws -> UserItem {
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
      throw UserItemError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(UpsertUserItemResponse.self, from: data)
    return result.userItem
  }

  // MARK: - Delete User Item
  func deleteUserItem(id: String) async throws {
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

struct UserItem: Codable, Identifiable {
  let id: String
  let userId: String
  let tmdbId: Int
  let mediaType: String
  let status: String
  let addedAt: String
  let updatedAt: String

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
