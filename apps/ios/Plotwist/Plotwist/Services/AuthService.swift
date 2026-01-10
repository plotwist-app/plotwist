//
//  AuthService.swift
//  Plotwist
//

import Foundation

class AuthService {
  static let shared = AuthService()
  private init() {}

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

  // MARK: - Sign Out
  func signOut() {
    UserDefaults.standard.removeObject(forKey: "token")
    NotificationCenter.default.post(name: .authChanged, object: nil)
  }

  var isAuthenticated: Bool {
    UserDefaults.standard.string(forKey: "token") != nil
  }
}

struct LoginResponse: Codable {
  let token: String
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
}
