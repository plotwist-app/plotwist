//
//  CategoryListView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Category Tab Protocol
protocol CategoryTab: Hashable, CaseIterable {
  var title: String { get }
  var isDisabled: Bool { get }
}

// MARK: - Movie Subcategory
enum MovieSubcategory: CaseIterable, CategoryTab {
  case popular
  case nowPlaying
  case topRated
  case upcoming
  case discover

  var title: String {
    let strings = L10n.current
    switch self {
    case .popular: return strings.popular
    case .nowPlaying: return strings.nowPlaying
    case .topRated: return strings.topRated
    case .upcoming: return strings.upcoming
    case .discover: return strings.discover
    }
  }

  var isDisabled: Bool {
    self == .discover
  }
}

// MARK: - TV Series Subcategory
enum TVSeriesSubcategory: CaseIterable, CategoryTab {
  case popular
  case airingToday
  case onTheAir
  case topRated
  case discover

  var title: String {
    let strings = L10n.current
    switch self {
    case .popular: return strings.popular
    case .airingToday: return strings.airingToday
    case .onTheAir: return strings.onTheAir
    case .topRated: return strings.topRated
    case .discover: return strings.discover
    }
  }

  var isDisabled: Bool {
    self == .discover
  }
}

// MARK: - Anime Type
enum AnimeType: CaseIterable, CategoryTab {
  case tvSeries
  case movies

  var title: String {
    let strings = L10n.current
    switch self {
    case .tvSeries: return strings.tvSeries
    case .movies: return strings.movies
    }
  }

  var isDisabled: Bool {
    false
  }
}

// MARK: - Category Tabs View (same style as Profile tabs)
struct CategoryTabsView<Tab: CategoryTab>: View where Tab.AllCases: RandomAccessCollection {
  @Binding var selectedTab: Tab
  var onTabChange: ((_ fromTrailing: Bool) -> Void)?
  @Namespace private var tabNamespace
  
  private func index(of tab: Tab) -> Int {
    Array(Tab.allCases).firstIndex(of: tab) ?? 0
  }

  var body: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 0) {
        ForEach(Array(Tab.allCases), id: \.self) { tab in
          Button {
            if !tab.isDisabled {
              let fromTrailing = index(of: tab) > index(of: selectedTab)
              withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                selectedTab = tab
              }
              onTabChange?(fromTrailing)
            }
          } label: {
            VStack(spacing: 8) {
              Text(tab.title)
                .font(.subheadline.weight(.medium))
                .foregroundColor(
                  tab.isDisabled
                    ? .appMutedForegroundAdaptive.opacity(0.5)
                    : (selectedTab == tab
                        ? .appForegroundAdaptive
                        : .appMutedForegroundAdaptive)
                )
                .padding(.horizontal, 16)

              // Sliding indicator
              ZStack {
                Rectangle()
                  .fill(Color.clear)
                  .frame(height: 3)

                if selectedTab == tab {
                  Rectangle()
                    .fill(Color.appForegroundAdaptive)
                    .frame(height: 3)
                    .matchedGeometryEffect(id: "categoryTabIndicator", in: tabNamespace)
                }
              }
            }
          }
          .buttonStyle(.plain)
          .disabled(tab.isDisabled)
        }
      }
      .padding(.horizontal, 8)
    }
    .overlay(
      Rectangle()
        .fill(Color.appBorderAdaptive)
        .frame(height: 1),
      alignment: .bottom
    )
  }
}

struct CategoryListView: View {
  let categoryType: HomeCategoryType
  var initialMovieSubcategory: MovieSubcategory?
  var initialTVSeriesSubcategory: TVSeriesSubcategory?

  @Environment(\.dismiss) private var dismiss
  @State private var items: [SearchResult] = []
  @State private var previousItems: [SearchResult] = []
  @State private var isLoading = true
  @State private var isLoadingMore = false
  @State private var currentPage = 1
  @State private var totalPages = 1
  @State private var strings = L10n.current
  @State private var selectedMovieSubcategory: MovieSubcategory = .popular
  @State private var selectedTVSeriesSubcategory: TVSeriesSubcategory = .popular
  @State private var selectedAnimeType: AnimeType = .tvSeries
  @State private var currentOffset: CGFloat = 0
  @State private var previousOffset: CGFloat = UIScreen.main.bounds.width * 2  // Start off-screen
  @State private var isAnimating: Bool = false
  @ObservedObject private var themeManager = ThemeManager.shared
  @ObservedObject private var preferencesManager = UserPreferencesManager.shared
  @State private var hasAppliedInitialSubcategory = false

  private var title: String {
    switch categoryType {
    case .movies: return strings.movies
    case .tvSeries: return strings.tvSeries
    case .animes: return strings.animes
    case .doramas: return strings.doramas
    }
  }

  private var mediaType: String {
    switch categoryType {
    case .movies: return "movie"
    case .tvSeries, .doramas: return "tv"
    case .animes: return selectedAnimeType == .movies ? "movie" : "tv"
    }
  }

  private var hasMorePages: Bool {
    currentPage < totalPages
  }

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]
  
  @ViewBuilder
  private func contentGrid(items gridItems: [SearchResult]) -> some View {
    if isLoading && gridItems.isEmpty {
      ScrollView {
        LazyVGrid(columns: columns, spacing: 16) {
          ForEach(0..<12, id: \.self) { _ in
            RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
              .fill(Color.appBorderAdaptive)
              .aspectRatio(2 / 3, contentMode: .fit)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 24)
      }
    } else {
      ScrollView {
        VStack(alignment: .leading, spacing: 0) {
          // Preferences Badge
          HStack {
            PreferencesBadge()
            Spacer()
          }
          .padding(.horizontal, 24)
          .padding(.top, 16)
          .padding(.bottom, 16)

          LazyVGrid(columns: columns, spacing: 16) {
            ForEach(gridItems) { item in
              NavigationLink {
                MediaDetailView(mediaId: item.id, mediaType: mediaType)
              } label: {
                CategoryPosterCard(item: item)
              }
              .buttonStyle(.plain)
              .onAppear {
                if item.id == items.suffix(6).first?.id && hasMorePages && !isLoadingMore {
                  Task {
                    await loadMoreItems()
                  }
                }
              }
            }

            if isLoadingMore {
              ForEach(0..<3, id: \.self) { _ in
                RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
                  .fill(Color.appBorderAdaptive)
                  .aspectRatio(2 / 3, contentMode: .fit)
              }
            }
          }
          .padding(.horizontal, 24)
          .padding(.bottom, 24)
        }
      }
      .background(Color.appBackgroundAdaptive)
    }
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(spacing: 0) {
          HStack {
            Button {
              dismiss()
            } label: {
              Image(systemName: "chevron.left")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 40, height: 40)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }

            Spacer()

            Text(title)
              .font(.headline)
              .foregroundColor(.appForegroundAdaptive)

            Spacer()

            Color.clear
              .frame(width: 40, height: 40)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 16)

          // Tabs in header
          if categoryType == .movies {
            CategoryTabsView(
              selectedTab: $selectedMovieSubcategory,
              onTabChange: { fromTrailing in
                animateContentChange(fromTrailing: fromTrailing)
              }
            )
          } else if categoryType == .tvSeries {
            CategoryTabsView(
              selectedTab: $selectedTVSeriesSubcategory,
              onTabChange: { fromTrailing in
                animateContentChange(fromTrailing: fromTrailing)
              }
            )
          } else if categoryType == .animes {
            CategoryTabsView(
              selectedTab: $selectedAnimeType,
              onTabChange: { fromTrailing in
                animateContentChange(fromTrailing: fromTrailing)
              }
            )
          } else {
            Rectangle()
              .fill(Color.appBorderAdaptive)
              .frame(height: 1)
          }
        }

        // Content with slide animation (exactly like ProfileTabView)
        let screenWidth = UIScreen.main.bounds.width
        
        ZStack(alignment: .topLeading) {
          // Previous content
          contentGrid(items: previousItems)
            .frame(width: screenWidth, alignment: .top)
            .frame(maxHeight: .infinity, alignment: .top)
            .background(Color.appBackgroundAdaptive)
            .offset(x: previousOffset)
          
          // Current content
          contentGrid(items: items)
            .frame(width: screenWidth, alignment: .top)
            .frame(maxHeight: .infinity, alignment: .top)
            .background(Color.appBackgroundAdaptive)
            .offset(x: currentOffset)
        }
        .frame(width: screenWidth, alignment: .topLeading)
        .frame(maxHeight: .infinity, alignment: .top)
        .clipShape(Rectangle())
        .animation(.spring(response: 0.4, dampingFraction: 0.88), value: currentOffset)
        .animation(.spring(response: 0.4, dampingFraction: 0.88), value: previousOffset)
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .task {
      if !hasAppliedInitialSubcategory {
        if let initialMovie = initialMovieSubcategory {
          selectedMovieSubcategory = initialMovie
        }
        if let initialTVSeries = initialTVSeriesSubcategory {
          selectedTVSeriesSubcategory = initialTVSeries
        }
        hasAppliedInitialSubcategory = true
      }
      await loadItems()
    }
  }
  
  private func animateContentChange(fromTrailing: Bool) {
    guard !isAnimating else { return }
    isAnimating = true
    
    let screenWidth = UIScreen.main.bounds.width
    
    // When navigating to a tab on the RIGHT (fromTrailing = true):
    // - Previous content exits to the LEFT (negative offset)
    // - New content enters from the RIGHT (starts positive, animates to 0)
    let exitOffset = fromTrailing ? -screenWidth : screenWidth
    let enterOffset = fromTrailing ? screenWidth : -screenWidth
    
    // Step 1: Save current items as previous
    previousItems = items
    
    // Step 2: Set initial positions WITHOUT animation
    var transaction = Transaction()
    transaction.disablesAnimations = true
    withTransaction(transaction) {
      previousOffset = 0
      currentOffset = enterOffset
    }
    
    // Step 3: Load new items and trigger animation
    Task {
      await loadItems()
      
      await MainActor.run {
        // Just change the values - implicit animation will handle it
        previousOffset = exitOffset
        currentOffset = 0
        
        // Clean up after animation (0.5s for spring to settle)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
          var cleanupTransaction = Transaction()
          cleanupTransaction.disablesAnimations = true
          withTransaction(cleanupTransaction) {
            previousOffset = screenWidth * 2
            previousItems = []
          }
          isAnimating = false
        }
      }
    }
  }

  private func loadItems() async {
    isLoading = true
    currentPage = 1

    let language = Language.current.rawValue
    let watchRegion = preferencesManager.watchRegion
    let watchProviders =
      preferencesManager.hasStreamingServices ? preferencesManager.watchProvidersString : nil

    do {
      let result: PaginatedResult
      switch categoryType {
      case .movies:
        result = try await loadMoviesForSubcategory(
          language: language,
          page: 1,
          watchRegion: watchRegion,
          watchProviders: watchProviders
        )
      case .tvSeries:
        result = try await loadTVSeriesForSubcategory(
          language: language,
          page: 1,
          watchRegion: watchRegion,
          watchProviders: watchProviders
        )
      case .animes:
        result = try await loadAnimesForType(
          language: language,
          page: 1,
          watchRegion: watchRegion,
          watchProviders: watchProviders
        )
      case .doramas:
        if let region = watchRegion, let providers = watchProviders {
          result = try await TMDBService.shared.discoverDoramas(
            language: language,
            page: 1,
            watchRegion: region,
            withWatchProviders: providers
          )
        } else {
          result = try await TMDBService.shared.getPopularDoramas(language: language, page: 1)
        }
      }
      items = result.results
      currentPage = result.page
      totalPages = result.totalPages
      
      // Track category viewed
      let subcategory: String
      switch categoryType {
      case .movies: subcategory = selectedMovieSubcategory.title
      case .tvSeries: subcategory = selectedTVSeriesSubcategory.title
      case .animes: subcategory = selectedAnimeType.title
      case .doramas: subcategory = "popular"
      }
      AnalyticsService.shared.track(.categoryViewed(category: title, subcategory: subcategory))
    } catch {
      items = []
    }

    isLoading = false
  }

  private func loadMoviesForSubcategory(
    language: String,
    page: Int,
    watchRegion: String? = nil,
    watchProviders: String? = nil
  ) async throws -> PaginatedResult {
    // When streaming services are selected, use discover for popular
    if let region = watchRegion, let providers = watchProviders,
      selectedMovieSubcategory == .popular
    {
      return try await TMDBService.shared.discoverMovies(
        language: language,
        page: page,
        watchRegion: region,
        withWatchProviders: providers
      )
    }

    switch selectedMovieSubcategory {
    case .nowPlaying:
      return try await TMDBService.shared.getNowPlayingMovies(language: language, page: page)
    case .popular:
      return try await TMDBService.shared.getPopularMovies(language: language, page: page)
    case .topRated:
      return try await TMDBService.shared.getTopRatedMovies(language: language, page: page)
    case .upcoming:
      return try await TMDBService.shared.getUpcomingMovies(language: language, page: page)
    case .discover:
      // Discover is disabled, fallback to popular
      return try await TMDBService.shared.getPopularMovies(language: language, page: page)
    }
  }

  private func loadTVSeriesForSubcategory(
    language: String,
    page: Int,
    watchRegion: String? = nil,
    watchProviders: String? = nil
  ) async throws -> PaginatedResult {
    // When streaming services are selected, use discover for popular
    if let region = watchRegion, let providers = watchProviders,
      selectedTVSeriesSubcategory == .popular
    {
      return try await TMDBService.shared.discoverTV(
        language: language,
        page: page,
        watchRegion: region,
        withWatchProviders: providers
      )
    }

    switch selectedTVSeriesSubcategory {
    case .airingToday:
      return try await TMDBService.shared.getAiringTodayTVSeries(language: language, page: page)
    case .onTheAir:
      return try await TMDBService.shared.getOnTheAirTVSeries(language: language, page: page)
    case .popular:
      return try await TMDBService.shared.getPopularTVSeries(language: language, page: page)
    case .topRated:
      return try await TMDBService.shared.getTopRatedTVSeries(language: language, page: page)
    case .discover:
      // Discover is disabled, fallback to popular
      return try await TMDBService.shared.getPopularTVSeries(language: language, page: page)
    }
  }

  private func loadAnimesForType(
    language: String,
    page: Int,
    watchRegion: String? = nil,
    watchProviders: String? = nil
  ) async throws -> PaginatedResult {
    if let region = watchRegion, let providers = watchProviders {
      switch selectedAnimeType {
      case .tvSeries:
        return try await TMDBService.shared.discoverAnimes(
          language: language,
          page: page,
          watchRegion: region,
          withWatchProviders: providers
        )
      case .movies:
        return try await TMDBService.shared.discoverAnimeMovies(
          language: language,
          page: page,
          watchRegion: region,
          withWatchProviders: providers
        )
      }
    }

    switch selectedAnimeType {
    case .tvSeries:
      return try await TMDBService.shared.getPopularAnimes(language: language, page: page)
    case .movies:
      return try await TMDBService.shared.getPopularAnimeMovies(language: language, page: page)
    }
  }

  private func loadMoreItems() async {
    guard hasMorePages && !isLoadingMore else { return }

    isLoadingMore = true
    let nextPage = currentPage + 1
    let language = Language.current.rawValue
    let watchRegion = preferencesManager.watchRegion
    let watchProviders =
      preferencesManager.hasStreamingServices ? preferencesManager.watchProvidersString : nil

    do {
      let result: PaginatedResult
      switch categoryType {
      case .movies:
        result = try await loadMoviesForSubcategory(
          language: language,
          page: nextPage,
          watchRegion: watchRegion,
          watchProviders: watchProviders
        )
      case .tvSeries:
        result = try await loadTVSeriesForSubcategory(
          language: language,
          page: nextPage,
          watchRegion: watchRegion,
          watchProviders: watchProviders
        )
      case .animes:
        result = try await loadAnimesForType(
          language: language,
          page: nextPage,
          watchRegion: watchRegion,
          watchProviders: watchProviders
        )
      case .doramas:
        if let region = watchRegion, let providers = watchProviders {
          result = try await TMDBService.shared.discoverDoramas(
            language: language,
            page: nextPage,
            watchRegion: region,
            withWatchProviders: providers
          )
        } else {
          result = try await TMDBService.shared.getPopularDoramas(
            language: language,
            page: nextPage
          )
        }
      }

      let newItems = result.results.filter { newItem in
        !items.contains { $0.id == newItem.id }
      }

      items.append(contentsOf: newItems)
      currentPage = result.page
      totalPages = result.totalPages
    } catch {
      // Silently fail on pagination errors
    }

    isLoadingMore = false
  }
}

// MARK: - Category Poster Card
struct CategoryPosterCard: View {
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
    .aspectRatio(2 / 3, contentMode: .fit)
    .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
    .posterBorder()
    .shadow(color: Color.black.opacity(0.15), radius: 4, x: 0, y: 2)
  }
}
