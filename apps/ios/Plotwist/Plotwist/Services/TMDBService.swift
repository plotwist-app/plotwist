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
  func getPopularMovies(language: String = "en-US", page: Int = 1) async throws -> PaginatedResult {
    guard let url = URL(string: "\(baseURL)/movie/popular?language=\(language)&page=\(page)") else {
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
    return PaginatedResult(
      results: result.results.map { $0.toSearchResult(mediaType: "movie") },
      page: result.page,
      totalPages: result.totalPages
    )
  }

  // MARK: - Popular TV Series
  func getPopularTVSeries(language: String = "en-US", page: Int = 1) async throws -> PaginatedResult
  {
    guard let url = URL(string: "\(baseURL)/tv/popular?language=\(language)&page=\(page)") else {
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
    return PaginatedResult(
      results: result.results.map { $0.toSearchResult(mediaType: "tv") },
      page: result.page,
      totalPages: result.totalPages
    )
  }

  // MARK: - Popular Animes (Animation genre from Japan)
  func getPopularAnimes(language: String = "en-US", page: Int = 1) async throws -> PaginatedResult {
    // Genre 16 = Animation, origin_country = JP
    guard let url = URL(
      string:
        "\(baseURL)/discover/tv?language=\(language)&sort_by=popularity.desc&with_genres=16&with_origin_country=JP&page=\(page)"
    ) else {
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
    return PaginatedResult(
      results: result.results.map { $0.toSearchResult(mediaType: "tv") },
      page: result.page,
      totalPages: result.totalPages
    )
  }

  // MARK: - Popular Doramas (Korean dramas)
  func getPopularDoramas(language: String = "en-US", page: Int = 1) async throws -> PaginatedResult {
    // origin_country = KR (Korean dramas)
    guard let url = URL(
      string:
        "\(baseURL)/discover/tv?language=\(language)&sort_by=popularity.desc&with_origin_country=KR&page=\(page)"
    ) else {
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
    return PaginatedResult(
      results: result.results.map { $0.toSearchResult(mediaType: "tv") },
      page: result.page,
      totalPages: result.totalPages
    )
  }

  // MARK: - Movie Details
  func getMovieDetails(id: Int, language: String = "en-US") async throws -> MovieDetails {
    guard let url = URL(string: "\(baseURL)/movie/\(id)?language=\(language)") else {
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
    return try decoder.decode(MovieDetails.self, from: data)
  }

  // MARK: - TV Series Details
  func getTVSeriesDetails(id: Int, language: String = "en-US") async throws -> MovieDetails {
    guard let url = URL(string: "\(baseURL)/tv/\(id)?language=\(language)") else {
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
    return try decoder.decode(MovieDetails.self, from: data)
  }
}

// MARK: - Movie Details Model
struct MovieDetails: Codable, Identifiable {
  let id: Int
  let title: String?
  let name: String?
  let overview: String?
  let posterPath: String?
  let backdropPath: String?
  let releaseDate: String?
  let firstAirDate: String?
  let voteAverage: Double?
  let runtime: Int?
  let genres: [Genre]?

  var displayTitle: String {
    title ?? name ?? "Unknown"
  }

  var year: String? {
    let date = releaseDate ?? firstAirDate
    guard let date, date.count >= 4 else { return nil }
    return String(date.prefix(4))
  }

  func formattedReleaseDate(locale: String) -> String? {
    let dateString = releaseDate ?? firstAirDate
    guard let dateString else { return nil }

    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    guard let date = formatter.date(from: dateString) else { return nil }

    let outputFormatter = DateFormatter()
    outputFormatter.dateStyle = .long
    outputFormatter.locale = Locale(identifier: locale.replacingOccurrences(of: "-", with: "_"))
    return outputFormatter.string(from: date)
  }

  var posterURL: URL? {
    guard let posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w500\(posterPath)")
  }

  var backdropURL: URL? {
    guard let backdropPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w1280\(backdropPath)")
  }
}

struct Genre: Codable, Identifiable {
  let id: Int
  let name: String
}

// MARK: - Paginated Result
struct PaginatedResult {
  let results: [SearchResult]
  let page: Int
  let totalPages: Int

  var hasMorePages: Bool {
    page < totalPages
  }
}

// MARK: - Popular Response
struct PopularResponse: Codable {
  let results: [PopularItem]
  let page: Int
  let totalPages: Int
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
