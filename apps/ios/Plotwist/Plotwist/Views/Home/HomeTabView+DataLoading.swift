//
//  HomeTabView+DataLoading.swift
//  Plotwist
//

import SwiftUI

extension HomeTabView {
  func loadData() async {
    // If we have cached data, don't show loading state
    if cache.isDataAvailable {
      isInitialLoad = false
    }

    await withTaskGroup(of: Void.self) { group in
      group.addTask { await loadUser() }
      group.addTask { await loadWatchingItems() }
      group.addTask { await loadWatchlistItems() }
      group.addTask { await loadDiscoveryContent() }
      group.addTask { await loadFeaturedItem() }
      group.addTask { await loadForYouItems() }
      group.addTask { await loadTrendingItems() }
      group.addTask { await loadContentTypeItems() }
      group.addTask { await loadContextualSections() }
      group.addTask { await loadTopRatedItems() }
    }

    isInitialLoad = false
  }

  // MARK: - Featured Item

  @MainActor
  func loadFeaturedItem() async {
    // Check cache first
    if let cached = cache.featuredItem {
      featuredItem = cached
      return
    }

    let language = Language.current.rawValue

    do {
      // Load content matching user's preferences, then pick the best one
      let candidates = try await loadContentForPreferences(language: language)

      // Only consider items with a backdrop image
      let withBackdrop = candidates.filter { $0.backdropPath != nil }

      if let best = withBackdrop.first {
        featuredItem = best
        cache.setFeaturedItem(best)

        // Prefetch the HD backdrop for instant display
        if let url = best.hdBackdropURL ?? best.backdropURL {
          ImageCache.shared.prefetch(urls: [url], priority: .high)
        }
      }
    } catch {
      print("Error loading featured item: \(error)")
    }
  }

  /// Loads content that matches the user's content type preferences.
  /// Used by both Featured Hero and Trending sections for consistent filtering.
  func loadContentForPreferences(language: String) async throws -> [SearchResult] {
    let contentTypes = activeContentTypes

    // No preferences: show everything trending
    guard !contentTypes.isEmpty else {
      return try await TMDBService.shared.getTrending(
        mediaType: "all",
        timeWindow: "week",
        language: language
      )
    }

    var allItems: [SearchResult] = []

    // Fetch content for each selected type in parallel
    try await withThrowingTaskGroup(of: [SearchResult].self) { group in
      if contentTypes.contains(.movies) {
        group.addTask {
          try await TMDBService.shared.getTrending(
            mediaType: "movie",
            timeWindow: "week",
            language: language
          )
        }
      }

      if contentTypes.contains(.series) {
        group.addTask {
          try await TMDBService.shared.getTrending(
            mediaType: "tv",
            timeWindow: "week",
            language: language
          )
        }
      }

      if contentTypes.contains(.anime) {
        group.addTask {
          let result = try await TMDBService.shared.getPopularAnimes(language: language)
          return result.results
        }
      }

      if contentTypes.contains(.dorama) {
        group.addTask {
          let result = try await TMDBService.shared.getPopularDoramas(language: language)
          return result.results
        }
      }

      for try await items in group {
        allItems.append(contentsOf: items)
      }
    }

    // Deduplicate
    var seen = Set<Int>()
    return allItems.filter { item in
      if seen.contains(item.id) { return false }
      seen.insert(item.id)
      return true
    }
  }

  // MARK: - For You

  @MainActor
  func loadForYouItems() async {
    // Check cache first
    if let cached = cache.forYouItems, !cached.isEmpty {
      forYouItems = cached
      return
    }

    let genreIds: [Int]
    if AuthService.shared.isAuthenticated {
      let serverGenres = UserPreferencesManager.shared.genreIds
      genreIds = serverGenres.isEmpty ? onboardingService.selectedGenres.map { $0.id } : serverGenres
    } else {
      genreIds = onboardingService.selectedGenres.map { $0.id }
    }
    let language = Language.current.rawValue
    let contentTypes = activeContentTypes

    // Need either genre preferences or content type preferences
    guard !genreIds.isEmpty || !contentTypes.isEmpty else { return }

    do {
      var allItems: [SearchResult] = []

      // Movie genres
      if contentTypes.contains(.movies) || contentTypes.isEmpty {
        let movieGenreIds = genreIds.filter {
          [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 53, 10752, 37].contains($0)
        }
        if !movieGenreIds.isEmpty {
          let movies = try await TMDBService.shared.discoverByGenres(
            mediaType: "movie",
            genreIds: movieGenreIds,
            language: language
          )
          allItems.append(contentsOf: movies)
        }
      }

      // TV series genres
      if contentTypes.contains(.series) || contentTypes.isEmpty {
        let tvGenreIds = genreIds.filter {
          [10759, 16, 35, 80, 18, 10765, 10768, 9648, 10751, 10764, 10749].contains($0)
        }
        if !tvGenreIds.isEmpty {
          let series = try await TMDBService.shared.discoverByGenres(
            mediaType: "tv",
            genreIds: tvGenreIds,
            language: language
          )
          allItems.append(contentsOf: series)
        }
      }

      // Anime: use discover with user's genre preferences or fallback to popular
      if contentTypes.contains(.anime) {
        let animeGenreIds = genreIds.filter {
          [16, 10759, 35, 18, 10765, 10749, 878, 9648].contains($0)
        }
        if !animeGenreIds.isEmpty {
          let animes = try await TMDBService.shared.discoverByGenres(
            mediaType: "tv",
            genreIds: animeGenreIds,
            language: language,
            originCountry: "JP"
          )
          allItems.append(contentsOf: animes)
        } else {
          let animes = try await TMDBService.shared.getPopularAnimes(language: language)
          allItems.append(contentsOf: animes.results)
        }
      }

      // Dorama: use discover with user's genre preferences or fallback to popular
      if contentTypes.contains(.dorama) {
        let doramaGenreIds = genreIds.filter {
          [10759, 35, 80, 18, 10765, 10768, 9648, 10751, 10764, 10749].contains($0)
        }
        if !doramaGenreIds.isEmpty {
          let doramas = try await TMDBService.shared.discoverByGenres(
            mediaType: "tv",
            genreIds: doramaGenreIds,
            language: language,
            originCountry: "KR"
          )
          allItems.append(contentsOf: doramas)
        } else {
          let doramas = try await TMDBService.shared.getPopularDoramas(language: language)
          allItems.append(contentsOf: doramas.results)
        }
      }

      // Remove duplicates, keep unique by ID
      var seen = Set<Int>()
      let unique = allItems.filter { item in
        if seen.contains(item.id) { return false }
        seen.insert(item.id)
        return true
      }

      // Exclude featured item to avoid repetition
      var filtered = unique.filter { $0.id != featuredItem?.id }

      // Exclude items already in the user's collection (watchlist, watching, watched, dropped)
      let collectionIds = await loadUserCollectionIds()
      if !collectionIds.isEmpty {
        filtered = filtered.filter { !collectionIds.contains($0.id) }
      }

      forYouItems = Array(filtered.prefix(20))
      cache.setForYouItems(forYouItems)
    } catch {
      print("Error loading For You items: \(error)")
    }
  }

  /// Returns the set of TMDB IDs that the user already has in their collection
  /// (watchlist, watching, watched, dropped). Used to filter "For You" recommendations.
  @MainActor
  func loadUserCollectionIds() async -> Set<Int> {
    // Guest mode: use local saved titles
    if isGuestMode {
      return Set(onboardingService.localSavedTitles.map { $0.tmdbId })
    }

    // Authenticated: fetch all statuses in parallel
    guard AuthService.shared.isAuthenticated else { return [] }

    let fetchedUser: User? = try? await AuthService.shared.getCurrentUser()
    guard let currentUser = user ?? fetchedUser else { return [] }

    var allIds = Set<Int>()

    await withTaskGroup(of: [UserItemSummary].self) { group in
      for status in UserItemStatus.allCases {
        group.addTask {
          (try? await UserItemService.shared.getAllUserItems(
            userId: currentUser.id,
            status: status.rawValue
          )) ?? []
        }
      }

      for await items in group {
        for item in items {
          allIds.insert(item.tmdbId)
        }
      }
    }

    return allIds
  }

  // MARK: - Trending

  @MainActor
  func loadTrendingItems() async {
    // Check cache first
    if let cached = cache.trendingItems, !cached.isEmpty {
      trendingItems = cached
      return
    }

    do {
      let items = try await loadContentForPreferences(language: Language.current.rawValue)

      // Exclude featured item to avoid repetition
      let filtered = items.filter { $0.id != featuredItem?.id }
      trendingItems = Array(filtered.prefix(10))
      cache.setTrendingItems(trendingItems)
    } catch {
      print("Error loading trending items: \(error)")
    }
  }

  // MARK: - Content Type Items (Anime, Dorama)

  @MainActor
  func loadContentTypeItems() async {
    let language = Language.current.rawValue

    // Load anime section
    if showAnimeSection {
      if let cached = cache.animeItems, !cached.isEmpty {
        animeItems = cached
      } else {
        do {
          let result = try await TMDBService.shared.getPopularAnimes(language: language)
          animeItems = result.results
          cache.setAnimeItems(animeItems)
        } catch {
          print("Error loading anime items: \(error)")
        }
      }
    }

    // Load dorama section
    if showDoramaSection {
      if let cached = cache.doramaItems, !cached.isEmpty {
        doramaItems = cached
      } else {
        do {
          let result = try await TMDBService.shared.getPopularDoramas(language: language)
          doramaItems = result.results
          cache.setDoramaItems(doramaItems)
        } catch {
          print("Error loading dorama items: \(error)")
        }
      }
    }
  }

  // MARK: - Contextual Sections (Now Playing, Airing Today)

  @MainActor
  func loadContextualSections() async {
    let language = Language.current.rawValue

    // Now Playing (movies)
    if showMoviesContent {
      if let cached = cache.nowPlayingItems, !cached.isEmpty {
        nowPlayingItems = cached
      } else {
        do {
          let result = try await TMDBService.shared.getNowPlayingMovies(language: language)
          nowPlayingItems = result.results
          cache.setNowPlayingItems(nowPlayingItems)
        } catch {
          print("Error loading now playing items: \(error)")
        }
      }
    }

    // Airing Today (series)
    if showSeriesContent {
      if let cached = cache.airingTodayItems, !cached.isEmpty {
        airingTodayItems = cached
      } else {
        do {
          let result = try await TMDBService.shared.getAiringTodayTVSeries(language: language)
          airingTodayItems = result.results
          cache.setAiringTodayItems(airingTodayItems)
        } catch {
          print("Error loading airing today items: \(error)")
        }
      }
    }
  }

  // MARK: - Top Rated

  @MainActor
  func loadTopRatedItems() async {
    if let cached = cache.topRatedItems, !cached.isEmpty {
      topRatedItems = cached
      return
    }

    let language = Language.current.rawValue
    let contentTypes = activeContentTypes

    do {
      let result: PaginatedResult
      if contentTypes.contains(.anime) && !showMoviesContent && !showSeriesContent {
        // Anime-focused user
        result = try await TMDBService.shared.getTopRatedAnimes(language: language)
      } else if contentTypes.contains(.dorama) && !showMoviesContent && !showSeriesContent {
        // Dorama-focused user
        result = try await TMDBService.shared.getTopRatedDoramas(language: language)
      } else if showMoviesContent {
        result = try await TMDBService.shared.getTopRatedMovies(language: language)
      } else {
        result = try await TMDBService.shared.getTopRatedTVSeries(language: language)
      }
      topRatedItems = result.results
      cache.setTopRatedItems(topRatedItems)
    } catch {
      print("Error loading top rated items: \(error)")
    }
  }

  // MARK: - Discovery Content

  @MainActor
  func loadDiscoveryContent() async {
    // Check cache first
    if let cachedMovies = cache.popularMovies, let cachedTVSeries = cache.popularTVSeries {
      popularMovies = cachedMovies
      popularTVSeries = cachedTVSeries
      isLoadingDiscovery = false
      return
    }

    do {
      async let moviesTask = TMDBService.shared.getPopularMovies(
        language: Language.current.rawValue
      )
      async let tvTask = TMDBService.shared.getPopularTVSeries(
        language: Language.current.rawValue
      )

      let (moviesResult, tvResult) = try await (moviesTask, tvTask)

      popularMovies = moviesResult.results
      popularTVSeries = tvResult.results

      // Cache the results
      cache.setPopularMovies(moviesResult.results)
      cache.setPopularTVSeries(tvResult.results)
    } catch {
      print("Error loading discovery content: \(error)")
    }

    isLoadingDiscovery = false
  }

  // MARK: - User

  @MainActor
  func loadUser(forceRefresh: Bool = false) async {
    // Use cache if available and not forcing refresh
    if !forceRefresh, let cachedUser = cache.user {
      user = cachedUser
      return
    }

    guard AuthService.shared.isAuthenticated else { return }

    do {
      let fetchedUser = try await AuthService.shared.getCurrentUser()
      user = fetchedUser
      cache.setUser(fetchedUser)
    } catch {
      print("Error loading user: \(error)")
    }
  }

  // MARK: - Watching Items

  @MainActor
  func loadWatchingItems(forceRefresh: Bool = false) async {
    // Use cache if available and not forcing refresh
    if !forceRefresh, let cachedItems = cache.watchingItems {
      watchingItems = cachedItems
      return
    }

    guard AuthService.shared.isAuthenticated else { return }

    let fetchedUser = try? await AuthService.shared.getCurrentUser()
    guard let currentUser = user ?? fetchedUser else { return }

    do {
      let items = try await UserItemService.shared.getAllUserItems(
        userId: currentUser.id,
        status: UserItemStatus.watching.rawValue
      )

      // Fetch details for each item from TMDB
      var results: [SearchResult] = []
      for item in items.prefix(10) {
        do {
          if item.mediaType == "MOVIE" {
            let details = try await TMDBService.shared.getMovieDetails(
              id: item.tmdbId,
              language: Language.current.rawValue
            )
            results.append(
              SearchResult(
                id: details.id,
                mediaType: "movie",
                title: details.title,
                name: details.name,
                posterPath: details.posterPath,
                backdropPath: details.backdropPath,
                profilePath: nil,
                releaseDate: details.releaseDate,
                firstAirDate: details.firstAirDate,
                overview: details.overview,
                voteAverage: details.voteAverage,
                knownForDepartment: nil,
                genreIds: nil
              ))
          } else {
            let details = try await TMDBService.shared.getTVSeriesDetails(
              id: item.tmdbId,
              language: Language.current.rawValue
            )
            results.append(
              SearchResult(
                id: details.id,
                mediaType: "tv",
                title: details.title,
                name: details.name,
                posterPath: details.posterPath,
                backdropPath: details.backdropPath,
                profilePath: nil,
                releaseDate: details.releaseDate,
                firstAirDate: details.firstAirDate,
                overview: details.overview,
                voteAverage: details.voteAverage,
                knownForDepartment: nil,
                genreIds: nil
              ))
          }
        } catch {
          print("Error fetching details for \(item.tmdbId): \(error)")
        }
      }

      watchingItems = results
      cache.setWatchingItems(results)
    } catch {
      print("Error loading watching items: \(error)")
    }
  }

  // MARK: - Watchlist Items

  @MainActor
  func loadWatchlistItems(forceRefresh: Bool = false) async {
    // Use cache if available and not forcing refresh
    if !forceRefresh, let cachedItems = cache.watchlistItems, !cachedItems.isEmpty {
      watchlistItems = cachedItems
      return
    }

    // Guest mode: load from local saved titles
    if isGuestMode {
      await loadLocalWatchlistItems()
      return
    }
    
    guard AuthService.shared.isAuthenticated else { return }

    let fetchedUser = try? await AuthService.shared.getCurrentUser()
    guard let currentUser = user ?? fetchedUser else { return }

    do {
      let items = try await UserItemService.shared.getAllUserItems(
        userId: currentUser.id,
        status: UserItemStatus.watchlist.rawValue
      )

      // Fetch details for each item from TMDB
      var results: [SearchResult] = []
      for item in items.prefix(10) {
        do {
          if item.mediaType == "MOVIE" {
            let details = try await TMDBService.shared.getMovieDetails(
              id: item.tmdbId,
              language: Language.current.rawValue
            )
            results.append(
              SearchResult(
                id: details.id,
                mediaType: "movie",
                title: details.title,
                name: details.name,
                posterPath: details.posterPath,
                backdropPath: details.backdropPath,
                profilePath: nil,
                releaseDate: details.releaseDate,
                firstAirDate: details.firstAirDate,
                overview: details.overview,
                voteAverage: details.voteAverage,
                knownForDepartment: nil,
                genreIds: nil
              ))
          } else {
            let details = try await TMDBService.shared.getTVSeriesDetails(
              id: item.tmdbId,
              language: Language.current.rawValue
            )
            results.append(
              SearchResult(
                id: details.id,
                mediaType: "tv",
                title: details.title,
                name: details.name,
                posterPath: details.posterPath,
                backdropPath: details.backdropPath,
                profilePath: nil,
                releaseDate: details.releaseDate,
                firstAirDate: details.firstAirDate,
                overview: details.overview,
                voteAverage: details.voteAverage,
                knownForDepartment: nil,
                genreIds: nil
              ))
          }
        } catch {
          print("Error fetching details for \(item.tmdbId): \(error)")
        }
      }

      watchlistItems = results
      cache.setWatchlistItems(results)
    } catch {
      print("Error loading watchlist items: \(error)")
    }
  }
  
  @MainActor
  func loadLocalWatchlistItems() async {
    let localTitles = onboardingService.localSavedTitles.filter { $0.status == "WATCHLIST" }
    
    guard !localTitles.isEmpty else {
      watchlistItems = []
      return
    }
    
    var results: [SearchResult] = []
    
    for title in localTitles.prefix(10) {
      do {
        if title.mediaType == "movie" {
          let details = try await TMDBService.shared.getMovieDetails(
            id: title.tmdbId,
            language: Language.current.rawValue
          )
          results.append(
            SearchResult(
              id: details.id,
              mediaType: "movie",
              title: details.title,
              name: details.name,
              posterPath: details.posterPath,
              backdropPath: details.backdropPath,
              profilePath: nil,
              releaseDate: details.releaseDate,
              firstAirDate: details.firstAirDate,
              overview: details.overview,
              voteAverage: details.voteAverage,
              knownForDepartment: nil,
              genreIds: nil
            ))
        } else {
          let details = try await TMDBService.shared.getTVSeriesDetails(
            id: title.tmdbId,
            language: Language.current.rawValue
          )
          results.append(
            SearchResult(
              id: details.id,
              mediaType: "tv",
              title: details.title,
              name: details.name,
              posterPath: details.posterPath,
              backdropPath: details.backdropPath,
              profilePath: nil,
              releaseDate: details.releaseDate,
              firstAirDate: details.firstAirDate,
              overview: details.overview,
              voteAverage: details.voteAverage,
              knownForDepartment: nil,
              genreIds: nil
            ))
        }
      } catch {
        print("Error fetching details for local title \(title.tmdbId): \(error)")
      }
    }
    
    watchlistItems = results
    cache.setWatchlistItems(results)
  }
}
