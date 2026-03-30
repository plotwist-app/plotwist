//
//  RecommendationStore.swift
//  Plotwist
//

import Foundation

struct Recommendation: Codable, Identifiable {
  let id: String
  let fromUserId: String
  let fromUsername: String?
  let fromDisplayName: String?
  let fromAvatarUrl: String?
  let toUserId: String
  let tmdbId: Int
  let mediaType: String
  let mediaTitle: String?
  let mediaPosterPath: String?
  let mediaOverview: String?
  let message: String?
  let status: String?
  let createdAt: Date

  var displayName: String {
    fromDisplayName ?? fromUsername ?? "User"
  }

  var posterURL: URL? {
    guard let path = mediaPosterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w342\(path)")
  }

  var mediaId: Int { tmdbId }
}

private struct RecommendationsResponse: Codable {
  let recommendations: [Recommendation]
}

class RecommendationStore: ObservableObject {
  static let shared = RecommendationStore()
  private init() {}

  @Published var received: [Recommendation] = []

  var unreadCount: Int { received.count }

  private static var decoder: JSONDecoder {
    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    decoder.dateDecodingStrategy = .custom { decoder in
      let container = try decoder.singleValueContainer()
      let string = try container.decode(String.self)
      if let date = formatter.date(from: string) { return date }
      let fallback = ISO8601DateFormatter()
      fallback.formatOptions = [.withInternetDateTime]
      if let date = fallback.date(from: string) { return date }
      throw DecodingError.dataCorruptedError(
        in: container,
        debugDescription: "Cannot decode date: \(string)"
      )
    }
    return decoder
  }

  func fetchReceived() async {
    guard let token = UserDefaults.standard.string(forKey: "token") else { return }

    let language = Language.current.rawValue
    guard var components = URLComponents(string: "\(API.baseURL)/recommendations") else { return }
    components.queryItems = [URLQueryItem(name: "language", value: language)]
    guard let url = components.url else { return }

    var request = URLRequest(url: url)
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    do {
      let (data, response) = try await URLSession.shared.data(for: request)
      guard let http = response as? HTTPURLResponse, http.statusCode == 200 else { return }
      let result = try Self.decoder.decode(RecommendationsResponse.self, from: data)
      await MainActor.run {
        self.received = result.recommendations
      }
    } catch {
      print("[RecommendationStore] fetchReceived error: \(error)")
    }
  }

  func send(
    toUserId: String,
    mediaId: Int,
    mediaType: String,
    mediaTitle: String,
    mediaPosterPath: String?,
    mediaOverview: String? = nil,
    message: String? = nil
  ) {
    guard let token = UserDefaults.standard.string(forKey: "token"),
          let url = URL(string: "\(API.baseURL)/recommendations") else { return }

    let trimmedMessage = message?.trimmingCharacters(in: .whitespacesAndNewlines)
    let finalMessage = (trimmedMessage?.isEmpty ?? true) ? nil : trimmedMessage

    let apiMediaType = mediaType == "movie" ? "MOVIE" : (mediaType == "tv" ? "TV_SHOW" : mediaType)

    let body: [String: Any?] = [
      "toUserId": toUserId,
      "tmdbId": mediaId,
      "mediaType": apiMediaType,
      "message": finalMessage,
    ]

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try? JSONSerialization.data(
      withJSONObject: body.compactMapValues { $0 }
    )

    Task {
      do {
        let (_, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200...201).contains(http.statusCode) else {
          let code = (response as? HTTPURLResponse)?.statusCode ?? -1
          print("[RecommendationStore] send failed: \(code)")
          return
        }
      } catch {
        print("[RecommendationStore] send error: \(error)")
      }
    }
  }

  func accept(_ recommendation: Recommendation) {
    received.removeAll { $0.id == recommendation.id }
    respondToRecommendation(id: recommendation.id, status: "ACCEPTED")
  }

  func decline(_ recommendation: Recommendation) {
    received.removeAll { $0.id == recommendation.id }
    respondToRecommendation(id: recommendation.id, status: "DECLINED")
  }

  private func respondToRecommendation(id: String, status: String) {
    guard let token = UserDefaults.standard.string(forKey: "token"),
          let url = URL(string: "\(API.baseURL)/recommendations/\(id)") else { return }

    var request = URLRequest(url: url)
    request.httpMethod = "PUT"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try? JSONSerialization.data(
      withJSONObject: ["status": status]
    )

    Task {
      do {
        let (_, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
          let code = (response as? HTTPURLResponse)?.statusCode ?? -1
          print("[RecommendationStore] respond failed: \(code)")
          return
        }
      } catch {
        print("[RecommendationStore] respond error: \(error)")
      }
    }
  }
}
