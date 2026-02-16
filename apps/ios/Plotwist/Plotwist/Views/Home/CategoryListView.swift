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
  @State private var isLoading = true
  @State private var isLoadingMore = false
  @State private var currentPage = 1
  @State private var totalPages = 1
  @State private var strings = L10n.current
  @State private var selectedMovieSubcategory: MovieSubcategory = .popular
  @State private var selectedTVSeriesSubcategory: TVSeriesSubcategory = .popular
  @State private var selectedAnimeType: AnimeType = .tvSeries
  @State private var loadingTask: Task<Void, Never>?
  @ObservedObject private var themeManager = ThemeManager.shared
  @ObservedObject private var preferencesManager = UserPreferencesManager.shared
  @State private var hasAppliedInitialSubcategory = false
  @State private var showPreferences = false
  @State private var streamingProviders: [StreamingProvider] = []

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
    ScrollView {
      VStack(alignment: .leading, spacing: 0) {
        if isLoading && gridItems.isEmpty {
          // Loading skeleton
          LazyVGrid(columns: columns, spacing: 16) {
            ForEach(0..<12, id: \.self) { _ in
              RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
                .fill(Color.appBorderAdaptive)
                .aspectRatio(2 / 3, contentMode: .fit)
            }
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 24)
        } else {
          // Filter pills
          if preferencesManager.hasAnyPreference {
            categoryFilterChips
              .padding(.top, 12)
              .padding(.bottom, 16)
          }

          LazyVGrid(columns: columns, spacing: 16) {
            ForEach(gridItems) { item in
              NavigationLink {
                MediaDetailView(mediaId: item.id, mediaType: mediaType)
              } label: {
                CategoryPosterCard(item: item)
              }
              .buttonStyle(.plain)
              .transition(.identity)
              .onAppear {
                if item.id == items.suffix(6).first?.id && hasMorePages && !isLoadingMore {
                  Task {
                    await loadMoreItems()
                  }
                }
              }
            }
            .animation(nil, value: gridItems.map { $0.id })

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
    }
    .background(Color.appBackgroundAdaptive)
    .contentTransition(.identity)
  }

  // MARK: - Filter Chips (no content types, only genres + region/streaming)

  private var categorySelectedProviders: [StreamingProvider] {
    let ids = preferencesManager.watchProvidersIds
    return streamingProviders.filter { ids.contains($0.providerId) }
  }

  private var categoryGenreSummary: String? {
    let genres = preferencesManager.genreIds
    guard !genres.isEmpty else { return nil }
    let names = genres.prefix(3).map { OnboardingGenre(id: $0, name: "").name }
    var text = names.joined(separator: ", ")
    if genres.count > 3 { text += " +\(genres.count - 3)" }
    return text
  }

  private var categoryFilterChips: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 8) {
        // Edit button
        Button { showPreferences = true } label: {
          Image(systemName: "slider.horizontal.3")
            .font(.system(size: 12))
            .foregroundColor(.appMutedForegroundAdaptive)
            .padding(.horizontal, 12)
            .frame(height: 34)
            .background(Color.appInputFilled)
            .clipShape(Capsule())
        }

        // Genres pill
        if let genreText = categoryGenreSummary {
          Button { showPreferences = true } label: {
            Text(genreText)
              .font(.footnote.weight(.medium))
              .foregroundColor(.appForegroundAdaptive)
              .padding(.horizontal, 12)
              .frame(height: 34)
              .background(Color.appInputFilled)
              .clipShape(Capsule())
          }
          .buttonStyle(.plain)
        }

        // Region + Streaming pill
        if preferencesManager.watchRegion != nil || !categorySelectedProviders.isEmpty {
          Button { showPreferences = true } label: {
            HStack(spacing: 8) {
              if let region = preferencesManager.watchRegion {
                HStack(spacing: 4) {
                  Text(flagEmoji(for: region))
                    .font(.system(size: 14))
                  Text(regionName(for: region))
                    .font(.footnote.weight(.medium))
                    .foregroundColor(.appForegroundAdaptive)
                }
              }

              if preferencesManager.watchRegion != nil && !categorySelectedProviders.isEmpty {
                Rectangle()
                  .fill(Color.appBackgroundAdaptive)
                  .frame(width: 1.5)
              }

              if !categorySelectedProviders.isEmpty {
                HStack(spacing: -8) {
                  ForEach(Array(categorySelectedProviders.prefix(5).enumerated()), id: \.element.id) { index, provider in
                    CachedAsyncImage(url: provider.logoURL) { image in
                      image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                      RoundedRectangle(cornerRadius: 6).fill(Color.appBorderAdaptive)
                    }
                    .frame(width: 24, height: 24)
                    .clipShape(RoundedRectangle(cornerRadius: 6))
                    .overlay(
                      RoundedRectangle(cornerRadius: 6)
                        .stroke(Color.appInputFilled, lineWidth: 1.5)
                    )
                    .zIndex(Double(categorySelectedProviders.count - index))
                  }
                }

                if categorySelectedProviders.count > 5 {
                  Text("+\(categorySelectedProviders.count - 5)")
                    .font(.footnote.weight(.medium))
                    .foregroundColor(.appMutedForegroundAdaptive)
                }
              }
            }
            .padding(.horizontal, 12)
            .frame(height: 34)
            .background(Color.appInputFilled)
            .clipShape(Capsule())
          }
          .buttonStyle(.plain)
        }
      }
      .padding(.horizontal, 24)
    }
    .scrollClipDisabled()
    .sheet(isPresented: $showPreferences) {
      PreferencesQuickSheet()
    }
  }

  private func regionName(for code: String) -> String {
    let locale = Locale(identifier: Language.current.rawValue)
    return locale.localizedString(forRegionCode: code) ?? code
  }

  private func flagEmoji(for code: String) -> String {
    let base: UInt32 = 127397
    var emoji = ""
    for scalar in code.uppercased().unicodeScalars {
      if let unicode = UnicodeScalar(base + scalar.value) {
        emoji.append(String(unicode))
      }
    }
    return emoji
  }

  private func loadCategoryStreamingProviders() async {
    guard let region = preferencesManager.watchRegion,
          !preferencesManager.watchProvidersIds.isEmpty else { return }
    do {
      streamingProviders = try await TMDBService.shared.getStreamingProviders(
        watchRegion: region,
        language: Language.current.rawValue
      )
    } catch {
      streamingProviders = []
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
            CategoryTabsView(selectedTab: $selectedMovieSubcategory)
          } else if categoryType == .tvSeries {
            CategoryTabsView(selectedTab: $selectedTVSeriesSubcategory)
          } else if categoryType == .animes {
            CategoryTabsView(selectedTab: $selectedAnimeType)
          } else {
            Rectangle()
              .fill(Color.appBorderAdaptive)
              .frame(height: 1)
          }
        }

        // Content
        contentGrid(items: items)
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
      await loadCategoryStreamingProviders()
    }
    .onChange(of: selectedMovieSubcategory) {
      loadingTask?.cancel()
      loadingTask = Task { await loadItems() }
    }
    .onChange(of: selectedTVSeriesSubcategory) {
      loadingTask?.cancel()
      loadingTask = Task { await loadItems() }
    }
    .onChange(of: selectedAnimeType) {
      loadingTask?.cancel()
      loadingTask = Task { await loadItems() }
    }
    .onReceive(NotificationCenter.default.publisher(for: .profileUpdated)) { _ in
      Task {
        await loadItems()
        await loadCategoryStreamingProviders()
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

      // If task was cancelled (user switched tab), discard stale results
      guard !Task.isCancelled else { return }

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
      guard !Task.isCancelled else { return }
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
