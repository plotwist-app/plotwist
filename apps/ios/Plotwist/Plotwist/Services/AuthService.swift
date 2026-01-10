//
//  AuthService.swift
//  Plotwist
//

import Foundation

class AuthService {
    static let shared = AuthService()
    private init() {}
    
    func signIn(login: String, password: String) async throws -> String {
        guard let url = URL(string: "\(API.baseURL)/auth/login") else {
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
    case invalidURL, invalidResponse, invalidCredentials
    
    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .invalidResponse: return "Invalid response"
        case .invalidCredentials: return "Invalid credentials"
        }
    }
}

extension Notification.Name {
    static let authChanged = Notification.Name("authChanged")
}
