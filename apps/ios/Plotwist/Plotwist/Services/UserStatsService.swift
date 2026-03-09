//
//  UserStatsService.swift
//  Plotwist
//

import Foundation

class UserStatsService {
  static let shared = UserStatsService()
  private init() {}

  private func buildURL(base: String, queryItems: [URLQueryItem]) -> URL? {
    var components = URLComponents(string: base)
    let filtered = queryItems.filter { $0.value != nil }
    if !filtered.isEmpty {
      components?.queryItems = filtered
    }
    return components?.url
  }

  // MARK: - Get User Stats (followers, following, watched counts)
  func getUserStats(userId: String) async throws -> UserStats {
    guard let url = URL(string: "\(API.baseURL)/user/\(userId)/stats") else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      AnalyticsService.trackAPIError(endpoint: "/user/stats", statusCode: code)
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    return try decoder.decode(UserStats.self, from: data)
  }

  // MARK: - Get Total Hours Watched
  func getTotalHours(userId: String, period: String = "all") async throws -> TotalHoursResponse {
    guard let url = buildURL(
      base: "\(API.baseURL)/user/\(userId)/total-hours",
      queryItems: [URLQueryItem(name: "period", value: period)]
    ) else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      AnalyticsService.trackAPIError(endpoint: "/user/total-hours", statusCode: code)
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    return try decoder.decode(TotalHoursResponse.self, from: data)
  }

  // MARK: - Get Watched Genres
  func getWatchedGenres(userId: String, language: String = "en-US", period: String = "all") async throws -> [WatchedGenre] {
    guard let url = buildURL(
      base: "\(API.baseURL)/user/\(userId)/watched-genres",
      queryItems: [
        URLQueryItem(name: "language", value: language),
        URLQueryItem(name: "period", value: period),
      ]
    ) else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(WatchedGenresResponse.self, from: data)
    return result.genres
  }

  // MARK: - Get Items Status Distribution
  func getItemsStatus(userId: String, period: String = "all") async throws -> [ItemStatusStat] {
    guard let url = buildURL(
      base: "\(API.baseURL)/user/\(userId)/items-status",
      queryItems: [URLQueryItem(name: "period", value: period)]
    ) else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(ItemsStatusResponse.self, from: data)
    return result.userItems
  }

  // MARK: - Get Best Reviews
  func getBestReviews(userId: String, language: String = "en-US", limit: Int = 50, period: String = "all") async throws -> [BestReview] {
    guard let url = buildURL(
      base: "\(API.baseURL)/user/\(userId)/best-reviews",
      queryItems: [
        URLQueryItem(name: "language", value: language),
        URLQueryItem(name: "limit", value: "\(limit)"),
        URLQueryItem(name: "period", value: period),
      ]
    ) else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(BestReviewsResponse.self, from: data)
    return result.bestReviews
  }

  // MARK: - Get Stats Timeline (Paginated)
  func getStatsTimeline(userId: String, language: String = "en-US", cursor: String? = nil, pageSize: Int = 3) async throws -> StatsTimelineResponse {
    var queryItems = [
      URLQueryItem(name: "language", value: language),
      URLQueryItem(name: "pageSize", value: "\(pageSize)"),
    ]
    if let cursor {
      queryItems.append(URLQueryItem(name: "cursor", value: cursor))
    }

    guard let url = buildURL(
      base: "\(API.baseURL)/user/\(userId)/stats-timeline",
      queryItems: queryItems
    ) else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      AnalyticsService.trackAPIError(endpoint: "/user/stats-timeline", statusCode: code)
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    return try decoder.decode(StatsTimelineResponse.self, from: data)
  }

  // MARK: - Get Watched Cast
  func getWatchedCast(userId: String, period: String = "all") async throws -> [WatchedCastMember] {
    guard let url = buildURL(
      base: "\(API.baseURL)/user/\(userId)/watched-cast",
      queryItems: [URLQueryItem(name: "period", value: period)]
    ) else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      AnalyticsService.trackAPIError(endpoint: "/user/watched-cast", statusCode: code)
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(WatchedCastResponse.self, from: data)
    return result.watchedCast
  }

  // MARK: - Get Watched Countries
  func getWatchedCountries(userId: String, language: String = "en-US", period: String = "all") async throws -> [WatchedCountry] {
    guard let url = buildURL(
      base: "\(API.baseURL)/user/\(userId)/watched-countries",
      queryItems: [
        URLQueryItem(name: "language", value: language),
        URLQueryItem(name: "period", value: period),
      ]
    ) else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      AnalyticsService.trackAPIError(endpoint: "/user/watched-countries", statusCode: code)
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(WatchedCountriesResponse.self, from: data)
    return result.watchedCountries
  }

  // MARK: - Get Most Watched Series
  func getMostWatchedSeries(userId: String, language: String = "en-US", period: String = "all") async throws -> [MostWatchedSeries] {
    guard let url = buildURL(
      base: "\(API.baseURL)/user/\(userId)/most-watched-series",
      queryItems: [
        URLQueryItem(name: "language", value: language),
        URLQueryItem(name: "period", value: period),
      ]
    ) else {
      throw UserStatsError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      let code = (response as? HTTPURLResponse)?.statusCode ?? -1
      AnalyticsService.trackAPIError(endpoint: "/user/most-watched-series", statusCode: code)
      throw UserStatsError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(MostWatchedSeriesResponse.self, from: data)
    return result.mostWatchedSeries
  }
}

// MARK: - Models
// Note: UserStats is defined in AuthService.swift

struct MonthlyHoursEntry: Codable, Identifiable {
  let month: String
  let hours: Double
  
  var id: String { month }
}

struct PeakTimeSlot: Codable {
  let slot: String
  let hour: Int
  let count: Int
}

struct DailyActivityEntry: Codable, Identifiable {
  let day: String
  let hours: Double

  var id: String { day }
}

struct HourlyEntry: Codable, Identifiable {
  let hour: Int
  let count: Int

  var id: Int { hour }
}

struct TotalHoursResponse: Codable {
  let totalHours: Double
  let movieHours: Double
  let seriesHours: Double
  let monthlyHours: [MonthlyHoursEntry]
  let peakTimeSlot: PeakTimeSlot?
  let hourlyDistribution: [HourlyEntry]?
  let dailyActivity: [DailyActivityEntry]?
  let percentileRank: Int?
}

struct GenreItem: Codable, Identifiable, Hashable {
  let tmdbId: Int
  let mediaType: String
  let posterPath: String?

  var id: Int { tmdbId }

  var posterURL: URL? {
    guard let posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w342\(posterPath)")
  }
}

struct WatchedGenre: Codable, Identifiable {
  let name: String
  let count: Int
  let percentage: Double
  let posterPath: String?
  let posterPaths: [String]?
  let items: [GenreItem]?

  var id: String { name }

  var posterURL: URL? {
    guard let posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w342\(posterPath)")
  }

  var posterURLs: [URL] {
    if let items, !items.isEmpty {
      return items.compactMap { $0.posterURL }
    }
    return (posterPaths ?? (posterPath.map { [$0] } ?? []))
      .compactMap { URL(string: "https://image.tmdb.org/t/p/w342\($0)") }
  }

  var genreItems: [GenreItem] {
    items ?? []
  }
}

struct WatchedGenresResponse: Codable {
  let genres: [WatchedGenre]
}

struct ItemStatusStat: Codable, Identifiable {
  let status: String
  let count: Int
  let percentage: Double

  var id: String { status }
}

struct ItemsStatusResponse: Codable {
  let userItems: [ItemStatusStat]
}

struct BestReview: Codable, Identifiable {
  let id: String
  let userId: String
  let tmdbId: Int
  let mediaType: String
  let review: String
  let rating: Double
  let hasSpoilers: Bool
  let seasonNumber: Int?
  let episodeNumber: Int?
  let language: String?
  let createdAt: String
  let title: String
  let posterPath: String?
  let date: String?
  
  var posterURL: URL? {
    guard let posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w342\(posterPath)")
  }
}

struct BestReviewsResponse: Codable {
  let bestReviews: [BestReview]
}

// MARK: - Watched Cast Models

struct WatchedCastMember: Codable, Identifiable {
  let id: String
  let name: String
  let count: Int
  let percentage: Double
  let profilePath: String?
  
  var profileURL: URL? {
    guard let profilePath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w185\(profilePath)")
  }
}

struct WatchedCastResponse: Codable {
  let watchedCast: [WatchedCastMember]
}

// MARK: - Watched Countries Models

struct WatchedCountry: Codable, Identifiable {
  let name: String
  let count: Int
  let percentage: Double
  
  var id: String { name }
}

struct WatchedCountriesResponse: Codable {
  let watchedCountries: [WatchedCountry]
}

// MARK: - Most Watched Series Models

struct MostWatchedSeries: Codable, Identifiable {
  let id: Int
  let episodes: Int
  let title: String
  let posterPath: String?
  let backdropPath: String?
  
  var posterURL: URL? {
    guard let posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w342\(posterPath)")
  }
}

struct MostWatchedSeriesResponse: Codable {
  let mostWatchedSeries: [MostWatchedSeries]
}

// MARK: - Stats Timeline Models

struct TimelineGenreSummary: Codable {
  let name: String
  let posterPath: String?

  var posterURL: URL? {
    guard let posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w342\(posterPath)")
  }
}

struct TimelineReviewSummary: Codable {
  let title: String
  let posterPath: String?
  let rating: Double

  var posterURL: URL? {
    guard let posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w342\(posterPath)")
  }
}

struct TimelineSection: Codable {
  let yearMonth: String
  let totalHours: Double
  let movieHours: Double
  let seriesHours: Double
  let topGenre: TimelineGenreSummary?
  let topReview: TimelineReviewSummary?
}

struct StatsTimelineResponse: Codable {
  let sections: [TimelineSection]
  let nextCursor: String?
  let hasMore: Bool
}

enum UserStatsError: LocalizedError {
  case invalidURL
  case invalidResponse

  var errorDescription: String? {
    switch self {
    case .invalidURL: return "Invalid URL"
    case .invalidResponse: return "Invalid response from server"
    }
  }
}
