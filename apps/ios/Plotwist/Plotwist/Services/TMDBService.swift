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

  // MARK: - Top Rated Animes (Animation genre from Japan)
  func getTopRatedAnimes(language: String = "en-US", page: Int = 1) async throws -> PaginatedResult {
    // Genre 16 = Animation, origin_country = JP, sorted by vote average with minimum votes
    guard
      let url = URL(
        string:
          "\(baseURL)/discover/tv?language=\(language)&sort_by=vote_average.desc&vote_count.gte=1000&with_genres=16&with_origin_country=JP&page=\(page)"
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

  // MARK: - Top Rated Doramas (Korean dramas)
  func getTopRatedDoramas(language: String = "en-US", page: Int = 1) async throws -> PaginatedResult {
    // origin_country = KR, sorted by vote average with minimum votes
    guard
      let url = URL(
        string:
          "\(baseURL)/discover/tv?language=\(language)&sort_by=vote_average.desc&vote_count.gte=500&with_origin_country=KR&page=\(page)"
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

  // MARK: - Discover Movies with Watch Providers
  func discoverMovies(
    language: String = "en-US",
    page: Int = 1,
    watchRegion: String? = nil,
    withWatchProviders: String? = nil
  ) async throws -> PaginatedResult {
    var urlString =
      "\(baseURL)/discover/movie?language=\(language)&sort_by=popularity.desc&page=\(page)"

    if let region = watchRegion, let providers = withWatchProviders, !providers.isEmpty {
      urlString += "&watch_region=\(region)&with_watch_providers=\(providers)"
    }

    guard let url = URL(string: urlString) else {
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

  // MARK: - Discover TV with Watch Providers
  func discoverTV(
    language: String = "en-US",
    page: Int = 1,
    watchRegion: String? = nil,
    withWatchProviders: String? = nil
  ) async throws -> PaginatedResult {
    var urlString =
      "\(baseURL)/discover/tv?language=\(language)&sort_by=popularity.desc&page=\(page)"

    if let region = watchRegion, let providers = withWatchProviders, !providers.isEmpty {
      urlString += "&watch_region=\(region)&with_watch_providers=\(providers)"
    }

    guard let url = URL(string: urlString) else {
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

  // MARK: - Discover Animes with Watch Providers
  func discoverAnimes(
    language: String = "en-US",
    page: Int = 1,
    watchRegion: String? = nil,
    withWatchProviders: String? = nil
  ) async throws -> PaginatedResult {
    var urlString =
      "\(baseURL)/discover/tv?language=\(language)&sort_by=popularity.desc&with_genres=16&with_origin_country=JP&page=\(page)"

    if let region = watchRegion, let providers = withWatchProviders, !providers.isEmpty {
      urlString += "&watch_region=\(region)&with_watch_providers=\(providers)"
    }

    guard let url = URL(string: urlString) else {
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

  // MARK: - Discover Anime Movies with Watch Providers
  func discoverAnimeMovies(
    language: String = "en-US",
    page: Int = 1,
    watchRegion: String? = nil,
    withWatchProviders: String? = nil
  ) async throws -> PaginatedResult {
    var urlString =
      "\(baseURL)/discover/movie?language=\(language)&sort_by=popularity.desc&with_genres=16&with_origin_country=JP&page=\(page)"

    if let region = watchRegion, let providers = withWatchProviders, !providers.isEmpty {
      urlString += "&watch_region=\(region)&with_watch_providers=\(providers)"
    }

    guard let url = URL(string: urlString) else {
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

  // MARK: - Discover Doramas with Watch Providers
  func discoverDoramas(
    language: String = "en-US",
    page: Int = 1,
    watchRegion: String? = nil,
    withWatchProviders: String? = nil
  ) async throws -> PaginatedResult {
    var urlString =
      "\(baseURL)/discover/tv?language=\(language)&sort_by=popularity.desc&with_origin_country=KR&page=\(page)"

    if let region = watchRegion, let providers = withWatchProviders, !providers.isEmpty {
      urlString += "&watch_region=\(region)&with_watch_providers=\(providers)"
    }

    guard let url = URL(string: urlString) else {
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

  // MARK: - Season Details
  func getSeasonDetails(seriesId: Int, seasonNumber: Int, language: String = "en-US") async throws
    -> SeasonDetails
  {
    guard
      let url = URL(
        string: "\(baseURL)/tv/\(seriesId)/season/\(seasonNumber)?language=\(language)")
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
    return try decoder.decode(SeasonDetails.self, from: data)
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

  // MARK: - Get Collection Details
  func getCollectionDetails(id: Int, language: String = "en-US") async throws -> MovieCollection {
    guard let url = URL(string: "\(baseURL)/collection/\(id)?language=\(language)") else {
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
    return try decoder.decode(MovieCollection.self, from: data)
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
  
  // MARK: - Trending (for onboarding)
  func getTrending(mediaType: String = "all", timeWindow: String = "week", language: String = "en-US") async throws -> [SearchResult] {
    guard let url = URL(string: "\(baseURL)/trending/\(mediaType)/\(timeWindow)?language=\(language)") else {
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
    return try decoder.decode(SearchMultiResponse.self, from: data).results
  }
  
  // MARK: - Discover by Genre (for onboarding)
  func discoverByGenres(mediaType: String, genreIds: [Int], language: String = "en-US", page: Int = 1) async throws -> [SearchResult] {
    // Use | (pipe) for OR logic - matches ANY of the selected genres (more results)
    // Using , (comma) would be AND logic - matches ALL genres (fewer results)
    let genresString = genreIds.map { String($0) }.joined(separator: "|")
    let endpoint = mediaType == "movie" ? "discover/movie" : "discover/tv"
    
    // Sort by vote count to show most voted (well-known) content first
    guard let url = URL(string: "\(baseURL)/\(endpoint)?language=\(language)&with_genres=\(genresString)&sort_by=vote_count.desc&page=\(page)") else {
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
  let belongsToCollection: BelongsToCollection?
  let seasons: [Season]?  // TV Series seasons

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
    return URL(string: "https://image.tmdb.org/t/p/original\(backdropPath)")
  }

  /// Filtered seasons for display (excludes specials with season 0 and empty seasons)
  var displaySeasons: [Season] {
    guard let seasons else { return [] }
    return seasons.filter { $0.seasonNumber != 0 && $0.episodeCount > 0 }
  }
}

// MARK: - Season Model (TV Series)
struct Season: Codable, Identifiable {
  let id: Int
  let name: String
  let seasonNumber: Int
  let episodeCount: Int
  let overview: String?
  let posterPath: String?
  let airDate: String?

  var posterURL: URL? {
    guard let posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w500\(posterPath)")
  }

  var year: String? {
    guard let airDate, airDate.count >= 4 else { return nil }
    return String(airDate.prefix(4))
  }
}

// MARK: - Season Details (with episodes)
struct SeasonDetails: Codable, Identifiable {
  let id: Int
  let name: String
  let seasonNumber: Int
  let episodes: [Episode]
  let overview: String?
  let posterPath: String?
  let airDate: String?

  var posterURL: URL? {
    guard let posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w500\(posterPath)")
  }
}

// MARK: - Episode Model
struct Episode: Codable, Identifiable {
  let id: Int
  let name: String
  let episodeNumber: Int
  let seasonNumber: Int
  let overview: String?
  let stillPath: String?
  let airDate: String?
  let voteAverage: Double
  let voteCount: Int
  let runtime: Int?

  var stillURL: URL? {
    guard let stillPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w500\(stillPath)")
  }
  
  var formattedRuntime: String? {
    guard let runtime = runtime, runtime > 0 else { return nil }
    if runtime >= 60 {
      let hours = runtime / 60
      let minutes = runtime % 60
      return minutes > 0 ? "\(hours)h \(minutes)min" : "\(hours)h"
    }
    return "\(runtime)min"
  }
}

// MARK: - Belongs To Collection
struct BelongsToCollection: Codable, Identifiable {
  let id: Int
  let name: String
  let posterPath: String?
  let backdropPath: String?

  var backdropURL: URL? {
    guard let backdropPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/original\(backdropPath)")
  }
}

// MARK: - Movie Collection (Detailed)
struct MovieCollection: Codable, Identifiable {
  let id: Int
  let name: String
  let overview: String?
  let posterPath: String?
  let backdropPath: String?
  let parts: [CollectionPart]

  var backdropURL: URL? {
    guard let backdropPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/original\(backdropPath)")
  }
}

struct CollectionPart: Codable, Identifiable {
  let id: Int
  let title: String
  let posterPath: String?
  let releaseDate: String?

  var posterURL: URL? {
    guard let posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w500\(posterPath)")
  }

  var year: String? {
    guard let releaseDate, releaseDate.count >= 4 else { return nil }
    return String(releaseDate.prefix(4))
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
  let backdropPath: String?
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
      backdropPath: backdropPath,
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

struct SearchResult: Codable, Identifiable, Equatable {
  let id: Int
  let mediaType: String?
  let title: String?
  let name: String?
  let posterPath: String?
  let backdropPath: String?
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
  
  var backdropURL: URL? {
    guard let backdropPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w780\(backdropPath)")
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
  
  var hdPosterURL: URL? {
    guard let posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w780\(posterPath)")
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
    URL(string: "https://image.tmdb.org/t/p/original\(filePath)")
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
