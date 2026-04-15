//
//  AchievementService.swift
//  Plotwist
//

import Foundation

class AchievementService {
  static let shared = AchievementService()
  private init() {}

  // MARK: - Cache
  private var cachedAchievements: CachedData?
  private let cacheDuration: TimeInterval = 300

  private struct CachedData {
    let achievements: [Achievement]
    let timestamp: Date
  }

  func invalidateCache() {
    cachedAchievements = nil
  }

  // MARK: - API Response Models

  struct AchievementsResponse: Codable {
    let achievements: [AchievementDTO]
  }

  struct AchievementDTO: Codable {
    let id: String
    let slug: String
    let icon: String
    let target: Int
    let category: String
    let level: Int
    let name: [String: String]
    let description: [String: String]
    let sortOrder: Int
    let current: Int
    let isClaimed: Bool
    let isEquipped: Bool
    let claimedAt: String?
  }

  struct ClaimResponse: Codable {
    let userAchievement: UserAchievementDTO
  }

  struct UserAchievementDTO: Codable {
    let id: String
    let userId: String
    let achievementId: String
    let isClaimed: Bool
    let isEquipped: Bool
    let claimedAt: String?
    let updatedAt: String
  }

  // MARK: - Get Achievements

  func getAchievements(forceRefresh: Bool = false) async throws -> [Achievement] {
    if !forceRefresh,
       let cached = cachedAchievements,
       Date().timeIntervalSince(cached.timestamp) < cacheDuration {
      return cached.achievements
    }

    guard let url = URL(string: "\(API.baseURL)/achievements"),
          let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw AchievementError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw AchievementError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(AchievementsResponse.self, from: data)

    let lang = Language.current.rawValue
    let achievements = result.achievements.map { dto in
      Achievement(
        id: dto.slug,
        icon: dto.icon,
        name: dto.name[lang] ?? dto.name["en-US"] ?? dto.slug,
        description: dto.description[lang] ?? dto.description["en-US"] ?? "",
        current: dto.current,
        target: dto.target,
        level: dto.level,
        isClaimed: dto.isClaimed,
        isEquipped: dto.isEquipped,
        remoteId: dto.id,
        category: dto.category,
        sortOrder: dto.sortOrder
      )
    }
    .sorted { $0.sortOrder < $1.sortOrder }

    cachedAchievements = CachedData(achievements: achievements, timestamp: Date())
    return achievements
  }

  // MARK: - Claim Achievement

  func claimAchievement(id: String) async throws -> UserAchievementDTO {
    guard let url = URL(string: "\(API.baseURL)/achievements/\(id)/claim"),
          let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw AchievementError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw AchievementError.invalidResponse
    }

    guard http.statusCode == 200 else {
      if let errorString = String(data: data, encoding: .utf8) {
        throw AchievementError.serverError(errorString)
      }
      throw AchievementError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(ClaimResponse.self, from: data)

    invalidateCache()
    return result.userAchievement
  }

  // MARK: - Toggle Equip

  func toggleEquip(id: String, isEquipped: Bool) async throws -> UserAchievementDTO {
    guard let url = URL(string: "\(API.baseURL)/achievements/\(id)/equip"),
          let token = UserDefaults.standard.string(forKey: "token")
    else {
      throw AchievementError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "PUT"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let body: [String: Any] = ["isEquipped": isEquipped]
    request.httpBody = try JSONSerialization.data(withJSONObject: body)

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw AchievementError.invalidResponse
    }

    guard http.statusCode == 200 else {
      if let errorString = String(data: data, encoding: .utf8) {
        throw AchievementError.serverError(errorString)
      }
      throw AchievementError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(ClaimResponse.self, from: data)

    invalidateCache()
    return result.userAchievement
  }
}

// MARK: - Errors

enum AchievementError: LocalizedError {
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
