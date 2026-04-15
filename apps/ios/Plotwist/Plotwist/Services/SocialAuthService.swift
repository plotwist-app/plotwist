//
//  SocialAuthService.swift
//  Plotwist
//

import AuthenticationServices
import CryptoKit
import Foundation

// MARK: - Social Auth Response
struct SocialAuthResponse: Codable {
  let token: String
  let isNewUser: Bool
  let needsUsername: Bool
}

// MARK: - Apple Auth Request Body
struct AppleAuthRequest: Codable {
  let identityToken: String
  let authorizationCode: String
  let email: String?
  let fullName: AppleFullName?
}

struct AppleFullName: Codable {
  let givenName: String?
  let familyName: String?
}

// MARK: - Google Auth Request Body
struct GoogleAuthRequest: Codable {
  let idToken: String
}

// MARK: - Social Auth Errors
enum SocialAuthError: LocalizedError {
  case invalidURL
  case invalidResponse
  case authenticationFailed
  case tokenNotFound
  case cancelled
  case unknown(String)

  var errorDescription: String? {
    switch self {
    case .invalidURL: return "Invalid URL"
    case .invalidResponse: return "Invalid response from server"
    case .authenticationFailed: return "Authentication failed"
    case .tokenNotFound: return "Token not found"
    case .cancelled: return "Authentication was cancelled"
    case .unknown(let message): return message
    }
  }
}

// MARK: - Apple Sign In Delegate
class AppleSignInDelegate: NSObject, ASAuthorizationControllerDelegate,
  ASAuthorizationControllerPresentationContextProviding
{
  private var continuation: CheckedContinuation<ASAuthorization, Error>?
  private var currentController: ASAuthorizationController?

  @MainActor
  func signIn() async throws -> ASAuthorization {
    return try await withCheckedThrowingContinuation { continuation in
      self.continuation = continuation

      let provider = ASAuthorizationAppleIDProvider()
      let request = provider.createRequest()
      request.requestedScopes = [.email, .fullName]

      let controller = ASAuthorizationController(authorizationRequests: [request])
      controller.delegate = self
      controller.presentationContextProvider = self
      self.currentController = controller
      controller.performRequests()
    }
  }

  func authorizationController(
    controller: ASAuthorizationController,
    didCompleteWithAuthorization authorization: ASAuthorization
  ) {
    currentController = nil
    continuation?.resume(returning: authorization)
    continuation = nil
  }

  func authorizationController(
    controller: ASAuthorizationController,
    didCompleteWithError error: Error
  ) {
    currentController = nil
    // Map Apple's cancellation error to our SocialAuthError.cancelled
    if let authError = error as? ASAuthorizationError,
      authError.code == .canceled
    {
      continuation?.resume(throwing: SocialAuthError.cancelled)
    } else {
      continuation?.resume(throwing: error)
    }
    continuation = nil
  }

  func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
    guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
      let window = scene.windows.first(where: { $0.isKeyWindow }) ?? scene.windows.first
    else {
      return UIWindow()
    }
    return window
  }
}

// MARK: - Social Auth Service
class SocialAuthService {
  static let shared = SocialAuthService()
  private init() {}

  private let appleDelegate = AppleSignInDelegate()

  // MARK: - Sign in with Apple
  func signInWithApple() async throws -> SocialAuthResponse {
    let authorization = try await appleDelegate.signIn()

    guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential
    else {
      throw SocialAuthError.authenticationFailed
    }

    guard let identityTokenData = appleIDCredential.identityToken,
      let identityToken = String(data: identityTokenData, encoding: .utf8)
    else {
      throw SocialAuthError.tokenNotFound
    }

    guard let authorizationCodeData = appleIDCredential.authorizationCode,
      let authorizationCode = String(data: authorizationCodeData, encoding: .utf8)
    else {
      throw SocialAuthError.tokenNotFound
    }

    // Build request body
    let fullName: AppleFullName?
    if let nameComponents = appleIDCredential.fullName {
      fullName = AppleFullName(
        givenName: nameComponents.givenName,
        familyName: nameComponents.familyName
      )
    } else {
      fullName = nil
    }

    let requestBody = AppleAuthRequest(
      identityToken: identityToken,
      authorizationCode: authorizationCode,
      email: appleIDCredential.email,
      fullName: fullName
    )

    // Send to backend
    return try await authenticateWithBackend(
      endpoint: "/auth/apple",
      body: requestBody
    )
  }

  // MARK: - Sign in with Google
  func signInWithGoogle(idToken: String) async throws -> SocialAuthResponse {
    let requestBody = GoogleAuthRequest(idToken: idToken)

    return try await authenticateWithBackend(
      endpoint: "/auth/google",
      body: requestBody
    )
  }

  // MARK: - Backend Authentication
  private func authenticateWithBackend<T: Encodable>(
    endpoint: String,
    body: T
  ) async throws -> SocialAuthResponse {
    guard let url = URL(string: "\(API.baseURL)\(endpoint)") else {
      throw SocialAuthError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(body)

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse else {
      throw SocialAuthError.invalidResponse
    }

    guard http.statusCode == 200 else {
      if let errorResponse = try? JSONDecoder().decode([String: String].self, from: data),
        let message = errorResponse["message"]
      {
        throw SocialAuthError.unknown(message)
      }
      throw SocialAuthError.authenticationFailed
    }

    let authResponse = try JSONDecoder().decode(SocialAuthResponse.self, from: data)

    // Save token to UserDefaults
    UserDefaults.standard.set(authResponse.token, forKey: "token")
    
    // Identify user for analytics
    Task {
      if let user = try? await AuthService.shared.getCurrentUser() {
        AnalyticsService.shared.identify(userId: user.id, properties: [
          "username": user.username,
          "subscription_type": user.subscriptionType ?? "MEMBER"
        ])
      }
    }

    return authResponse
  }
}
