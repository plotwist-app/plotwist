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
  @State private var trendingItems: [SearchResult] = []
  @State private var forYouItems: [SearchResult] = []
  @State private var popularAnimes: [SearchResult] = []
  @State private var popularDoramas: [SearchResult] = []
  @State private var nowPlayingMovies: [SearchResult] = []
  @State private var airingTodayTV: [SearchResult] = []
  @State private var isLoadingDiscovery = true

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

  private var userContentTypes: Set<ContentTypePreference> {
    onboardingService.contentTypes
  }

  private var hasContentTypePreferences: Bool {
    !userContentTypes.isEmpty
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
    isLoadingDiscovery && trendingItems.isEmpty && popularMovies.isEmpty && popularTVSeries.isEmpty
  }

  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        ScrollView(showsIndicators: false) {
          VStack(alignment: .leading, spacing: 24) {
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

            // Discovery Sections - Personalized based on onboarding
            if showDiscoverySkeleton {
              HomeSectionSkeleton()
              HomeSectionSkeleton()
              HomeSectionSkeleton()
            } else {
              // Trending This Week
              if !trendingItems.isEmpty {
                HomeSectionView(
                  title: strings.trendingThisWeek,
                  items: trendingItems,
                  mediaType: "movie",
                  categoryType: .movies,
                  initialMovieSubcategory: .popular
                )
              }

              // For You - Personalized by onboarding genres
              if !forYouItems.isEmpty {
                HomeSectionView(
                  title: strings.forYou,
                  items: forYouItems,
                  mediaType: "movie",
                  categoryType: .movies,
                  initialMovieSubcategory: .popular
                )
              }

              // Now Playing in Theaters (conditional on movies preference)
              if !nowPlayingMovies.isEmpty {
                HomeSectionView(
                  title: strings.nowPlaying,
                  items: nowPlayingMovies,
                  mediaType: "movie",
                  categoryType: .movies,
                  initialMovieSubcategory: .nowPlaying
                )
              }

              // Popular Movies (conditional: show if user selected movies or has no preferences)
              if !popularMovies.isEmpty &&
                (!hasContentTypePreferences || userContentTypes.contains(.movies))
              {
                HomeSectionView(
                  title: strings.popularMovies,
                  items: popularMovies,
                  mediaType: "movie",
                  categoryType: .movies,
                  initialMovieSubcategory: .popular
                )
              }

              // Popular TV Series (conditional: show if user selected series or has no preferences)
              if !popularTVSeries.isEmpty &&
                (!hasContentTypePreferences || userContentTypes.contains(.series))
              {
                HomeSectionView(
                  title: strings.popularTVSeries,
                  items: popularTVSeries,
                  mediaType: "tv",
                  categoryType: .tvSeries,
                  initialTVSeriesSubcategory: .popular
                )
              }

              // Airing Today (conditional on series preference)
              if !airingTodayTV.isEmpty {
                HomeSectionView(
                  title: strings.airingToday,
                  items: airingTodayTV,
                  mediaType: "tv",
                  categoryType: .tvSeries,
                  initialTVSeriesSubcategory: .airingToday
                )
              }

              // Popular Animes (conditional on anime preference)
              if !popularAnimes.isEmpty {
                HomeSectionView(
                  title: strings.popularAnimes,
                  items: popularAnimes,
                  mediaType: "tv",
                  categoryType: .animes
                )
              }

              // Popular Doramas (conditional on dorama preference)
              if !popularDoramas.isEmpty {
                HomeSectionView(
                  title: strings.popularDoramas,
                  items: popularDoramas,
                  mediaType: "tv",
                  categoryType: .doramas
                )
              }
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
    if let cachedTrending = cache.trendingItems {
      trendingItems = cachedTrending
      isLoadingDiscovery = false
    }
    if let cachedForYou = cache.forYouItems {
      forYouItems = cachedForYou
      isLoadingDiscovery = false
    }
    if let cachedAnimes = cache.popularAnimes {
      popularAnimes = cachedAnimes
      isLoadingDiscovery = false
    }
    if let cachedDoramas = cache.popularDoramas {
      popularDoramas = cachedDoramas
      isLoadingDiscovery = false
    }
    if let cachedNowPlaying = cache.nowPlayingMovies {
      nowPlayingMovies = cachedNowPlaying
      isLoadingDiscovery = false
    }
    if let cachedAiringToday = cache.airingTodayTV {
      airingTodayTV = cachedAiringToday
      isLoadingDiscovery = false
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
    }

    isInitialLoad = false
  }

  @MainActor
  private func loadDiscoveryContent() async {
    // Check if we have a full cache hit
    let hasCachedCore = cache.popularMovies != nil && cache.popularTVSeries != nil && cache.trendingItems != nil
    if hasCachedCore {
      popularMovies = cache.popularMovies ?? []
      popularTVSeries = cache.popularTVSeries ?? []
      trendingItems = cache.trendingItems ?? []
      forYouItems = cache.forYouItems ?? []
      popularAnimes = cache.popularAnimes ?? []
      popularDoramas = cache.popularDoramas ?? []
      nowPlayingMovies = cache.nowPlayingMovies ?? []
      airingTodayTV = cache.airingTodayTV ?? []
      isLoadingDiscovery = false
      return
    }

    let language = Language.current.rawValue
    let contentTypes = userContentTypes

    // Load all discovery content in parallel
    await withTaskGroup(of: Void.self) { group in
      // Always load trending
      group.addTask { @MainActor in
        await self.loadTrending(language: language)
      }

      // Load "For You" if user has genre preferences
      group.addTask { @MainActor in
        await self.loadForYou(language: language)
      }

      // Load popular movies (always, but conditionally shown)
      group.addTask { @MainActor in
        await self.loadPopularMovies(language: language)
      }

      // Load popular TV series (always, but conditionally shown)
      group.addTask { @MainActor in
        await self.loadPopularTVSeries(language: language)
      }

      // Load Now Playing if user likes movies
      if !hasContentTypePreferences || contentTypes.contains(.movies) {
        group.addTask { @MainActor in
          await self.loadNowPlaying(language: language)
        }
      }

      // Load Airing Today if user likes series
      if !hasContentTypePreferences || contentTypes.contains(.series) || contentTypes.contains(.anime) {
        group.addTask { @MainActor in
          await self.loadAiringToday(language: language)
        }
      }

      // Load Popular Animes if user selected anime
      if contentTypes.contains(.anime) {
        group.addTask { @MainActor in
          await self.loadPopularAnimes(language: language)
        }
      }

      // Load Popular Doramas if user selected dorama
      if contentTypes.contains(.dorama) {
        group.addTask { @MainActor in
          await self.loadPopularDoramas(language: language)
        }
      }
    }

    isLoadingDiscovery = false
  }

  @MainActor
  private func loadTrending(language: String) async {
    do {
      let results = try await TMDBService.shared.getTrending(
        mediaType: "all",
        timeWindow: "week",
        language: language
      )
      trendingItems = Array(results.prefix(10))
      cache.setTrendingItems(trendingItems)
    } catch {
      print("Error loading trending: \(error)")
    }
  }

  @MainActor
  private func loadForYou(language: String) async {
    let genres = onboardingService.selectedGenres
    guard !genres.isEmpty else { return }

    let genreIds = genres.map { $0.id }
    let contentTypes = userContentTypes

    do {
      var allResults: [SearchResult] = []

      // Discover based on user's content type preferences
      if contentTypes.isEmpty || contentTypes.contains(.movies) {
        let movieResults = try await TMDBService.shared.discoverByGenres(
          mediaType: "movie",
          genreIds: genreIds,
          language: language
        )
        allResults.append(contentsOf: movieResults)
      }

      if contentTypes.isEmpty || contentTypes.contains(.series) || contentTypes.contains(.anime) || contentTypes.contains(.dorama) {
        let tvResults = try await TMDBService.shared.discoverByGenres(
          mediaType: "tv",
          genreIds: genreIds,
          language: language
        )
        allResults.append(contentsOf: tvResults)
      }

      // Shuffle and take top 10 for variety
      forYouItems = Array(allResults.shuffled().prefix(10))
      cache.setForYouItems(forYouItems)
    } catch {
      print("Error loading for you: \(error)")
    }
  }

  @MainActor
  private func loadPopularMovies(language: String) async {
    do {
      let result = try await TMDBService.shared.getPopularMovies(language: language)
      popularMovies = result.results
      cache.setPopularMovies(result.results)
    } catch {
      print("Error loading popular movies: \(error)")
    }
  }

  @MainActor
  private func loadPopularTVSeries(language: String) async {
    do {
      let result = try await TMDBService.shared.getPopularTVSeries(language: language)
      popularTVSeries = result.results
      cache.setPopularTVSeries(result.results)
    } catch {
      print("Error loading popular TV series: \(error)")
    }
  }

  @MainActor
  private func loadNowPlaying(language: String) async {
    do {
      let result = try await TMDBService.shared.getNowPlayingMovies(language: language)
      nowPlayingMovies = result.results
      cache.setNowPlayingMovies(result.results)
    } catch {
      print("Error loading now playing: \(error)")
    }
  }

  @MainActor
  private func loadAiringToday(language: String) async {
    do {
      let result = try await TMDBService.shared.getAiringTodayTVSeries(language: language)
      airingTodayTV = result.results
      cache.setAiringTodayTV(result.results)
    } catch {
      print("Error loading airing today: \(error)")
    }
  }

  @MainActor
  private func loadPopularAnimes(language: String) async {
    do {
      let result = try await TMDBService.shared.getPopularAnimes(language: language)
      popularAnimes = result.results
      cache.setPopularAnimes(result.results)
    } catch {
      print("Error loading popular animes: \(error)")
    }
  }

  @MainActor
  private func loadPopularDoramas(language: String) async {
    do {
      let result = try await TMDBService.shared.getPopularDoramas(language: language)
      popularDoramas = result.results
      cache.setPopularDoramas(result.results)
    } catch {
      print("Error loading popular doramas: \(error)")
    }
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
        .font(.headline)
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
        .font(.headline)
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
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)

          Image(systemName: "chevron.right")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(.appForegroundAdaptive)

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
      // Title skeleton - matches .font(.headline) height
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive)
        .frame(width: 140, height: 17)
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
