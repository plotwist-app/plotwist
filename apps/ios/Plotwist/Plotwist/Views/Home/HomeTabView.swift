//
//  HomeTabView.swift
//  Plotwist
//

import SwiftUI

struct HomeTabView: View {
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @ObservedObject private var onboardingService = OnboardingService.shared
  @State private var strings = L10n.current
  @State private var user: User?
  @State private var watchingItems: [SearchResult] = []
  @State private var watchlistItems: [SearchResult] = []
  @State private var isInitialLoad = true
  @State private var needsRefresh = false
  @State private var hasAppeared = false

  // Discovery sections
  @State private var popularMovies: [SearchResult] = []
  @State private var popularTVSeries: [SearchResult] = []
  @State private var isLoadingDiscovery = true

  // New personalized sections
  @State private var featuredItem: SearchResult?
  @State private var forYouItems: [SearchResult] = []
  @State private var trendingItems: [SearchResult] = []
  @State private var animeItems: [SearchResult] = []
  @State private var doramaItems: [SearchResult] = []
  @State private var nowPlayingItems: [SearchResult] = []
  @State private var airingTodayItems: [SearchResult] = []
  @State private var topRatedItems: [SearchResult] = []

  private let cache = HomeDataCache.shared
  
  // Guest mode username from onboarding
  private var displayUsername: String? {
    if AuthService.shared.isAuthenticated {
      return user?.username
    } else if !onboardingService.userName.isEmpty {
      return onboardingService.userName
    }
    return nil
  }
  
  private var isGuestMode: Bool {
    !AuthService.shared.isAuthenticated && onboardingService.hasCompletedOnboarding
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var greeting: String {
    let hour = Calendar.current.component(.hour, from: Date())
    if hour >= 5 && hour < 12 {
      return strings.goodMorning
    } else if hour >= 12 && hour < 18 {
      return strings.goodAfternoon
    } else {
      return strings.goodEvening
    }
  }

  // Only show skeleton on first load when no cached data
  private var showWatchingSkeleton: Bool {
    isInitialLoad && cache.shouldShowSkeleton && watchingItems.isEmpty && !isGuestMode
  }

  private var showWatchlistSkeleton: Bool {
    isInitialLoad && cache.shouldShowSkeleton && watchlistItems.isEmpty && !isGuestMode
  }

  private var showUserSkeleton: Bool {
    isInitialLoad && user == nil && cache.user == nil && !isGuestMode
  }

  private var showDiscoverySkeleton: Bool {
    isLoadingDiscovery && popularMovies.isEmpty && popularTVSeries.isEmpty && featuredItem == nil
  }

  // Personalization helpers
  private var showAnimeSection: Bool {
    onboardingService.contentTypes.contains(.anime)
  }

  private var showDoramaSection: Bool {
    onboardingService.contentTypes.contains(.dorama)
  }

  private var showMoviesContent: Bool {
    onboardingService.contentTypes.contains(.movies) || onboardingService.contentTypes.isEmpty
  }

  private var showSeriesContent: Bool {
    onboardingService.contentTypes.contains(.series) || onboardingService.contentTypes.isEmpty
  }

  private var forYouSubtitle: String {
    let genreNames = onboardingService.selectedGenres.prefix(3).map { $0.name }
    guard !genreNames.isEmpty else { return "" }
    let joined = genreNames.joined(separator: ", ")
    return String(format: strings.basedOnYourTaste, joined)
  }

  // Top Rated section adapts title/type to user's content preference
  private var topRatedSectionTitle: String {
    let contentTypes = onboardingService.contentTypes
    if contentTypes.contains(.anime) && !showMoviesContent && !showSeriesContent {
      return strings.topRatedAnimes
    } else if contentTypes.contains(.dorama) && !showMoviesContent && !showSeriesContent {
      return strings.topRatedDoramas
    } else if showMoviesContent {
      return strings.topRatedMovies
    } else {
      return strings.topRatedSeries
    }
  }

  private var topRatedMediaType: String {
    showMoviesContent ? "movie" : "tv"
  }

  private var topRatedCategoryType: HomeCategoryType {
    let contentTypes = onboardingService.contentTypes
    if contentTypes.contains(.anime) && !showMoviesContent && !showSeriesContent {
      return .animes
    } else if contentTypes.contains(.dorama) && !showMoviesContent && !showSeriesContent {
      return .doramas
    } else if showMoviesContent {
      return .movies
    } else {
      return .tvSeries
    }
  }

  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        ScrollView(showsIndicators: false) {
          VStack(alignment: .leading, spacing: 32) {
            // Header with greeting
            // DEBUG: Long press (3s) on avatar to reset onboarding
            HomeHeaderView(
              greeting: greeting,
              username: displayUsername,
              avatarURL: user?.avatarImageURL,
              isLoading: showUserSkeleton && !isGuestMode,
              isGuestMode: isGuestMode,
              onAvatarTapped: {
                NotificationCenter.default.post(name: .navigateToProfile, object: nil)
              },
              onAvatarLongPressed: {
                OnboardingService.shared.reset()
                UserDefaults.standard.set(false, forKey: "isGuestMode")
                NotificationCenter.default.post(name: .authChanged, object: nil)
              }
            )
            .padding(.horizontal, 24)
            .padding(.top, 16)

            // Featured Hero Card
            if let featured = featuredItem {
              FeaturedHeroCard(item: featured, label: strings.featured)
                .padding(.horizontal, 20)
                .transition(.opacity)
            } else if showDiscoverySkeleton {
              FeaturedHeroSkeleton()
                .padding(.horizontal, 20)
            }

            // Continue Watching Section
            if showWatchingSkeleton {
              HomeSectionSkeleton()
            } else if !watchingItems.isEmpty {
              ContinueWatchingSection(
                items: watchingItems,
                title: strings.continueWatching
              )
            }

            // Watchlist Section
            if showWatchlistSkeleton {
              HomeSectionSkeleton()
            } else if !watchlistItems.isEmpty {
              WatchlistSection(
                items: watchlistItems,
                title: strings.upNext
              )
            }

            // For You - Personalized by genre
            if !forYouItems.isEmpty {
              ForYouSection(
                items: forYouItems,
                title: strings.forYou,
                subtitle: forYouSubtitle
              )
            } else if showDiscoverySkeleton && !onboardingService.selectedGenres.isEmpty {
              HomeSectionSkeleton()
            }

            // Trending This Week
            if !trendingItems.isEmpty {
              TrendingSection(
                items: trendingItems,
                title: strings.trendingThisWeek
              )
            } else if showDiscoverySkeleton {
              HomeSectionSkeleton()
            }

            // Anime Section (conditional)
            if showAnimeSection && !animeItems.isEmpty {
              HomeSectionView(
                title: strings.popularAnimes,
                items: animeItems,
                mediaType: "tv",
                categoryType: .animes
              )
            }

            // Now Playing / Airing Today (contextual)
            if showMoviesContent && !nowPlayingItems.isEmpty {
              HomeSectionView(
                title: strings.inTheaters,
                items: nowPlayingItems,
                mediaType: "movie",
                categoryType: .movies,
                initialMovieSubcategory: .nowPlaying
              )
            }

            if showSeriesContent && !airingTodayItems.isEmpty {
              HomeSectionView(
                title: strings.airingToday,
                items: airingTodayItems,
                mediaType: "tv",
                categoryType: .tvSeries,
                initialTVSeriesSubcategory: .airingToday
              )
            }

            // Dorama Section (conditional)
            if showDoramaSection && !doramaItems.isEmpty {
              HomeSectionView(
                title: strings.popularDoramas,
                items: doramaItems,
                mediaType: "tv",
                categoryType: .doramas
              )
            }

            // Discovery Sections - Show only for relevant content types
            // Skip if contextual sections (In Theaters / Airing Today) already cover this
            if showDiscoverySkeleton && (showMoviesContent || showSeriesContent) {
              HomeSectionSkeleton()
              HomeSectionSkeleton()
            } else {
              // Popular Movies -- only if user likes movies AND "In Theaters" isn't visible
              if showMoviesContent && !popularMovies.isEmpty && nowPlayingItems.isEmpty {
                HomeSectionView(
                  title: strings.popularMovies,
                  items: popularMovies,
                  mediaType: "movie",
                  categoryType: .movies,
                  initialMovieSubcategory: .popular
                )
              }

              // Popular TV Series -- only if user likes series AND "Airing Today" isn't visible
              if showSeriesContent && !popularTVSeries.isEmpty && airingTodayItems.isEmpty {
                HomeSectionView(
                  title: strings.popularTVSeries,
                  items: popularTVSeries,
                  mediaType: "tv",
                  categoryType: .tvSeries,
                  initialTVSeriesSubcategory: .popular
                )
              }
            }

            // Top Rated (adapts to user's content type)
            if !topRatedItems.isEmpty {
              HomeSectionView(
                title: topRatedSectionTitle,
                items: topRatedItems,
                mediaType: topRatedMediaType,
                categoryType: topRatedCategoryType,
                initialMovieSubcategory: showMoviesContent ? .topRated : nil,
                initialTVSeriesSubcategory: !showMoviesContent ? .topRated : nil
              )
            }

            Spacer(minLength: 100)
          }
        }
      }
      .navigationBarHidden(true)
      .preferredColorScheme(effectiveColorScheme)
      .onAppear {
        // Restore from cache immediately on appear
        if !hasAppeared {
          hasAppeared = true
          restoreFromCache()
        }

        // Refresh when returning to view if needed
        if needsRefresh {
          needsRefresh = false
          Task {
            await loadWatchingItems(forceRefresh: true)
            await loadWatchlistItems(forceRefresh: true)
          }
        }
      }
    }
    .task {
      await loadData()
    }
    .trackScreen("Home")
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
    .onReceive(NotificationCenter.default.publisher(for: .profileUpdated)) { _ in
      Task { await loadUser(forceRefresh: true) }
    }
    .onReceive(NotificationCenter.default.publisher(for: .collectionCacheInvalidated)) { _ in
      needsRefresh = true
    }
    .onReceive(NotificationCenter.default.publisher(for: .homeDataCacheInvalidated)) { _ in
      needsRefresh = true
    }
  }

  private func restoreFromCache() {
    if let cachedUser = cache.user {
      user = cachedUser
    }
    if let cachedWatching = cache.watchingItems {
      watchingItems = cachedWatching
    }
    if let cachedWatchlist = cache.watchlistItems {
      watchlistItems = cachedWatchlist
    }
    if let cachedMovies = cache.popularMovies {
      popularMovies = cachedMovies
      isLoadingDiscovery = false
    }
    if let cachedTVSeries = cache.popularTVSeries {
      popularTVSeries = cachedTVSeries
      isLoadingDiscovery = false
    }
    // Restore new section caches
    if let cached = cache.featuredItem {
      featuredItem = cached
      isLoadingDiscovery = false
    }
    if let cached = cache.forYouItems {
      forYouItems = cached
      isLoadingDiscovery = false
    }
    if let cached = cache.trendingItems {
      trendingItems = cached
      isLoadingDiscovery = false
    }
    if let cached = cache.animeItems {
      animeItems = cached
    }
    if let cached = cache.doramaItems {
      doramaItems = cached
    }
    if let cached = cache.nowPlayingItems {
      nowPlayingItems = cached
    }
    if let cached = cache.airingTodayItems {
      airingTodayItems = cached
    }
    if let cached = cache.topRatedItems {
      topRatedItems = cached
    }
  }

  private func loadData() async {
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

  // MARK: - New Section Loaders

  @MainActor
  private func loadFeaturedItem() async {
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
  private func loadContentForPreferences(language: String) async throws -> [SearchResult] {
    let contentTypes = onboardingService.contentTypes

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

  @MainActor
  private func loadForYouItems() async {
    // Check cache first
    if let cached = cache.forYouItems, !cached.isEmpty {
      forYouItems = cached
      return
    }

    let genreIds = onboardingService.selectedGenres.map { $0.id }
    let language = Language.current.rawValue
    let contentTypes = onboardingService.contentTypes

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
  private func loadUserCollectionIds() async -> Set<Int> {
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

  @MainActor
  private func loadTrendingItems() async {
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

  @MainActor
  private func loadContentTypeItems() async {
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

  @MainActor
  private func loadContextualSections() async {
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

  @MainActor
  private func loadTopRatedItems() async {
    if let cached = cache.topRatedItems, !cached.isEmpty {
      topRatedItems = cached
      return
    }

    let language = Language.current.rawValue
    let contentTypes = onboardingService.contentTypes

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

  // MARK: - Existing Loaders

  @MainActor
  private func loadDiscoveryContent() async {
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

  @MainActor
  private func loadUser(forceRefresh: Bool = false) async {
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

  @MainActor
  private func loadWatchingItems(forceRefresh: Bool = false) async {
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
                knownForDepartment: nil
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
                knownForDepartment: nil
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

  @MainActor
  private func loadWatchlistItems(forceRefresh: Bool = false) async {
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
                knownForDepartment: nil
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
                knownForDepartment: nil
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
  private func loadLocalWatchlistItems() async {
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
              knownForDepartment: nil
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
              knownForDepartment: nil
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

// MARK: - Featured Hero Card (Apple TV+ style)
struct FeaturedHeroCard: View {
  let item: SearchResult
  var label: String = "Featured"

  var body: some View {
    NavigationLink {
      MediaDetailView(
        mediaId: item.id,
        mediaType: item.mediaType ?? "movie"
      )
    } label: {
      GeometryReader { geometry in
        ZStack(alignment: .bottomLeading) {
          // Backdrop image (full resolution)
          CachedAsyncImage(url: item.hdBackdropURL ?? item.backdropURL) { image in
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
              .frame(width: geometry.size.width, height: geometry.size.height)
              .clipped()
          } placeholder: {
            Rectangle()
              .fill(Color.appInputFilled)
              .frame(width: geometry.size.width, height: geometry.size.height)
          }

          // Gradient overlay
          LinearGradient(
            stops: [
              .init(color: .clear, location: 0),
              .init(color: .clear, location: 0.3),
              .init(color: Color.black.opacity(0.4), location: 0.6),
              .init(color: Color.black.opacity(0.85), location: 1),
            ],
            startPoint: .top,
            endPoint: .bottom
          )

          // Content overlay
          VStack(alignment: .leading, spacing: 6) {
            // Label pill
            Text(label.uppercased())
              .font(.system(size: 10, weight: .bold))
              .tracking(1.2)
              .foregroundColor(.white.opacity(0.8))
              .padding(.horizontal, 8)
              .padding(.vertical, 3)
              .background(Color.white.opacity(0.15))
              .clipShape(Capsule())

            Spacer()

            // Title
            Text(item.displayTitle)
              .font(.system(size: 22, weight: .bold))
              .foregroundColor(.white)
              .lineLimit(2)

            // Year + media type
            if let year = item.year {
              HStack(spacing: 6) {
                Text(year)
                  .font(.system(size: 13, weight: .medium))
                  .foregroundColor(.white.opacity(0.7))

                if let mediaType = item.mediaType {
                  Circle()
                    .fill(Color.white.opacity(0.4))
                    .frame(width: 3, height: 3)

                  Text(mediaType == "movie" ? L10n.current.movies : L10n.current.tvSeries)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                }
              }
            }
          }
          .padding(20)
        }
      }
      .frame(height: 280)
      .clipShape(RoundedRectangle(cornerRadius: 24))
      .posterBorder(cornerRadius: 24)
      .shadow(color: .black.opacity(0.2), radius: 16, x: 0, y: 8)
    }
    .buttonStyle(.plain)
  }
}

// MARK: - Featured Hero Skeleton
struct FeaturedHeroSkeleton: View {
  var body: some View {
    RoundedRectangle(cornerRadius: 24)
      .fill(Color.appBorderAdaptive)
      .frame(height: 280)
  }
}

// MARK: - For You Section
struct ForYouSection: View {
  let items: [SearchResult]
  let title: String
  let subtitle: String

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      VStack(alignment: .leading, spacing: 4) {
        Text(title)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)

        if !subtitle.isEmpty {
          Text(subtitle)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
      .padding(.horizontal, 24)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(items.prefix(15)) { item in
            NavigationLink {
              MediaDetailView(
                mediaId: item.id,
                mediaType: item.mediaType ?? "movie"
              )
            } label: {
              HomePosterCard(item: item)
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 4)
      }
      .scrollClipDisabled()
    }
  }
}

// MARK: - Trending Section (backdrop cards, 80% width peek)
struct TrendingSection: View {
  let items: [SearchResult]
  let title: String

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(title)
        .font(.title3.bold())
        .foregroundColor(.appForegroundAdaptive)
        .padding(.horizontal, 24)

      GeometryReader { proxy in
        let cardWidth = proxy.size.width * 0.80

        ScrollView(.horizontal, showsIndicators: false) {
          HStack(spacing: 12) {
            ForEach(Array(items.prefix(10).enumerated()), id: \.element.id) { index, item in
              NavigationLink {
                MediaDetailView(
                  mediaId: item.id,
                  mediaType: item.mediaType ?? "movie"
                )
              } label: {
                TrendingCard(item: item, rank: index + 1)
                  .frame(width: cardWidth)
              }
              .buttonStyle(.plain)
            }
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 4)
        }
        .scrollClipDisabled()
      }
      .frame(height: 240)
    }
  }
}

// MARK: - Trending Card (backdrop hero with rank badge)
struct TrendingCard: View {
  let item: SearchResult
  let rank: Int

  var body: some View {
    GeometryReader { geometry in
      ZStack(alignment: .bottomLeading) {
        // Backdrop image (full resolution, same as MediaDetailView)
        CachedAsyncImage(url: item.hdBackdropURL ?? item.backdropURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(width: geometry.size.width, height: geometry.size.height)
            .clipped()
        } placeholder: {
          Rectangle()
            .fill(Color.appInputFilled)
            .frame(width: geometry.size.width, height: geometry.size.height)
        }

        // Bottom gradient
        LinearGradient(
          stops: [
            .init(color: .clear, location: 0),
            .init(color: .clear, location: 0.35),
            .init(color: Color.black.opacity(0.5), location: 0.65),
            .init(color: Color.black.opacity(0.9), location: 1),
          ],
          startPoint: .top,
          endPoint: .bottom
        )

        // Content overlay
        VStack(alignment: .leading, spacing: 4) {
          // Rank badge
          HStack {
            Text("#\(rank)")
              .font(.system(size: 12, weight: .bold, design: .rounded))
              .foregroundColor(.white)
              .padding(.horizontal, 8)
              .padding(.vertical, 4)
              .background(Color.white.opacity(0.2))
              .clipShape(Capsule())

            Spacer()
          }

          Spacer()

          // Title
          Text(item.displayTitle)
            .font(.system(size: 17, weight: .bold))
            .foregroundColor(.white)
            .lineLimit(1)

          // Year + type
          if let year = item.year {
            HStack(spacing: 5) {
              Text(year)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white.opacity(0.7))

              if let mediaType = item.mediaType {
                Circle()
                  .fill(Color.white.opacity(0.4))
                  .frame(width: 3, height: 3)

                Text(mediaType == "movie" ? L10n.current.movies : L10n.current.tvSeries)
                  .font(.system(size: 12, weight: .medium))
                  .foregroundColor(.white.opacity(0.7))
              }
            }
          }
        }
        .padding(14)
      }
    }
    .frame(height: 230)
    .clipShape(RoundedRectangle(cornerRadius: 20))
    .posterBorder(cornerRadius: 20)
    .shadow(color: .black.opacity(0.15), radius: 10, x: 0, y: 6)
  }
}

// MARK: - Home Header View
struct HomeHeaderView: View {
  let greeting: String
  let username: String?
  let avatarURL: URL?
  let isLoading: Bool
  var isGuestMode: Bool = false
  var onAvatarTapped: (() -> Void)?
  var onAvatarLongPressed: (() -> Void)?

  var body: some View {
    HStack(spacing: 16) {
      if isLoading {
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 180, height: 24)
      } else if let username {
        if isGuestMode {
          // Guest mode: show name without @ prefix
          (Text("\(greeting), ")
            .font(.title2.bold())
            .foregroundColor(.appForegroundAdaptive)
            + Text(username)
            .font(.title2.bold())
            .foregroundColor(.appMutedForegroundAdaptive))
        } else {
          // Authenticated: show @username
          (Text("\(greeting), ")
            .font(.title2.bold())
            .foregroundColor(.appForegroundAdaptive)
            + Text("@\(username)")
            .font(.title2.bold())
            .foregroundColor(.appMutedForegroundAdaptive))
        }
      } else {
        Text(greeting)
          .font(.title2.bold())
          .foregroundColor(.appForegroundAdaptive)
      }

      Spacer()

      if isLoading {
        Circle()
          .fill(Color.appBorderAdaptive)
          .frame(width: 44, height: 44)
      } else {
        ProfileAvatar(avatarURL: avatarURL, username: username ?? "", size: 44)
          .onTapGesture {
            onAvatarTapped?()
          }
          .onLongPressGesture(minimumDuration: 3) {
            // Secret debug gesture: long press 3s to reset onboarding
            onAvatarLongPressed?()
          }
      }
    }
  }
}

// MARK: - Home Section Card
struct HomeSectionCard: View {
  let item: SearchResult

  var body: some View {
    CachedAsyncImage(url: item.imageURL) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
        .fill(Color.appBorderAdaptive)
    }
    .frame(width: 120, height: 180)
    .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
    .posterBorder()
    .posterShadow()
  }
}

// MARK: - Continue Watching Section
struct ContinueWatchingSection: View {
  let items: [SearchResult]
  let title: String

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(title)
        .font(.title3.bold())
        .foregroundColor(.appForegroundAdaptive)
        .padding(.horizontal, 24)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(items) { item in
            NavigationLink {
              MediaDetailView(
                mediaId: item.id,
                mediaType: item.mediaType ?? "movie"
              )
            } label: {
              HomeSectionCard(item: item)
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 4)
      }
      .scrollClipDisabled()
    }
  }
}

// MARK: - Watchlist Section
struct WatchlistSection: View {
  let items: [SearchResult]
  let title: String

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(title)
        .font(.title3.bold())
        .foregroundColor(.appForegroundAdaptive)
        .padding(.horizontal, 24)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(items) { item in
            NavigationLink {
              MediaDetailView(
                mediaId: item.id,
                mediaType: item.mediaType ?? "movie"
              )
            } label: {
              HomeSectionCard(item: item)
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 4)
      }
      .scrollClipDisabled()
    }
  }
}

// MARK: - Home Category Type
enum HomeCategoryType {
  case movies
  case tvSeries
  case animes
  case doramas
}

// MARK: - Home Section View
struct HomeSectionView: View {
  let title: String
  let items: [SearchResult]
  let mediaType: String
  let categoryType: HomeCategoryType
  var initialMovieSubcategory: MovieSubcategory?
  var initialTVSeriesSubcategory: TVSeriesSubcategory?

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      NavigationLink {
        CategoryListView(
          categoryType: categoryType,
          initialMovieSubcategory: initialMovieSubcategory,
          initialTVSeriesSubcategory: initialTVSeriesSubcategory
        )
      } label: {
        HStack(spacing: 6) {
          Text(title)
            .font(.title3.bold())
            .foregroundColor(.appForegroundAdaptive)

          Image(systemName: "chevron.right")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(.appMutedForegroundAdaptive)

          Spacer()
        }
        .padding(.horizontal, 24)
      }

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(items.prefix(10)) { item in
            NavigationLink {
              MediaDetailView(
                mediaId: item.id,
                mediaType: mediaType
              )
            } label: {
              HomePosterCard(item: item)
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 4)
      }
      .scrollClipDisabled()
    }
  }
}

// MARK: - Home Poster Card
struct HomePosterCard: View {
  let item: SearchResult

  var body: some View {
    CachedAsyncImage(url: item.imageURL) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
        .fill(Color.appBorderAdaptive)
    }
    .frame(width: 120, height: 180)
    .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
    .posterBorder()
    .posterShadow()
  }
}

// MARK: - Home Section Skeleton
struct HomeSectionSkeleton: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      // Title skeleton - matches .font(.title3) height
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive)
        .frame(width: 160, height: 20)
        .padding(.horizontal, 24)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(0..<5, id: \.self) { _ in
            RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
              .fill(Color.appBorderAdaptive)
              .frame(width: 120, height: 180)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 4)
      }
      .scrollClipDisabled()
    }
  }
}
