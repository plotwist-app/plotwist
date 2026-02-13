//
//  HomeTabView.swift
//  Plotwist
//

import SwiftUI

struct HomeTabView: View {
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @ObservedObject var onboardingService = OnboardingService.shared
  @State var strings = L10n.current
  @State var user: User?
  @State var watchingItems: [SearchResult] = []
  @State var watchlistItems: [SearchResult] = []
  @State var isInitialLoad = true
  @State var needsRefresh = false
  @State var hasAppeared = false

  // Discovery sections
  @State var popularMovies: [SearchResult] = []
  @State var popularTVSeries: [SearchResult] = []
  @State var isLoadingDiscovery = true

  // New personalized sections
  @State var featuredItem: SearchResult?
  @State var forYouItems: [SearchResult] = []
  @State var trendingItems: [SearchResult] = []
  @State var animeItems: [SearchResult] = []
  @State var doramaItems: [SearchResult] = []
  @State var nowPlayingItems: [SearchResult] = []
  @State var airingTodayItems: [SearchResult] = []
  @State var topRatedItems: [SearchResult] = []

  @Namespace private var heroAnimation
  let cache = HomeDataCache.shared

  // MARK: - Computed Properties

  var displayUsername: String? {
    if AuthService.shared.isAuthenticated {
      if let displayName = user?.displayName, !displayName.isEmpty {
        return displayName
      }
      return user?.username
    } else if !onboardingService.userName.isEmpty {
      return onboardingService.userName
    }
    return nil
  }

  var isGuestMode: Bool {
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

  // Personalization helpers — use server preferences when authenticated,
  // fall back to onboarding preferences for guest mode only.
  var activeContentTypes: Set<ContentTypePreference> {
    if AuthService.shared.isAuthenticated {
      return Set(UserPreferencesManager.shared.contentTypes)
    }
    return onboardingService.contentTypes
  }

  var showAnimeSection: Bool {
    activeContentTypes.contains(.anime)
  }

  var showDoramaSection: Bool {
    activeContentTypes.contains(.dorama)
  }

  var showMoviesContent: Bool {
    activeContentTypes.contains(.movies) || activeContentTypes.isEmpty
  }

  var showSeriesContent: Bool {
    activeContentTypes.contains(.series) || activeContentTypes.isEmpty
  }

  private var forYouSubtitle: String {
    let genreNames: [String]
    if AuthService.shared.isAuthenticated {
      genreNames = UserPreferencesManager.shared.genreIds.prefix(3).map { OnboardingGenre(id: $0, name: "").name }
    } else {
      genreNames = onboardingService.selectedGenres.prefix(3).map { $0.name }
    }
    guard !genreNames.isEmpty else { return "" }
    let joined = genreNames.joined(separator: ", ")
    return String(format: strings.basedOnYourTaste, joined)
  }

  // Top Rated section adapts title/type to user's content preference
  private var topRatedSectionTitle: String {
    let contentTypes = activeContentTypes
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
    let contentTypes = activeContentTypes
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

  // MARK: - Body

  var body: some View {
    NavigationStack {
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

              // Featured Hero Card (zoom transition)
              if let featured = featuredItem {
                NavigationLink {
                  MediaDetailView(
                    mediaId: featured.id,
                    mediaType: featured.mediaType ?? "movie",
                    initialBackdropURL: featured.hdBackdropURL ?? featured.backdropURL
                  )
                  .navigationTransition(.zoom(sourceID: "hero-\(featured.id)", in: heroAnimation))
                } label: {
                  FeaturedHeroCard(
                    item: featured,
                    label: strings.featured
                  )
                }
                .buttonStyle(.plain)
                .matchedTransitionSource(id: "hero-\(featured.id)", in: heroAnimation)
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
              } else if showDiscoverySkeleton && (AuthService.shared.isAuthenticated ? !UserPreferencesManager.shared.genreIds.isEmpty : !onboardingService.selectedGenres.isEmpty) {
                HomeSectionSkeleton()
              }

              // Trending This Week (zoom transition)
              if !trendingItems.isEmpty {
                TrendingSection(
                  items: trendingItems,
                  title: strings.trendingThisWeek,
                  namespace: heroAnimation
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
        Task {
          // Wait for updated preferences to be available before reloading
          await UserPreferencesManager.shared.loadPreferences()
          await loadUser(forceRefresh: true)
          // Preferences may have changed (genres, content types, streaming) — reload all content
          cache.clearDiscoveryCache()
          await loadData()
        }
      }
      .onReceive(NotificationCenter.default.publisher(for: .collectionCacheInvalidated)) { _ in
        needsRefresh = true
      }
      .onReceive(NotificationCenter.default.publisher(for: .homeDataCacheInvalidated)) { _ in
        needsRefresh = true
      }
  }

  // MARK: - Cache Restoration

  func restoreFromCache() {
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
}
