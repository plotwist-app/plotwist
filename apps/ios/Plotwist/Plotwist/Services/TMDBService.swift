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

  // MARK: - Now Playing Movies
  func getNowPlayingMovies(language: String = "en-US", page: Int = 1) async throws
    -> PaginatedResult
  {
    guard let url = URL(string: "\(baseURL)/movie/now_playing?language=\(language)&page=\(page)")
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
    let result = try decoder.decode(PopularResponse.self, from: data)
    return PaginatedResult(
      results: result.results.map { $0.toSearchResult(mediaType: "movie") },
      page: result.page,
      totalPages: result.totalPages
    )
  }

  // MARK: - Top Rated Movies
  func getTopRatedMovies(language: String = "en-US", page: Int = 1) async throws -> PaginatedResult
  {
    guard let url = URL(string: "\(baseURL)/movie/top_rated?language=\(language)&page=\(page)")
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
    let result = try decoder.decode(PopularResponse.self, from: data)
    return PaginatedResult(
      results: result.results.map { $0.toSearchResult(mediaType: "movie") },
      page: result.page,
      totalPages: result.totalPages
    )
  }

  // MARK: - Upcoming Movies
  func getUpcomingMovies(language: String = "en-US", page: Int = 1) async throws -> PaginatedResult
  {
    guard let url = URL(string: "\(baseURL)/movie/upcoming?language=\(language)&page=\(page)")
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

  // MARK: - Airing Today TV Series
  func getAiringTodayTVSeries(language: String = "en-US", page: Int = 1) async throws
    -> PaginatedResult
  {
    guard let url = URL(string: "\(baseURL)/tv/airing_today?language=\(language)&page=\(page)")
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
    let result = try decoder.decode(PopularResponse.self, from: data)
    return PaginatedResult(
      results: result.results.map { $0.toSearchResult(mediaType: "tv") },
      page: result.page,
      totalPages: result.totalPages
    )
  }

  // MARK: - On The Air TV Series
  func getOnTheAirTVSeries(language: String = "en-US", page: Int = 1) async throws
    -> PaginatedResult
  {
    guard let url = URL(string: "\(baseURL)/tv/on_the_air?language=\(language)&page=\(page)")
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
    let result = try decoder.decode(PopularResponse.self, from: data)
    return PaginatedResult(
      results: result.results.map { $0.toSearchResult(mediaType: "tv") },
      page: result.page,
      totalPages: result.totalPages
    )
  }

  // MARK: - Top Rated TV Series
  func getTopRatedTVSeries(language: String = "en-US", page: Int = 1) async throws
    -> PaginatedResult
  {
    guard let url = URL(string: "\(baseURL)/tv/top_rated?language=\(language)&page=\(page)")
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
    let result = try decoder.decode(PopularResponse.self, from: data)
    return PaginatedResult(
      results: result.results.map { $0.toSearchResult(mediaType: "tv") },
      page: result.page,
      totalPages: result.totalPages
    )
  }

  // MARK: - Popular Animes TV (Animation genre from Japan)
  func getPopularAnimes(language: String = "en-US", page: Int = 1) async throws -> PaginatedResult {
    // Genre 16 = Animation, origin_country = JP
    guard
      let url = URL(
        string:
          "\(baseURL)/discover/tv?language=\(language)&sort_by=popularity.desc&with_genres=16&with_origin_country=JP&page=\(page)"
      )
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
    let result = try decoder.decode(PopularResponse.self, from: data)
    return PaginatedResult(
      results: result.results.map { $0.toSearchResult(mediaType: "tv") },
      page: result.page,
      totalPages: result.totalPages
    )
  }

  // MARK: - Popular Anime Movies (Animation genre from Japan)
  func getPopularAnimeMovies(language: String = "en-US", page: Int = 1) async throws
    -> PaginatedResult
  {
    // Genre 16 = Animation, origin_country = JP
    guard
      let url = URL(
        string:
          "\(baseURL)/discover/movie?language=\(language)&sort_by=popularity.desc&with_genres=16&with_origin_country=JP&page=\(page)"
      )
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
    let result = try decoder.decode(PopularResponse.self, from: data)
    return PaginatedResult(
      results: result.results.map { $0.toSearchResult(mediaType: "movie") },
      page: result.page,
      totalPages: result.totalPages
    )
  }

  // MARK: - Popular Doramas (Korean dramas)
  func getPopularDoramas(language: String = "en-US", page: Int = 1) async throws -> PaginatedResult
  {
    // origin_country = KR (Korean dramas)
    guard
      let url = URL(
        string:
          "\(baseURL)/discover/tv?language=\(language)&sort_by=popularity.desc&with_origin_country=KR&page=\(page)"
      )
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

  // MARK: - Get Images
  func getImages(id: Int, mediaType: String) async throws -> MediaImages {
    let type = mediaType == "movie" ? "movie" : "tv"
    guard let url = URL(string: "\(baseURL)/\(type)/\(id)/images") else {
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
    return try decoder.decode(MediaImages.self, from: data)
  }

  // MARK: - Get Watch Providers
  func getWatchProviders(id: Int, mediaType: String) async throws -> WatchProvidersResponse {
    let type = mediaType == "movie" ? "movie" : "tv"
    guard let url = URL(string: "\(baseURL)/\(type)/\(id)/watch/providers") else {
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
    return try decoder.decode(WatchProvidersResponse.self, from: data)
  }

  // MARK: - Get Related Content (Recommendations)
  func getRelatedContent(
    id: Int, mediaType: String, variant: String = "recommendations", language: String = "en-US"
  ) async throws -> [SearchResult] {
    let type = mediaType == "movie" ? "movie" : "tv"
    guard let url = URL(string: "\(baseURL)/\(type)/\(id)/\(variant)?language=\(language)") else {
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
    return result.results.map { $0.toSearchResult(mediaType: mediaType) }
  }

  // MARK: - Get Available Regions
  func getAvailableRegions(language: String = "en-US") async throws -> [WatchRegion] {
    guard let url = URL(string: "\(baseURL)/watch/providers/regions?language=\(language)") else {
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
    let result = try decoder.decode(WatchRegionsResponse.self, from: data)
    return result.results.sorted { $0.englishName < $1.englishName }
  }

  // MARK: - Get Streaming Providers by Region
  func getStreamingProviders(watchRegion: String, language: String = "en-US") async throws
    -> [StreamingProvider]
  {
    // Fetch both movie and tv providers and merge them
    async let movieProviders = fetchProviders(
      type: "movie", watchRegion: watchRegion, language: language)
    async let tvProviders = fetchProviders(type: "tv", watchRegion: watchRegion, language: language)

    let (movies, tv) = try await (movieProviders, tvProviders)

    // Merge and deduplicate
    var uniqueProviders: [Int: StreamingProvider] = [:]
    for provider in movies {
      uniqueProviders[provider.providerId] = provider
    }
    for provider in tv {
      if uniqueProviders[provider.providerId] == nil {
        uniqueProviders[provider.providerId] = provider
      }
    }

    return Array(uniqueProviders.values).sorted { $0.providerName < $1.providerName }
  }

  private func fetchProviders(type: String, watchRegion: String, language: String) async throws
    -> [StreamingProvider]
  {
    guard
      let url = URL(
        string:
          "\(baseURL)/watch/providers/\(type)?language=\(language)&watch_region=\(watchRegion)")
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
    let result = try decoder.decode(StreamingProvidersResponse.self, from: data)
    return result.results
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

// MARK: - Media Images
struct MediaImages: Codable {
  let backdrops: [TMDBImage]
  let posters: [TMDBImage]

  var sortedBackdrops: [TMDBImage] {
    backdrops.sorted { $0.voteCount > $1.voteCount }
  }

  var sortedPosters: [TMDBImage] {
    posters.sorted { $0.voteCount > $1.voteCount }
  }
}

struct TMDBImage: Codable, Identifiable {
  let aspectRatio: Double
  let filePath: String
  let height: Int
  let width: Int
  let voteAverage: Double
  let voteCount: Int

  var id: String { filePath }

  var thumbnailURL: URL? {
    URL(string: "https://image.tmdb.org/t/p/w500\(filePath)")
  }

  var fullURL: URL? {
    URL(string: "https://image.tmdb.org/t/p/original\(filePath)")
  }

  var backdropURL: URL? {
    URL(string: "https://image.tmdb.org/t/p/w1280\(filePath)")
  }
}

// MARK: - Watch Providers
struct WatchProvidersResponse: Codable {
  let results: WatchProvidersResults
}

struct WatchProvidersResults: Codable {
  let BR: WatchProviderCountry?
  let US: WatchProviderCountry?
  let DE: WatchProviderCountry?
  let ES: WatchProviderCountry?
  let FR: WatchProviderCountry?
  let IT: WatchProviderCountry?
  let JP: WatchProviderCountry?

  func forLanguage(_ language: Language) -> WatchProviderCountry? {
    switch language {
    case .ptBR: return BR
    case .enUS: return US
    case .deDE: return DE
    case .esES: return ES
    case .frFR: return FR
    case .itIT: return IT
    case .jaJP: return JP
    }
  }
}

struct WatchProviderCountry: Codable {
  let flatrate: [WatchProvider]?
  let rent: [WatchProvider]?
  let buy: [WatchProvider]?
}

struct WatchProvider: Codable, Identifiable {
  let providerId: Int
  let providerName: String
  let logoPath: String?

  var id: Int { providerId }

  var logoURL: URL? {
    guard let logoPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w92\(logoPath)")
  }
}

// MARK: - Streaming Providers (for preferences)
struct StreamingProvidersResponse: Codable {
  let results: [StreamingProvider]
}

struct StreamingProvider: Codable, Identifiable {
  let providerId: Int
  let providerName: String
  let logoPath: String?

  var id: Int { providerId }

  var logoURL: URL? {
    guard let logoPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w92\(logoPath)")
  }
}

// MARK: - Watch Regions
struct WatchRegionsResponse: Codable {
  let results: [WatchRegion]
}

struct WatchRegion: Codable, Identifiable {
  let iso31661: String
  let englishName: String
  let nativeName: String

  var id: String { iso31661 }

  // Returns flag emoji for the country code
  var flagEmoji: String {
    let base: UInt32 = 127397
    var emoji = ""
    for scalar in iso31661.uppercased().unicodeScalars {
      if let unicode = UnicodeScalar(base + scalar.value) {
        emoji.append(String(unicode))
      }
    }
    return emoji
  }
}
