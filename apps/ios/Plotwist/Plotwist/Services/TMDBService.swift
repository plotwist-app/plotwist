//
//  TMDBService.swift
//  Plotwist
//

import Foundation

class TMDBService {
  static let shared = TMDBService()
  private init() {}

  private let baseURL = "https://api.themoviedb.org/3"
  private let apiKey =
    "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MGYyYjQyNWU1ZmYxYjgwMWVkOWRjY2Y0YmFmYWRkZSIsIm5iZiI6MTYyNjQ3OTE5Ny41MjYsInN1YiI6IjYwZjIxYTVkN2Q1ZGI1MDAyZmM5MTNiMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.HblE_tHKIktjGrwEONxxZFgPGwxNkwKSZEwC24WIrzM"  // TODO: Replace with actual API key

  // MARK: - Search Multi
  func searchMulti(query: String, language: String = "en-US") async throws -> SearchMultiResponse {
    guard !query.isEmpty else {
      return SearchMultiResponse(results: [])
    }

    guard let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
      let url = URL(string: "\(baseURL)/search/multi?query=\(encodedQuery)&language=\(language)")
    else {
      throw TMDBError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw TMDBError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    return try decoder.decode(SearchMultiResponse.self, from: data)
  }

  // MARK: - Popular Movies
  func getPopularMovies(language: String = "en-US") async throws -> [SearchResult] {
    guard let url = URL(string: "\(baseURL)/movie/popular?language=\(language)") else {
      throw TMDBError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw TMDBError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(PopularResponse.self, from: data)
    return result.results.map { $0.toSearchResult(mediaType: "movie") }
  }

  // MARK: - Popular TV Series
  func getPopularTVSeries(language: String = "en-US") async throws -> [SearchResult] {
    guard let url = URL(string: "\(baseURL)/tv/popular?language=\(language)") else {
      throw TMDBError.invalidURL
    }

    var request = URLRequest(url: url)
    request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Accept")

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw TMDBError.invalidResponse
    }

    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    let result = try decoder.decode(PopularResponse.self, from: data)
    return result.results.map { $0.toSearchResult(mediaType: "tv") }
  }
}

// MARK: - Popular Response
struct PopularResponse: Codable {
  let results: [PopularItem]
}

struct PopularItem: Codable {
  let id: Int
  let title: String?
  let name: String?
  let posterPath: String?
  let releaseDate: String?
  let firstAirDate: String?
  let overview: String?
  let voteAverage: Double?

  func toSearchResult(mediaType: String) -> SearchResult {
    SearchResult(
      id: id,
      mediaType: mediaType,
      title: title,
      name: name,
      posterPath: posterPath,
      profilePath: nil,
      releaseDate: releaseDate,
      firstAirDate: firstAirDate,
      overview: overview,
      voteAverage: voteAverage,
      knownForDepartment: nil
    )
  }
}

// MARK: - Response Models
struct SearchMultiResponse: Codable {
  let results: [SearchResult]
}

struct SearchResult: Codable, Identifiable {
  let id: Int
  let mediaType: String?
  let title: String?
  let name: String?
  let posterPath: String?
  let profilePath: String?
  let releaseDate: String?
  let firstAirDate: String?
  let overview: String?
  let voteAverage: Double?
  let knownForDepartment: String?

  var displayTitle: String {
    title ?? name ?? "Unknown"
  }

  var displayDate: String? {
    releaseDate ?? firstAirDate
  }

  var year: String? {
    guard let date = displayDate, date.count >= 4 else { return nil }
    return String(date.prefix(4))
  }

  var imageURL: URL? {
    let path = posterPath ?? profilePath
    guard let path else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w200\(path)")
  }
}

enum TMDBError: LocalizedError {
  case invalidURL, invalidResponse

  var errorDescription: String? {
    switch self {
    case .invalidURL: return "Invalid URL"
    case .invalidResponse: return "Invalid response"
    }
  }
}
