//
//  DiscoverTabView.swift
//  Plotwist
//

import SwiftUI

struct DiscoverTabView: View {
  @State private var strings = L10n.current
  @ObservedObject private var themeManager = ThemeManager.shared
  @ObservedObject private var preferencesManager = UserPreferencesManager.shared

  @State private var popularMovies: [SearchResult] = []
  @State private var popularTVSeries: [SearchResult] = []
  @State private var popularAnimes: [SearchResult] = []
  @State private var popularDoramas: [SearchResult] = []
  @State private var isLoading = true
  @State private var isInitialLoad = true
  @State private var hasAppeared = false

  private let cache = SearchDataCache.shared

  @Environment(\.colorScheme) private var systemColorScheme

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  var body: some View {
    NavigationStack {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        if isLoading && isInitialLoad && !cache.isDataAvailable {
          skeletonView
        } else if orderedCategoryData.isEmpty && !isLoading {
          emptyView
        } else {
          contentView
        }
      }
      .navigationBarHidden(true)
    }
    .preferredColorScheme(effectiveColorScheme)
    .onAppear {
      if !hasAppeared {
        hasAppeared = true
        restoreFromCache()
      }
    }
    .task {
      await loadContent()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
      Task { await loadContent(forceRefresh: true) }
    }
    .onReceive(NotificationCenter.default.publisher(for: .profileUpdated)) { _ in
      Task {
        await preferencesManager.loadPreferences()
        cache.clearCache()
        await loadContent(forceRefresh: true)
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: .searchDataCacheInvalidated)) { _ in
      Task { await loadContent(forceRefresh: true) }
    }
  }

  @State private var showPreferences = false
  @State private var streamingProviders: [StreamingProvider] = []

  // MARK: - Content

  private var contentView: some View {
    let sections = orderedCategoryData

    return ScrollView(showsIndicators: false) {
      VStack(spacing: 24) {
        filterChipsRow

        if sections.count == 1, let single = sections.first {
          // Single category: 3-column grid
          singleCategoryGrid(single)
        } else {
          // Multiple categories: horizontal scroll lists
          ForEach(sections) { section in
            HomeSectionView(
              title: section.title,
              items: section.items,
              mediaType: section.mediaType,
              categoryType: section.categoryType,
              initialMovieSubcategory: section.movieSubcategory,
              initialTVSeriesSubcategory: section.tvSubcategory
            )
          }
        }
      }
      .padding(.bottom, 80)
    }
  }

  // MARK: - Filter Chips

  private var selectedProviders: [StreamingProvider] {
    let ids = preferencesManager.watchProvidersIds
    return streamingProviders.filter { ids.contains($0.providerId) }
  }

  private var filterChipsRow: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 8) {
        // Edit button (first)
        Button { showPreferences = true } label: {
          Image(systemName: "slider.horizontal.3")
            .font(.system(size: 12))
            .foregroundColor(.appMutedForegroundAdaptive)
            .padding(.horizontal, 12)
            .frame(height: 34)
            .background(Color.appInputFilled)
            .clipShape(Capsule())
        }

        // Content + Genres pill
        if contentGenreParts.count > 0 {
          contentGenrePill
        }

        // Region + Streaming pill
        if preferencesManager.watchRegion != nil || !selectedProviders.isEmpty {
          regionStreamingPill
        }
      }
      .padding(.horizontal, 24)
      .padding(.top, 8)
    }
    .scrollClipDisabled()
    .sheet(isPresented: $showPreferences) {
      PreferencesQuickSheet()
    }
    .task {
      await loadStreamingProviders()
    }
  }

  private var contentGenreParts: [String] {
    var parts: [String] = []

    let types = preferencesManager.contentTypes
    if !types.isEmpty {
      parts.append(types.map { $0.displayName }.joined(separator: ", "))
    }

    let genres = preferencesManager.genreIds
    if !genres.isEmpty {
      let names = genres.prefix(3).map { OnboardingGenre(id: $0, name: "").name }
      var genreText = names.joined(separator: ", ")
      if genres.count > 3 { genreText += " +\(genres.count - 3)" }
      parts.append(genreText)
    }

    return parts
  }

  private var contentGenrePill: some View {
    Button { showPreferences = true } label: {
      HStack(spacing: 8) {
        ForEach(Array(contentGenreParts.enumerated()), id: \.offset) { index, part in
          if index > 0 {
            Rectangle()
              .fill(Color.appBackgroundAdaptive)
              .frame(width: 1.5)
          }
          Text(part)
            .font(.footnote.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)
        }
      }
      .padding(.horizontal, 12)
      .frame(height: 34)
      .background(Color.appInputFilled)
      .clipShape(Capsule())
    }
    .buttonStyle(.plain)
  }

  private var regionStreamingPill: some View {
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

        if preferencesManager.watchRegion != nil && !selectedProviders.isEmpty {
          Rectangle()
            .fill(Color.appBackgroundAdaptive)
            .frame(width: 1.5)
        }

        if !selectedProviders.isEmpty {
          // Overlapping logos
          HStack(spacing: -8) {
            ForEach(Array(selectedProviders.prefix(5).enumerated()), id: \.element.id) { index, provider in
              CachedAsyncImage(url: provider.logoURL) { image in
                image
                  .resizable()
                  .aspectRatio(contentMode: .fill)
              } placeholder: {
                RoundedRectangle(cornerRadius: 6)
                  .fill(Color.appBorderAdaptive)
              }
              .frame(width: 24, height: 24)
              .clipShape(RoundedRectangle(cornerRadius: 6))
              .overlay(
                RoundedRectangle(cornerRadius: 6)
                  .stroke(Color.appInputFilled, lineWidth: 1.5)
              )
              .zIndex(Double(selectedProviders.count - index))
            }
          }

          if selectedProviders.count > 5 {
            Text("+\(selectedProviders.count - 5)")
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

  private func filterPill(text: String, prefix: String? = nil) -> some View {
    Button { showPreferences = true } label: {
      HStack(spacing: 6) {
        if let prefix {
          Text(prefix)
            .font(.system(size: 14))
        }

        Text(text)
          .font(.footnote.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
      }
      .padding(.horizontal, 12)
      .frame(height: 34)
      .background(Color.appInputFilled)
      .clipShape(Capsule())
    }
    .buttonStyle(.plain)
  }

  private func loadStreamingProviders() async {
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

  private let gridColumns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  private func singleCategoryGrid(_ section: DiscoverCategoryData) -> some View {
    VStack(alignment: .leading, spacing: 12) {
      NavigationLink {
        CategoryListView(
          categoryType: section.categoryType,
          initialMovieSubcategory: section.movieSubcategory,
          initialTVSeriesSubcategory: section.tvSubcategory
        )
      } label: {
        HStack(spacing: 6) {
          Text(section.title)
            .font(.title3.bold())
            .foregroundColor(.appForegroundAdaptive)

          Image(systemName: "chevron.right")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(.appMutedForegroundAdaptive)

          Spacer()
        }
      }

      LazyVGrid(columns: gridColumns, spacing: 12) {
        ForEach(section.items.prefix(18)) { item in
          NavigationLink {
            MediaDetailView(
              mediaId: item.id,
              mediaType: section.mediaType
            )
          } label: {
            PosterCard(result: item)
          }
          .buttonStyle(.plain)
        }
      }
    }
    .padding(.horizontal, 24)
  }

  // MARK: - Category Data

  private var orderedCategoryData: [DiscoverCategoryData] {
    let userContentTypes = preferencesManager.contentTypes
    var all = allCategoryData

    guard !userContentTypes.isEmpty else { return all }

    // Sort: preferred types first, then the rest
    var ordered: [DiscoverCategoryData] = []
    for type in userContentTypes {
      if let idx = all.firstIndex(where: { $0.contentType == type }) {
        ordered.append(all.remove(at: idx))
      }
    }
    ordered.append(contentsOf: all)
    return ordered
  }

  private var allCategoryData: [DiscoverCategoryData] {
    var data: [DiscoverCategoryData] = []
    if !popularMovies.isEmpty {
      data.append(DiscoverCategoryData(
        id: "movies", title: strings.movies, items: popularMovies,
        mediaType: "movie", categoryType: .movies, contentType: .movies,
        movieSubcategory: .popular
      ))
    }
    if !popularTVSeries.isEmpty {
      data.append(DiscoverCategoryData(
        id: "tv", title: strings.tvSeries, items: popularTVSeries,
        mediaType: "tv", categoryType: .tvSeries, contentType: .series,
        tvSubcategory: .popular
      ))
    }
    if !popularAnimes.isEmpty {
      data.append(DiscoverCategoryData(
        id: "anime", title: strings.animes, items: popularAnimes,
        mediaType: "tv", categoryType: .animes, contentType: .anime
      ))
    }
    if !popularDoramas.isEmpty {
      data.append(DiscoverCategoryData(
        id: "dorama", title: strings.doramas, items: popularDoramas,
        mediaType: "tv", categoryType: .doramas, contentType: .dorama
      ))
    }
    return data
  }

  // MARK: - Skeleton

  private var skeletonView: some View {
    ScrollView {
      VStack(spacing: 24) {
        ForEach(0..<3, id: \.self) { _ in
          DiscoverSkeletonSection()
        }
      }
      .padding(.top, 16)
      .padding(.bottom, 80)
    }
  }

  // MARK: - Empty View

  private var emptyView: some View {
    VStack(spacing: 12) {
      Spacer()
      Image(systemName: "sparkles")
        .font(.system(size: 40))
        .foregroundColor(.appMutedForegroundAdaptive.opacity(0.5))
      Text(strings.discover)
        .font(.title2.bold())
        .foregroundColor(.appForegroundAdaptive)
      Text(strings.resultsBasedOnPreferences)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
      Spacer()
    }
  }

  // MARK: - Data Loading

  private func restoreFromCache() {
    if let cached = cache.popularMovies { popularMovies = cached }
    if let cached = cache.popularTVSeries { popularTVSeries = cached }
    if let cached = cache.popularAnimes { popularAnimes = cached }
    if let cached = cache.popularDoramas { popularDoramas = cached }
    if cache.isDataAvailable { isInitialLoad = false }
  }

  private func loadContent(forceRefresh: Bool = false) async {
    let contentTypesStr = preferencesManager.contentTypes.map { $0.rawValue }.sorted().joined()
    let genreIdsStr = preferencesManager.genreIds.sorted().map { String($0) }.joined()
    let currentHash = "\(preferencesManager.watchRegion ?? "")-\(preferencesManager.watchProvidersString)-\(contentTypesStr)-\(genreIdsStr)"
    cache.setPreferencesHash(currentHash)

    if !forceRefresh && cache.isDataAvailable {
      restoreFromCache()
      isInitialLoad = false
      return
    }

    isLoading = true
    defer {
      isLoading = false
      isInitialLoad = false
    }

    let language = Language.current.rawValue
    let watchRegion = preferencesManager.watchRegion
    let watchProviders = preferencesManager.hasStreamingServices ? preferencesManager.watchProvidersString : nil
    let userContentTypes = preferencesManager.contentTypes
    let userGenreIds = preferencesManager.genreIds
    let hasFilters = preferencesManager.hasStreamingServices || !userGenreIds.isEmpty

    // Map genre IDs per media type (movie and TV use different IDs for the same genres)
    let movieGenres = genresString(for: userGenreIds, mediaType: .movies)
    let tvGenres = genresString(for: userGenreIds, mediaType: .series)

    let shouldLoadMovies = userContentTypes.isEmpty || userContentTypes.contains(.movies)
    let shouldLoadSeries = userContentTypes.isEmpty || userContentTypes.contains(.series)
    let shouldLoadAnimes = userContentTypes.isEmpty || userContentTypes.contains(.anime)
    let shouldLoadDoramas = userContentTypes.isEmpty || userContentTypes.contains(.dorama)

    if !shouldLoadMovies { popularMovies = []; cache.setPopularMovies([]) }
    if !shouldLoadSeries { popularTVSeries = []; cache.setPopularTVSeries([]) }
    if !shouldLoadAnimes { popularAnimes = []; cache.setPopularAnimes([]) }
    if !shouldLoadDoramas { popularDoramas = []; cache.setPopularDoramas([]) }

    do {
      await withThrowingTaskGroup(of: Void.self) { group in
        if shouldLoadMovies {
          group.addTask {
            let result = if hasFilters {
              try await TMDBService.shared.discoverMovies(
                language: language, watchRegion: watchRegion,
                withWatchProviders: watchProviders, withGenres: movieGenres
              )
            } else {
              try await TMDBService.shared.getPopularMovies(language: language)
            }
            await MainActor.run {
              popularMovies = result.results
              cache.setPopularMovies(result.results)
            }
          }
        }
        if shouldLoadSeries {
          group.addTask {
            let result = if hasFilters {
              try await TMDBService.shared.discoverTV(
                language: language, watchRegion: watchRegion,
                withWatchProviders: watchProviders, withGenres: tvGenres
              )
            } else {
              try await TMDBService.shared.getPopularTVSeries(language: language)
            }
            await MainActor.run {
              popularTVSeries = result.results
              cache.setPopularTVSeries(result.results)
            }
          }
        }
        if shouldLoadAnimes {
          group.addTask {
            let result = if hasFilters {
              try await TMDBService.shared.discoverAnimes(
                language: language, watchRegion: watchRegion, withWatchProviders: watchProviders
              )
            } else {
              try await TMDBService.shared.getPopularAnimes(language: language)
            }
            await MainActor.run {
              popularAnimes = result.results
              cache.setPopularAnimes(result.results)
            }
          }
        }
        if shouldLoadDoramas {
          group.addTask {
            let result = if hasFilters {
              try await TMDBService.shared.discoverDoramas(
                language: language, watchRegion: watchRegion, withWatchProviders: watchProviders
              )
            } else {
              try await TMDBService.shared.getPopularDoramas(language: language)
            }
            await MainActor.run {
              popularDoramas = result.results
              cache.setPopularDoramas(result.results)
            }
          }
        }
      }
    } catch {
      popularMovies = []
      popularTVSeries = []
      popularAnimes = []
      popularDoramas = []
    }
  }

  // MARK: - Genre ID Mapping
  // TMDB uses different genre IDs for movies vs TV.
  // Shared IDs: 16(Animation), 35(Comedy), 80(Crime), 99(Documentary),
  //             18(Drama), 10751(Family), 9648(Mystery), 37(Western)
  // Movie-only → TV equivalent:
  private static let movieToTVGenreMap: [Int: Int] = [
    28: 10759,    // Action → Action & Adventure
    12: 10759,    // Adventure → Action & Adventure
    14: 10765,    // Fantasy → Sci-Fi & Fantasy
    878: 10765,   // Science Fiction → Sci-Fi & Fantasy
    10752: 10768, // War → War & Politics
    36: 10768,    // History → War & Politics
  ]

  // Movie-only IDs with no TV equivalent (skip for TV queries)
  private static let movieOnlyGenres: Set<Int> = [27, 10402, 10749, 53, 10770]
  // 27=Horror, 10402=Music, 10749=Romance, 53=Thriller, 10770=TV Movie

  private func genresString(for genreIds: [Int], mediaType: ContentTypePreference) -> String? {
    guard !genreIds.isEmpty else { return nil }

    let mapped: [Int]
    if mediaType == .movies {
      mapped = genreIds
    } else {
      // For TV: map movie IDs to TV equivalents, skip movie-only IDs
      var tvIds = Set<Int>()
      for id in genreIds {
        if Self.movieOnlyGenres.contains(id) {
          continue // No TV equivalent, skip
        } else if let tvId = Self.movieToTVGenreMap[id] {
          tvIds.insert(tvId)
        } else {
          // Shared ID, works for both
          tvIds.insert(id)
        }
      }
      mapped = Array(tvIds)
    }

    guard !mapped.isEmpty else { return nil }
    return mapped.map { String($0) }.joined(separator: "|")
  }
}

// MARK: - Discover Category Data
struct DiscoverCategoryData: Identifiable {
  let id: String
  let title: String
  let items: [SearchResult]
  let mediaType: String
  let categoryType: HomeCategoryType
  let contentType: ContentTypePreference
  var movieSubcategory: MovieSubcategory? = nil
  var tvSubcategory: TVSeriesSubcategory? = nil
}

// MARK: - Discover Skeleton
struct DiscoverSkeletonSection: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive)
        .frame(width: 100, height: 18)
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
      }
    }
  }
}

#Preview {
  DiscoverTabView()
}
