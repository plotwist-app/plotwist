//
//  AuthService.swift
//  Plotwist
//

import Foundation

class AuthService {
  static let shared = AuthService()
  private init() {}

  // MARK: - Cache
  private var preferencesCache: CachedPreferences?
  private let cacheDuration: TimeInterval = 300  // 5 minutes

  private struct CachedPreferences {
    let preferences: UserPreferences?
    let timestamp: Date
  }

  func invalidatePreferencesCache() {
    preferencesCache = nil
  }

  // MARK: - Sign In
  func signIn(login: String, password: String) async throws -> String {
    guard let url = URL(string: "\(API.baseURL)/login") else {
      throw AuthError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(["login": login, "password": password])

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw AuthError.invalidResponse
    }

    guard http.statusCode == 200 else {
      throw AuthError.invalidCredentials
    }

    let result = try JSONDecoder().decode(LoginResponse.self, from: data)
    UserDefaults.standard.set(result.token, forKey: "token")
    NotificationCenter.default.post(name: .authChanged, object: nil)
    
    // Identify user for analytics
    Task {
      if let user = try? await getCurrentUser() {
        AnalyticsService.shared.identify(userId: user.id, properties: [
          "username": user.username,
          "subscription_type": user.subscriptionType ?? "MEMBER"
        ])
      }
    }
    
    return result.token
  }

  // MARK: - Sign Up
  func signUp(email: String, password: String, username: String) async throws {
    guard let url = URL(string: "\(API.baseURL)/users/create") else {
      throw AuthError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode([
      "email": email,
      "password": password,
      "username": username,
    ])

    let (_, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw AuthError.invalidResponse
    }

    switch http.statusCode {
    case 200, 201:
      // Auto sign-in after sign-up
      _ = try await signIn(login: email, password: password)
    case 409:
      throw AuthError.alreadyExists
    default:
      throw AuthError.invalidCredentials
    }
  }

  // MARK: - Check Email Availability
  func checkEmailAvailable(email: String) async throws -> Bool {
    guard let encoded = email.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
      let url = URL(string: "\(API.baseURL)/users/available-email?email=\(encoded)")
    else {
      throw AuthError.invalidURL
    }

    let (_, response) = try await URLSession.shared.data(from: url)

    guard let http = response as? HTTPURLResponse else {
      throw AuthError.invalidResponse
    }

    return http.statusCode == 200
  }

  // MARK: - Check Username Availability
  func checkUsernameAvailable(username: String) async throws -> Bool {
    guard let encoded = username.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
      let url = URL(string: "\(API.baseURL)/users/available-username?username=\(encoded)")
    else {
      throw AuthError.invalidURL
    }

    let (_, response) = try await URLSession.shared.data(from: url)

    guard let http = response as? HTTPURLResponse else {
      throw AuthError.invalidResponse
    }

    return http.statusCode == 200
  }

  // MARK: - Get Current User
  func getCurrentUser() async throws -> User {
    guard let token = UserDefaults.standard.string(forKey: "token"),
      let url = URL(string: "\(API.baseURL)/me")
    else {
      throw AuthError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw AuthError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let wrapper = try decoder.decode(MeResponse.self, from: data)
    return wrapper.user
  }

  // MARK: - Update User
  func updateUser(
    username: String? = nil, avatarUrl: String? = nil, bannerUrl: String? = nil,
    biography: String? = nil
  ) async throws -> User {
    guard let token = UserDefaults.standard.string(forKey: "token"),
      let url = URL(string: "\(API.baseURL)/user")
    else {
      throw AuthError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "PATCH"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    var body: [String: Any] = [:]
    if let username { body["username"] = username }
    if let avatarUrl { body["avatarUrl"] = avatarUrl }
    if let bannerUrl { body["bannerUrl"] = bannerUrl }
    if let biography { body["biography"] = biography }

    request.httpBody = try JSONSerialization.data(withJSONObject: body)

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw AuthError.invalidResponse
    }

    if http.statusCode == 409 {
      throw AuthError.alreadyExists
    }

    guard http.statusCode == 200 else {
      throw AuthError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let wrapper = try decoder.decode(MeResponse.self, from: data)
    return wrapper.user
  }

  // MARK: - Check Username Availability
  func isUsernameAvailable(_ username: String) async throws -> Bool {
    guard
      let url = URL(
        string:
          "\(API.baseURL)/users/available-username?username=\(username.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? username)"
      )
    else {
      throw AuthError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "GET"

    let (_, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw AuthError.invalidResponse
    }

    // 200 = available, 409 = already taken
    return http.statusCode == 200
  }

  // MARK: - Get User Preferences
  func getUserPreferences() async throws -> UserPreferences? {
    // Check cache
    if let cached = preferencesCache,
       Date().timeIntervalSince(cached.timestamp) < cacheDuration {
      return cached.preferences
    }

    guard let token = UserDefaults.standard.string(forKey: "token"),
      let url = URL(string: "\(API.baseURL)/user/preferences")
    else {
      throw AuthError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw AuthError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let wrapper = try decoder.decode(UserPreferencesResponse.self, from: data)

    // Cache result
    preferencesCache = CachedPreferences(preferences: wrapper.userPreferences, timestamp: Date())

    return wrapper.userPreferences
  }

  // MARK: - Update User Preferences
  func updateUserPreferences(watchRegion: String, watchProvidersIds: [Int] = []) async throws {
    guard let token = UserDefaults.standard.string(forKey: "token"),
      let url = URL(string: "\(API.baseURL)/user/preferences")
    else {
      throw AuthError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "PATCH"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let body: [String: Any] = [
      "watchRegion": watchRegion,
      "watchProvidersIds": watchProvidersIds,
    ]

    request.httpBody = try JSONSerialization.data(withJSONObject: body)

    let (_, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw AuthError.invalidResponse
    }

    // Invalidate cache after update
    invalidatePreferencesCache()
  }

  // MARK: - Get User Stats
  func getUserStats(userId: String) async throws -> UserStats {
    guard let url = URL(string: "\(API.baseURL)/user/\(userId)/stats") else {
      throw AuthError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "GET"

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw AuthError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    return try decoder.decode(UserStats.self, from: data)
  }

  // MARK: - Sign Out
  func signOut() {
    AnalyticsService.shared.track(.logout)
    AnalyticsService.shared.reset()
    UserDefaults.standard.removeObject(forKey: "token")
    invalidatePreferencesCache()
    NotificationCenter.default.post(name: .authChanged, object: nil)
  }

  var isAuthenticated: Bool {
    UserDefaults.standard.string(forKey: "token") != nil
  }
}

// MARK: - Models
struct User: Codable {
  let id: String
  let username: String
  let email: String
  let avatarUrl: String?
  let bannerUrl: String?
  let biography: String?
  let createdAt: String
  let subscriptionType: String?

  var avatarImageURL: URL? {
    guard let avatarUrl else { return nil }
    return URL(string: avatarUrl)
  }

  var bannerImageURL: URL? {
    guard let bannerUrl else { return nil }
    return URL(string: bannerUrl)
  }

  var memberSinceDate: Date? {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter.date(from: createdAt)
  }

  var isPro: Bool {
    subscriptionType == "PRO"
  }
}

struct LoginResponse: Codable {
  let token: String
}

struct MeResponse: Codable {
  let user: User
}

struct UserPreferencesResponse: Codable {
  let userPreferences: UserPreferences?
}

struct UserPreferences: Codable {
  let id: String
  let userId: String
  let watchProvidersIds: [Int]?
  let watchRegion: String?
}

struct UserStats: Codable {
  let followersCount: Int
  let followingCount: Int
  let watchedMoviesCount: Int
  let watchedSeriesCount: Int
}

enum AuthError: LocalizedError {
  case invalidURL, invalidResponse, invalidCredentials, alreadyExists

  var errorDescription: String? {
    switch self {
    case .invalidURL: return "Invalid URL"
    case .invalidResponse: return "Invalid response"
    case .invalidCredentials: return "Invalid credentials"
    case .alreadyExists: return "Already exists"
    }
  }
}

extension Notification.Name {
  static let authChanged = Notification.Name("authChanged")
  static let profileUpdated = Notification.Name("profileUpdated")
  static let navigateToSearch = Notification.Name("navigateToSearch")
  static let navigateToProfile = Notification.Name("navigateToProfile")
}
