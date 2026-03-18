//
//  RecommendationStore.swift
//  Plotwist
//

import Foundation

struct Recommendation: Codable, Identifiable {
  let id: String
  let fromUserId: String
  let fromUsername: String
  let fromAvatarUrl: String?
  let toUserId: String
  let mediaId: Int
  let mediaType: String
  let mediaTitle: String
  let mediaPosterPath: String?
  let mediaOverview: String?
  let message: String?
  let createdAt: Date

  var posterURL: URL? {
    guard let path = mediaPosterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w342\(path)")
  }
}

class RecommendationStore: ObservableObject {
  static let shared = RecommendationStore()
  private init() { load() }

  @Published var received: [Recommendation] = []
  @Published var sent: [Recommendation] = []

  private let receivedKey = "plotwist_received_recommendations"
  private let sentKey = "plotwist_sent_recommendations"

  var unreadCount: Int { received.count }

  func send(
    toUserId: String,
    mediaId: Int,
    mediaType: String,
    mediaTitle: String,
    mediaPosterPath: String?,
    mediaOverview: String? = nil,
    message: String? = nil
  ) {
    guard let currentUser = CollectionCache.shared.user else { return }

    let trimmedMessage = message?.trimmingCharacters(in: .whitespacesAndNewlines)
    let finalMessage = (trimmedMessage?.isEmpty ?? true) ? nil : trimmedMessage

    let rec = Recommendation(
      id: UUID().uuidString,
      fromUserId: currentUser.id,
      fromUsername: currentUser.displayName ?? currentUser.username,
      fromAvatarUrl: currentUser.avatarUrl,
      toUserId: toUserId,
      mediaId: mediaId,
      mediaType: mediaType,
      mediaTitle: mediaTitle,
      mediaPosterPath: mediaPosterPath,
      mediaOverview: mediaOverview,
      message: finalMessage,
      createdAt: Date()
    )

    sent.append(rec)
    save()
  }

  func accept(_ recommendation: Recommendation) {
    received.removeAll { $0.id == recommendation.id }
    save()
  }

  func decline(_ recommendation: Recommendation) {
    received.removeAll { $0.id == recommendation.id }
    save()
  }

  private func save() {
    let encoder = JSONEncoder()
    if let data = try? encoder.encode(received) {
      UserDefaults.standard.set(data, forKey: receivedKey)
    }
    if let data = try? encoder.encode(sent) {
      UserDefaults.standard.set(data, forKey: sentKey)
    }
  }

  private func load() {
    let decoder = JSONDecoder()
    if let data = UserDefaults.standard.data(forKey: receivedKey),
       let items = try? decoder.decode([Recommendation].self, from: data) {
      received = items
    }
    if let data = UserDefaults.standard.data(forKey: sentKey),
       let items = try? decoder.decode([Recommendation].self, from: data) {
      sent = items
    }
  }
}
