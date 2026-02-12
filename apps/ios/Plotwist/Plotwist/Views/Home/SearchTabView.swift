//
//  SearchTabView.swift
//  Plotwist
//

import SwiftUI

struct SearchTabView: View {
  @State private var searchText = ""
  @State private var submittedSearchText = ""
  @State private var results: [SearchResult] = []
  @State private var autocompleteSuggestions: [SearchResult] = []
  @State private var popularMovies: [SearchResult] = []
  @State private var popularTVSeries: [SearchResult] = []
  @State private var popularAnimes: [SearchResult] = []
  @State private var popularDoramas: [SearchResult] = []
  @State private var isLoading = false
  @State private var isLoadingAutocomplete = false
  @State private var isLoadingPopular = false
  @State private var isInitialLoad = true
  @State private var hasAppeared = false
  @State private var strings = L10n.current
  @State private var recentSearches: [String] = []
  @State private var hasSubmittedSearch = false
  @State private var autocompleteTask: Task<Void, Never>?
  @ObservedObject private var preferencesManager = UserPreferencesManager.shared

  private let cache = SearchDataCache.shared
  private let recentSearchesKey = "recentSearches"
  private let maxRecentSearches = 10

  private var movies: [SearchResult] {
    results.filter { $0.mediaType == "movie" }
  }

  private var tvSeries: [SearchResult] {
    results.filter { $0.mediaType == "tv" }
  }

  private var people: [SearchResult] {
    results.filter { $0.mediaType == "person" }
  }

  private var showRecentSearches: Bool {
    searchText.isEmpty && !recentSearches.isEmpty && !hasSubmittedSearch
  }

  private var showAutocomplete: Bool {
    !searchText.isEmpty && !hasSubmittedSearch
  }

  private var showResults: Bool {
    hasSubmittedSearch && !submittedSearchText.isEmpty
  }

  // MARK: - Sub Views

  private var skeletonView: some View {
    ScrollView {
      LazyVStack(alignment: .leading, spacing: 24) {
        SearchSkeletonSection()
        SearchSkeletonSection()
      }
      .padding(.horizontal, 24)
      .padding(.vertical, 24)
    }
  }

  private var autocompleteView: some View {
    ScrollView(showsIndicators: false) {
      VStack(alignment: .leading, spacing: 16) {
        Text(strings.youAreLookingFor)
          .font(.headline)
          .foregroundColor(.appForegroundAdaptive)
          .padding(.horizontal, 24)
          .padding(.top, 16)

        VStack(spacing: 0) {
          Button {
            submitSearch(query: searchText)
          } label: {
            HStack(spacing: 12) {
              Image(systemName: "magnifyingglass")
                .font(.system(size: 16))
                .foregroundColor(.appMutedForegroundAdaptive)

              Text(searchText)
                .font(.body)
                .foregroundColor(.appForegroundAdaptive)
                .lineLimit(1)

              Spacer()
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
          }
          .buttonStyle(.plain)

          if isLoadingAutocomplete && autocompleteSuggestions.isEmpty {
            Rectangle()
              .fill(Color.appBorderAdaptive)
              .frame(height: 1)
              .padding(.leading, 60)

            HStack {
              Spacer()
              ProgressView()
                .scaleEffect(0.8)
              Spacer()
            }
            .padding(.vertical, 16)
          } else if !autocompleteSuggestions.isEmpty {
            ForEach(autocompleteSuggestions.prefix(8)) { suggestion in
              Rectangle()
                .fill(Color.appBorderAdaptive)
                .frame(height: 1)
                .padding(.leading, 60)

              Button {
                submitSearch(query: suggestion.displayTitle)
              } label: {
                HStack(spacing: 12) {
                  Image(systemName: "sparkles")
                    .font(.system(size: 16))
                    .foregroundColor(.appMutedForegroundAdaptive)

                  Text(suggestion.displayTitle)
                    .font(.body)
                    .foregroundColor(.appForegroundAdaptive)
                    .lineLimit(1)

                  Spacer()
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
              }
              .buttonStyle(.plain)
            }
          }
        }
      }
      .padding(.bottom, 80)
    }
  }

  @ViewBuilder
  private var resultsView: some View {
    if results.isEmpty {
      Spacer()
      Text(strings.noResults)
        .foregroundColor(.appMutedForegroundAdaptive)
      Spacer()
    } else {
      ScrollView {
        LazyVStack(alignment: .leading, spacing: 24) {
          if preferencesManager.hasAnyPreference {
            PreferencesBadge()
          }

          ForEach(orderedResultSections, id: \.title) { section in
            SearchSection(title: section.title, results: section.results)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 24)
      }
    }
  }

  /// Orders result sections based on content type preferences.
  private var orderedResultSections: [(title: String, results: [SearchResult])] {
    let userContentTypes = preferencesManager.contentTypes
    var sections: [(title: String, results: [SearchResult])] = []

    if !userContentTypes.isEmpty {
      // Add sections in preference order first
      for type in userContentTypes {
        switch type {
        case .movies where !movies.isEmpty:
          sections.append((title: strings.movies, results: movies))
        case .series, .anime, .dorama:
          if !tvSeries.isEmpty && !sections.contains(where: { $0.title == strings.tvSeries }) {
            sections.append((title: strings.tvSeries, results: tvSeries))
          }
        default: break
        }
      }
      // Append any missing sections
      if !movies.isEmpty && !sections.contains(where: { $0.title == strings.movies }) {
        sections.append((title: strings.movies, results: movies))
      }
      if !tvSeries.isEmpty && !sections.contains(where: { $0.title == strings.tvSeries }) {
        sections.append((title: strings.tvSeries, results: tvSeries))
      }
    } else {
      if !movies.isEmpty { sections.append((title: strings.movies, results: movies)) }
      if !tvSeries.isEmpty { sections.append((title: strings.tvSeries, results: tvSeries)) }
    }

    // People always last
    if !people.isEmpty { sections.append((title: strings.people, results: people)) }

    return sections
  }

  private var recentSearchesView: some View {
    ScrollView(showsIndicators: false) {
      VStack(alignment: .leading, spacing: 16) {
        HStack {
          Text(strings.recentSearches)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)

          Spacer()

          Button {
            clearRecentSearches()
          } label: {
            Text(strings.clearAll)
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)

        VStack(spacing: 0) {
          ForEach(recentSearches, id: \.self) { search in
            Button {
              submitSearch(query: search)
            } label: {
              HStack(spacing: 12) {
                Image(systemName: "clock.arrow.circlepath")
                  .font(.system(size: 16))
                  .foregroundColor(.appMutedForegroundAdaptive)

                Text(search)
                  .font(.body)
                  .foregroundColor(.appForegroundAdaptive)
                  .lineLimit(1)

                Spacer()

                Button {
                  removeRecentSearch(search)
                } label: {
                  Image(systemName: "xmark")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .frame(width: 24, height: 24)
                }
              }
              .padding(.horizontal, 24)
              .padding(.vertical, 12)
            }
            .buttonStyle(.plain)

            if search != recentSearches.last {
              Rectangle()
                .fill(Color.appBorderAdaptive)
                .frame(height: 1)
                .padding(.leading, 60)
            }
          }
        }
      }
      .padding(.bottom, 80)
    }
  }

  /// Returns popular content sections ordered by user's content type preferences.
  /// If the user selected specific content types, those appear first.
  private var popularContentView: some View {
    ScrollView(showsIndicators: false) {
      VStack(spacing: 24) {
        if preferencesManager.hasAnyPreference {
          PreferencesBadge()
            .padding(.horizontal, 24)
            .padding(.top, 16)
        }

        ForEach(orderedPopularSections, id: \.id) { section in
          section.view
        }
      }
      .padding(.bottom, 80)
    }
  }

  /// Helper to build ordered popular sections based on content type preferences.
  private var orderedPopularSections: [PopularSection] {
    let userContentTypes = preferencesManager.contentTypes
    var sections: [PopularSection] = []

    // If user has content type preferences, show those first in order
    if !userContentTypes.isEmpty {
      for type in userContentTypes {
        switch type {
        case .movies where !popularMovies.isEmpty:
          sections.append(PopularSection(id: "movies") {
            AnyView(HomeSectionView(
              title: strings.movies, items: popularMovies,
              mediaType: "movie", categoryType: .movies,
              initialMovieSubcategory: .popular
            ))
          })
        case .series where !popularTVSeries.isEmpty:
          sections.append(PopularSection(id: "tv") {
            AnyView(HomeSectionView(
              title: strings.tvSeries, items: popularTVSeries,
              mediaType: "tv", categoryType: .tvSeries,
              initialTVSeriesSubcategory: .popular
            ))
          })
        case .anime where !popularAnimes.isEmpty:
          sections.append(PopularSection(id: "anime") {
            AnyView(HomeSectionView(
              title: strings.animes, items: popularAnimes,
              mediaType: "tv", categoryType: .animes
            ))
          })
        case .dorama where !popularDoramas.isEmpty:
          sections.append(PopularSection(id: "dorama") {
            AnyView(HomeSectionView(
              title: strings.doramas, items: popularDoramas,
              mediaType: "tv", categoryType: .doramas
            ))
          })
        default: break
        }
      }
      // Append remaining sections not in user preferences
      let existingIds = Set(sections.map { $0.id })
      if !existingIds.contains("movies") && !popularMovies.isEmpty {
        sections.append(PopularSection(id: "movies") {
          AnyView(HomeSectionView(
            title: strings.movies, items: popularMovies,
            mediaType: "movie", categoryType: .movies,
            initialMovieSubcategory: .popular
          ))
        })
      }
      if !existingIds.contains("tv") && !popularTVSeries.isEmpty {
        sections.append(PopularSection(id: "tv") {
          AnyView(HomeSectionView(
            title: strings.tvSeries, items: popularTVSeries,
            mediaType: "tv", categoryType: .tvSeries,
            initialTVSeriesSubcategory: .popular
          ))
        })
      }
      if !existingIds.contains("anime") && !popularAnimes.isEmpty {
        sections.append(PopularSection(id: "anime") {
          AnyView(HomeSectionView(
            title: strings.animes, items: popularAnimes,
            mediaType: "tv", categoryType: .animes
          ))
        })
      }
      if !existingIds.contains("dorama") && !popularDoramas.isEmpty {
        sections.append(PopularSection(id: "dorama") {
          AnyView(HomeSectionView(
            title: strings.doramas, items: popularDoramas,
            mediaType: "tv", categoryType: .doramas
          ))
        })
      }
    } else {
      // No preferences: default order
      if !popularMovies.isEmpty {
        sections.append(PopularSection(id: "movies") {
          AnyView(HomeSectionView(
            title: strings.movies, items: popularMovies,
            mediaType: "movie", categoryType: .movies,
            initialMovieSubcategory: .popular
          ))
        })
      }
      if !popularTVSeries.isEmpty {
        sections.append(PopularSection(id: "tv") {
          AnyView(HomeSectionView(
            title: strings.tvSeries, items: popularTVSeries,
            mediaType: "tv", categoryType: .tvSeries,
            initialTVSeriesSubcategory: .popular
          ))
        })
      }
      if !popularAnimes.isEmpty {
        sections.append(PopularSection(id: "anime") {
          AnyView(HomeSectionView(
            title: strings.animes, items: popularAnimes,
            mediaType: "tv", categoryType: .animes
          ))
        })
      }
      if !popularDoramas.isEmpty {
        sections.append(PopularSection(id: "dorama") {
          AnyView(HomeSectionView(
            title: strings.doramas, items: popularDoramas,
            mediaType: "tv", categoryType: .doramas
          ))
        })
      }
    }
    return sections
  }

  // MARK: - Body

  var body: some View {
    NavigationStack {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        VStack(spacing: 0) {
          if isLoadingPopular && isInitialLoad && cache.shouldShowSkeleton {
            skeletonView
          } else if isLoading && hasSubmittedSearch {
            skeletonView
          } else if showAutocomplete {
            autocompleteView
          } else if showResults {
            resultsView
          } else if showRecentSearches {
            recentSearchesView
          } else {
            popularContentView
          }
        }
      }
      .searchable(
        text: $searchText,
        placement: .navigationBarDrawer(displayMode: .always),
        prompt: strings.searchPlaceholder
      )
      .onSubmit(of: .search) {
        submitSearch(query: searchText)
      }
    }
    .onAppear {
      if !hasAppeared {
        hasAppeared = true
        restoreFromCache()
        loadRecentSearches()
      }
    }
    .task {
      await loadPopularContent()
    }
    .onChange(of: searchText) { newValue in
      // Reset submitted state when user changes the text
      if newValue != submittedSearchText {
        hasSubmittedSearch = false
      }
      // Clear results when text is empty
      if newValue.isEmpty {
        results = []
        submittedSearchText = ""
        autocompleteSuggestions = []
        autocompleteTask?.cancel()
      } else {
        // Fetch autocomplete suggestions with debounce
        autocompleteTask?.cancel()
        isLoadingAutocomplete = true
        autocompleteTask = Task {
          try? await Task.sleep(nanoseconds: 300_000_000) // 300ms debounce
          guard !Task.isCancelled else { return }
          await fetchAutocompleteSuggestions(query: newValue)
        }
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
      Task {
        await loadPopularContent(forceRefresh: true)
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: .profileUpdated)) { _ in
      Task {
        // Wait for UserPreferencesManager to reload updated preferences
        await preferencesManager.loadPreferences()
        cache.clearCache()
        await loadPopularContent(forceRefresh: true)
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: .searchDataCacheInvalidated)) { _ in
      Task {
        await loadPopularContent(forceRefresh: true)
      }
    }
  }

  private func restoreFromCache() {
    if let cachedMovies = cache.popularMovies {
      popularMovies = cachedMovies
    }
    if let cachedTVSeries = cache.popularTVSeries {
      popularTVSeries = cachedTVSeries
    }
    if let cachedAnimes = cache.popularAnimes {
      popularAnimes = cachedAnimes
    }
    if let cachedDoramas = cache.popularDoramas {
      popularDoramas = cachedDoramas
    }
  }

  private func loadPopularContent(forceRefresh: Bool = false) async {
    // Check if preferences changed
    let currentPreferencesHash = "\(preferencesManager.watchRegion ?? "")-\(preferencesManager.watchProvidersString)"
    cache.setPreferencesHash(currentPreferencesHash)

    // Use cache if available and not forcing refresh
    if !forceRefresh && cache.isDataAvailable {
      restoreFromCache()
      isInitialLoad = false
      return
    }

    isLoadingPopular = true
    defer {
      isLoadingPopular = false
      isInitialLoad = false
    }

    let language = Language.current.rawValue
    let watchRegion = preferencesManager.watchRegion
    let watchProviders =
      preferencesManager.hasStreamingServices ? preferencesManager.watchProvidersString : nil

    do {
      if preferencesManager.hasStreamingServices {
        // Use discover endpoints with watch providers
        async let moviesTask = TMDBService.shared.discoverMovies(
          language: language,
          watchRegion: watchRegion,
          withWatchProviders: watchProviders
        )
        async let tvTask = TMDBService.shared.discoverTV(
          language: language,
          watchRegion: watchRegion,
          withWatchProviders: watchProviders
        )
        async let animesTask = TMDBService.shared.discoverAnimes(
          language: language,
          watchRegion: watchRegion,
          withWatchProviders: watchProviders
        )
        async let doramasTask = TMDBService.shared.discoverDoramas(
          language: language,
          watchRegion: watchRegion,
          withWatchProviders: watchProviders
        )

        let (movies, tv, animes, doramas) = try await (moviesTask, tvTask, animesTask, doramasTask)
        popularMovies = movies.results
        popularTVSeries = tv.results
        popularAnimes = animes.results
        popularDoramas = doramas.results

        // Save to cache
        cache.setPopularMovies(movies.results)
        cache.setPopularTVSeries(tv.results)
        cache.setPopularAnimes(animes.results)
        cache.setPopularDoramas(doramas.results)
      } else {
        // Use regular popular endpoints
        async let moviesTask = TMDBService.shared.getPopularMovies(language: language)
        async let tvTask = TMDBService.shared.getPopularTVSeries(language: language)
        async let animesTask = TMDBService.shared.getPopularAnimes(language: language)
        async let doramasTask = TMDBService.shared.getPopularDoramas(language: language)

        let (movies, tv, animes, doramas) = try await (moviesTask, tvTask, animesTask, doramasTask)
        popularMovies = movies.results
        popularTVSeries = tv.results
        popularAnimes = animes.results
        popularDoramas = doramas.results

        // Save to cache
        cache.setPopularMovies(movies.results)
        cache.setPopularTVSeries(tv.results)
        cache.setPopularAnimes(animes.results)
        cache.setPopularDoramas(doramas.results)
      }
    } catch {
      popularMovies = []
      popularTVSeries = []
      popularAnimes = []
      popularDoramas = []
    }
  }

  private func submitSearch(query: String) {
    guard !query.isEmpty else { return }
    
    searchText = query
    submittedSearchText = query
    hasSubmittedSearch = true
    autocompleteTask?.cancel()
    autocompleteSuggestions = []
    
    Task {
      await performSearch(query: query)
    }
  }

  private func fetchAutocompleteSuggestions(query: String) async {
    guard !query.isEmpty else {
      autocompleteSuggestions = []
      isLoadingAutocomplete = false
      return
    }

    do {
      let response = try await TMDBService.shared.searchMulti(
        query: query,
        language: Language.current.rawValue
      )
      // Only update if we're still showing autocomplete for this query
      if searchText == query && !hasSubmittedSearch {
        autocompleteSuggestions = response.results
      }
    } catch {
      autocompleteSuggestions = []
    }
    isLoadingAutocomplete = false
  }

  private func performSearch(query: String) async {
    guard !query.isEmpty else {
      results = []
      return
    }

    isLoading = true
    defer { isLoading = false }

    do {
      let response = try await TMDBService.shared.searchMulti(
        query: query,
        language: Language.current.rawValue
      )
      results = rankResultsByPreferences(response.results)
      
      // Track search event
      AnalyticsService.shared.track(.searchPerformed(query: query, resultsCount: response.results.count))
      
      // Save to recent searches if we have results
      if !response.results.isEmpty {
        saveRecentSearch(query)
      }
    } catch {
      results = []
    }
  }

  /// Ranks search results so items matching user preferences appear first.
  /// Considers content type and genre preferences.
  private func rankResultsByPreferences(_ items: [SearchResult]) -> [SearchResult] {
    let userContentTypes = preferencesManager.contentTypes
    let userGenreIds = Set(preferencesManager.genreIds)

    // If no preferences, return as-is
    guard !userContentTypes.isEmpty || !userGenreIds.isEmpty else { return items }

    let preferredMediaTypes = Set(userContentTypes.map { type -> String in
      switch type {
      case .movies: return "movie"
      case .series, .anime, .dorama: return "tv"
      }
    })

    return items.sorted { a, b in
      let scoreA = relevanceScore(for: a, preferredMediaTypes: preferredMediaTypes, userGenreIds: userGenreIds)
      let scoreB = relevanceScore(for: b, preferredMediaTypes: preferredMediaTypes, userGenreIds: userGenreIds)
      return scoreA > scoreB
    }
  }

  /// Calculates a relevance score for a search result based on user preferences.
  private func relevanceScore(
    for item: SearchResult,
    preferredMediaTypes: Set<String>,
    userGenreIds: Set<Int>
  ) -> Int {
    var score = 0

    // Boost for matching media type
    if let mediaType = item.mediaType, preferredMediaTypes.contains(mediaType) {
      score += 2
    }

    // Boost for matching genres
    if let genreIds = item.genreIds {
      let matchCount = Set(genreIds).intersection(userGenreIds).count
      score += matchCount
    }

    return score
  }

  // MARK: - Recent Searches
  private func loadRecentSearches() {
    recentSearches = UserDefaults.standard.stringArray(forKey: recentSearchesKey) ?? []
  }

  private func saveRecentSearch(_ query: String) {
    var searches = recentSearches
    
    // Remove if already exists to avoid duplicates
    searches.removeAll { $0.lowercased() == query.lowercased() }
    
    // Add to the beginning
    searches.insert(query, at: 0)
    
    // Keep only the most recent searches
    if searches.count > maxRecentSearches {
      searches = Array(searches.prefix(maxRecentSearches))
    }
    
    recentSearches = searches
    UserDefaults.standard.set(searches, forKey: recentSearchesKey)
  }

  private func removeRecentSearch(_ query: String) {
    withAnimation(.easeInOut(duration: 0.2)) {
      recentSearches.removeAll { $0 == query }
      UserDefaults.standard.set(recentSearches, forKey: recentSearchesKey)
    }
  }

  private func clearRecentSearches() {
    withAnimation(.easeInOut(duration: 0.2)) {
      recentSearches = []
      UserDefaults.standard.removeObject(forKey: recentSearchesKey)
    }
  }
}

// MARK: - Popular Section Helper
struct PopularSection: Identifiable {
  let id: String
  let viewBuilder: () -> AnyView
  var view: AnyView { viewBuilder() }
}

// MARK: - Search Section
struct SearchSection: View {
  let title: String
  let results: [SearchResult]

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(title)
        .font(.headline)
        .foregroundColor(.appForegroundAdaptive)

      LazyVGrid(columns: columns, spacing: 12) {
        ForEach(results.prefix(9)) { result in
          if result.mediaType != "person" {
            NavigationLink {
              MediaDetailView(
                mediaId: result.id,
                mediaType: result.mediaType ?? "movie"
              )
            } label: {
              PosterCard(result: result)
            }
            .buttonStyle(.plain)
          } else {
            PosterCard(result: result)
          }
        }
      }
    }
  }
}

// MARK: - Poster Card
struct PosterCard: View {
  let result: SearchResult

  var body: some View {
    CachedAsyncImage(url: result.imageURL) { image in
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
    .posterShadow()
  }
}

// MARK: - Skeleton Views
struct SearchSkeletonSection: View {
  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive)
        .frame(width: 80, height: 16)

      LazyVGrid(columns: columns, spacing: 12) {
        ForEach(0..<6, id: \.self) { _ in
          PosterSkeletonCard()
        }
      }
    }
  }
}

struct PosterSkeletonCard: View {
  var body: some View {
    RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
      .fill(Color.appBorderAdaptive)
      .aspectRatio(2 / 3, contentMode: .fit)
  }
}
