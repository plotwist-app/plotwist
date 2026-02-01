//
//  AnalyticsService.swift
//  Plotwist
//

import Foundation

// MARK: - Analytics Events
enum AnalyticsEvent {
  // Auth
  case signUp(method: String)  // "apple", "email"
  case login(method: String)
  case logout
  
  // App Lifecycle
  case appOpened
  
  // Screens
  case screenView(name: String)
  
  // Content Discovery
  case searchPerformed(query: String, resultsCount: Int)
  case mediaViewed(tmdbId: Int, mediaType: String, title: String)
  case categoryViewed(category: String, subcategory: String)
  
  // Core Actions (Key Retention Events)
  case mediaStatusChanged(tmdbId: Int, mediaType: String, status: String)
  case mediaStatusRemoved(tmdbId: Int, mediaType: String)
  case rewatchAdded(tmdbId: Int, mediaType: String, count: Int)
  case episodeWatched(tmdbId: Int, season: Int, episode: Int)
  
  // Reviews
  case reviewStarted(tmdbId: Int, mediaType: String)
  case reviewSubmitted(tmdbId: Int, mediaType: String, rating: Double, hasText: Bool)
  case reviewDeleted(tmdbId: Int, mediaType: String)
  
  // Engagement
  case shareContent(tmdbId: Int, mediaType: String)
  case profileViewed(userId: String, isOwnProfile: Bool)
  
  var name: String {
    switch self {
    case .signUp: return "sign_up"
    case .login: return "login"
    case .logout: return "logout"
    case .appOpened: return "app_opened"
    case .screenView: return "screen_view"
    case .searchPerformed: return "search"
    case .mediaViewed: return "media_viewed"
    case .categoryViewed: return "category_viewed"
    case .mediaStatusChanged: return "status_changed"
    case .mediaStatusRemoved: return "status_removed"
    case .rewatchAdded: return "rewatch_added"
    case .episodeWatched: return "episode_watched"
    case .reviewStarted: return "review_started"
    case .reviewSubmitted: return "review_submitted"
    case .reviewDeleted: return "review_deleted"
    case .shareContent: return "share"
    case .profileViewed: return "profile_viewed"
    }
  }
  
  var properties: [String: Any] {
    switch self {
    case .signUp(let method), .login(let method):
      return ["method": method]
    case .logout, .appOpened:
      return [:]
    case .screenView(let name):
      return ["screen_name": name]
    case .searchPerformed(let query, let resultsCount):
      return ["query": query, "results_count": resultsCount]
    case .mediaViewed(let tmdbId, let mediaType, let title):
      return ["tmdb_id": tmdbId, "media_type": mediaType, "title": title]
    case .categoryViewed(let category, let subcategory):
      return ["category": category, "subcategory": subcategory]
    case .mediaStatusChanged(let tmdbId, let mediaType, let status):
      return ["tmdb_id": tmdbId, "media_type": mediaType, "status": status]
    case .mediaStatusRemoved(let tmdbId, let mediaType):
      return ["tmdb_id": tmdbId, "media_type": mediaType]
    case .rewatchAdded(let tmdbId, let mediaType, let count):
      return ["tmdb_id": tmdbId, "media_type": mediaType, "rewatch_count": count]
    case .episodeWatched(let tmdbId, let season, let episode):
      return ["tmdb_id": tmdbId, "season": season, "episode": episode]
    case .reviewStarted(let tmdbId, let mediaType):
      return ["tmdb_id": tmdbId, "media_type": mediaType]
    case .reviewSubmitted(let tmdbId, let mediaType, let rating, let hasText):
      return ["tmdb_id": tmdbId, "media_type": mediaType, "rating": rating, "has_text": hasText]
    case .reviewDeleted(let tmdbId, let mediaType):
      return ["tmdb_id": tmdbId, "media_type": mediaType]
    case .shareContent(let tmdbId, let mediaType):
      return ["tmdb_id": tmdbId, "media_type": mediaType]
    case .profileViewed(let userId, let isOwnProfile):
      return ["user_id": userId, "is_own_profile": isOwnProfile]
    }
  }
}

// MARK: - Analytics Service
class AnalyticsService {
  static let shared = AnalyticsService()
  
  private let apiKey: String? = "phc_jb6woqg2i2Xo5MYzSR14mDj6tsFoMQzjhLPvZ28iH1T"
  private let host = "https://app.posthog.com"  // Or your self-hosted instance
  
  private var distinctId: String {
    // Use user ID if logged in, otherwise device ID
    if let userId = UserDefaults.standard.string(forKey: "analyticsUserId") {
      return userId
    }
    
    // Generate or retrieve device ID
    if let deviceId = UserDefaults.standard.string(forKey: "analyticsDeviceId") {
      return deviceId
    }
    
    let newDeviceId = UUID().uuidString
    UserDefaults.standard.set(newDeviceId, forKey: "analyticsDeviceId")
    return newDeviceId
  }
  
  private init() {}
  
  // MARK: - Public Methods
  
  /// Track an analytics event
  func track(_ event: AnalyticsEvent) {
    #if DEBUG
    print("📊 Analytics: \(event.name) - \(event.properties)")
    #endif
    
    sendEvent(name: event.name, properties: event.properties)
  }
  
  /// Identify user after login/signup
  func identify(userId: String, properties: [String: Any] = [:]) {
    UserDefaults.standard.set(userId, forKey: "analyticsUserId")
    
    #if DEBUG
    print("📊 Analytics: Identified user \(userId)")
    #endif
    
    sendIdentify(userId: userId, properties: properties)
  }
  
  /// Reset user on logout
  func reset() {
    UserDefaults.standard.removeObject(forKey: "analyticsUserId")
    
    #if DEBUG
    print("📊 Analytics: Reset user")
    #endif
  }
  
  // MARK: - Private Methods
  
  private func sendEvent(name: String, properties: [String: Any]) {
    guard let apiKey = apiKey, !apiKey.isEmpty else {
      // Analytics not configured, skip
      return
    }
    
    Task {
      await sendToPostHog(type: "capture", payload: [
        "event": name,
        "properties": properties,
        "distinct_id": distinctId,
        "timestamp": ISO8601DateFormatter().string(from: Date()),
      ])
    }
  }
  
  private func sendIdentify(userId: String, properties: [String: Any]) {
    guard let apiKey = apiKey, !apiKey.isEmpty else {
      return
    }
    
    Task {
      await sendToPostHog(type: "identify", payload: [
        "distinct_id": userId,
        "$set": properties,
        "timestamp": ISO8601DateFormatter().string(from: Date()),
      ])
    }
  }
  
  private func sendToPostHog(type: String, payload: [String: Any]) async {
    guard let apiKey = apiKey,
          let url = URL(string: "\(host)/\(type)/")
    else { return }
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    var body = payload
    body["api_key"] = apiKey
    
    do {
      request.httpBody = try JSONSerialization.data(withJSONObject: body)
      _ = try await URLSession.shared.data(for: request)
    } catch {
      #if DEBUG
      print("📊 Analytics error: \(error)")
      #endif
    }
  }
}

// MARK: - SwiftUI View Extension
import SwiftUI

extension View {
  /// Track screen view when view appears
  func trackScreen(_ name: String) -> some View {
    self.onAppear {
      AnalyticsService.shared.track(.screenView(name: name))
    }
  }
}
