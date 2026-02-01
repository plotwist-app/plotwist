//
//  OnboardingAddTitlesContent.swift
//  Plotwist
//

import SwiftUI

struct OnboardingAddTitlesContent: View {
  let onComplete: () -> Void
  @StateObject private var onboardingService = OnboardingService.shared
  @State private var strings = L10n.current
  @State private var searchText = ""
  @State private var searchResults: [SearchResult] = []
  @State private var trendingItems: [SearchResult] = []
  @State private var genreItems: [SearchResult] = []
  @State private var isSearching = false
  @State private var isLoading = true
  @State private var showCelebration = false
  @FocusState private var isSearchFocused: Bool
  
  private var savedCount: Int {
    onboardingService.localSavedTitles.count
  }
  
  private var canComplete: Bool {
    savedCount >= 5
  }
  
  private var displayItems: [SearchResult] {
    if !searchText.isEmpty {
      return searchResults
    }
    var items: [SearchResult] = []
    let maxTrending = min(6, trendingItems.count)
    let maxGenre = min(6, genreItems.count)
    
    items.append(contentsOf: trendingItems.prefix(maxTrending))
    items.append(contentsOf: genreItems.prefix(maxGenre))
    
    var seen = Set<Int>()
    return items.filter { item in
      if seen.contains(item.id) { return false }
      seen.insert(item.id)
      return true
    }
  }
  
  var body: some View {
    ZStack {
      VStack(spacing: 0) {
        // Header
        VStack(spacing: 8) {
          Text(strings.onboardingAddTitlesTitle)
            .font(.system(size: 20, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
          
          Text(strings.onboardingAddTitlesSubtitle)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
          
          // Search bar
          HStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
              .foregroundColor(.appMutedForegroundAdaptive)
            
            TextField(strings.onboardingSearchPlaceholder, text: $searchText)
              .textInputAutocapitalization(.never)
              .autocorrectionDisabled()
              .focused($isSearchFocused)
          }
          .padding(12)
          .background(Color.appInputFilled)
          .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        .padding(.bottom, 8)
        
        // Content
        if isLoading && displayItems.isEmpty {
          Spacer()
          ProgressView()
          Spacer()
        } else {
          ScrollView(showsIndicators: false) {
            LazyVStack(spacing: 8) {
              if searchText.isEmpty {
                HStack {
                  Text(strings.onboardingPopularNow)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.appForegroundAdaptive)
                  Spacer()
                }
                .padding(.horizontal, 24)
                .padding(.top, 4)
              }
              
              ForEach(displayItems) { item in
                OnboardingTitleRow(
                  item: item,
                  savedStatus: onboardingService.getLocalTitleStatus(tmdbId: item.id, mediaType: item.mediaType ?? "movie"),
                  onWantToWatch: {
                    addTitle(item, status: "WATCHLIST")
                  },
                  onAlreadyWatched: {
                    addTitle(item, status: "WATCHED")
                  }
                )
              }
            }
            .padding(.bottom, 80)
          }
        }
        
        // Bottom button
        VStack(spacing: 0) {
          LinearGradient(
            colors: [Color.appBackgroundAdaptive.opacity(0), Color.appBackgroundAdaptive],
            startPoint: .top,
            endPoint: .bottom
          )
          .frame(height: 20)
          
          Button(action: {
            if canComplete {
              showCelebration = true
            }
          }) {
            Text(canComplete ? strings.onboardingContinueToApp : "\(strings.onboardingAddMore) (\(5 - savedCount))")
              .font(.system(size: 16, weight: .semibold))
              .foregroundColor(canComplete ? .appBackgroundAdaptive : .appMutedForegroundAdaptive)
              .frame(maxWidth: .infinity)
              .frame(height: 52)
              .background(canComplete ? Color.green : Color.appInputFilled)
              .clipShape(Capsule())
          }
          .disabled(!canComplete)
          .padding(.horizontal, 24)
          .padding(.bottom, 40)
          .background(Color.appBackgroundAdaptive)
        }
      }
      .frame(maxWidth: .infinity)
      
      // Celebration overlay
      if showCelebration {
        OnboardingCelebration(onDismiss: onComplete)
      }
    }
    .onChange(of: searchText) { newValue in
      Task {
        await performSearch(query: newValue)
      }
    }
    .task {
      await loadContent()
    }
  }
  
  private func addTitle(_ item: SearchResult, status: String) {
    let wasBelow5 = savedCount < 5
    
    onboardingService.addLocalTitle(
      tmdbId: item.id,
      mediaType: item.mediaType ?? "movie",
      title: item.displayTitle,
      posterPath: item.posterPath,
      status: status
    )
    
    if wasBelow5 && savedCount >= 5 {
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
        showCelebration = true
      }
    }
  }
  
  private func performSearch(query: String) async {
    guard !query.isEmpty else {
      searchResults = []
      return
    }
    
    isSearching = true
    defer { isSearching = false }
    
    do {
      let response = try await TMDBService.shared.searchMulti(
        query: query,
        language: Language.current.rawValue
      )
      searchResults = response.results.filter { $0.mediaType == "movie" || $0.mediaType == "tv" }
    } catch {
      searchResults = []
    }
  }
  
  private func loadContent() async {
    isLoading = true
    defer { isLoading = false }
    
    let language = Language.current.rawValue
    let contentTypes = onboardingService.contentTypes
    let selectedGenres = onboardingService.selectedGenres
    
    do {
      var allTrending: [SearchResult] = []
      
      // Load content based on selected preferences
      if contentTypes.isEmpty {
        allTrending = try await TMDBService.shared.getTrending(
          mediaType: "all",
          timeWindow: "week",
          language: language
        )
      } else {
        if contentTypes.contains(.movies) {
          let movies = try await TMDBService.shared.getPopularMovies(language: language)
          allTrending.append(contentsOf: movies.results.prefix(5))
        }
        
        if contentTypes.contains(.series) {
          let series = try await TMDBService.shared.getPopularTVSeries(language: language)
          allTrending.append(contentsOf: series.results.prefix(5))
        }
        
        if contentTypes.contains(.anime) {
          let animes = try await TMDBService.shared.getPopularAnimes(language: language)
          allTrending.append(contentsOf: animes.results.prefix(5))
        }
        
        if contentTypes.contains(.dorama) {
          let doramas = try await TMDBService.shared.getPopularDoramas(language: language)
          allTrending.append(contentsOf: doramas.results.prefix(5))
        }
      }
      
      // Remove duplicates
      var seen = Set<Int>()
      trendingItems = allTrending.filter { item in
        if seen.contains(item.id) { return false }
        seen.insert(item.id)
        return true
      }
      
      // Preload poster images
      let posterUrls = trendingItems.compactMap { $0.imageURL }
      ImageCache.shared.prefetch(urls: posterUrls, priority: .medium)
      
      // Load genre-based content
      if !selectedGenres.isEmpty {
        let genreIds = selectedGenres.map { $0.id }
        let hasOnlyMovies = contentTypes == Set([ContentTypePreference.movies])
        let genreMediaType = hasOnlyMovies ? "movie" : "tv"
        
        genreItems = try await TMDBService.shared.discoverByGenres(
          mediaType: genreMediaType,
          genreIds: genreIds,
          language: language
        )
        
        // Preload genre poster images
        let genrePosterUrls = genreItems.compactMap { $0.imageURL }
        ImageCache.shared.prefetch(urls: genrePosterUrls, priority: .low)
      }
    } catch {
      print("Failed to load onboarding content: \(error)")
    }
  }
}

// MARK: - Title Row
struct OnboardingTitleRow: View {
  let item: SearchResult
  let savedStatus: String?
  let onWantToWatch: () -> Void
  let onAlreadyWatched: () -> Void
  @State private var strings = L10n.current
  
  private var isSaved: Bool {
    savedStatus != nil
  }
  
  var body: some View {
    HStack(spacing: 12) {
      // Poster
      CachedAsyncImage(url: item.imageURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        RoundedRectangle(cornerRadius: 8)
          .fill(Color.appBorderAdaptive)
      }
      .frame(width: 60, height: 90)
      .clipShape(RoundedRectangle(cornerRadius: 8))
      
      // Info
      VStack(alignment: .leading, spacing: 4) {
        Text(item.displayTitle)
          .font(.headline)
          .foregroundColor(.appForegroundAdaptive)
          .lineLimit(2)
        
        HStack(spacing: 6) {
          if let mediaType = item.mediaType {
            Text(mediaType == "movie" ? strings.movies : strings.tvSeries)
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
          
          if let year = item.year {
            Text("•")
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
            Text(year)
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
      }
      
      Spacer()
      
      // Action buttons
      if isSaved {
        Image(systemName: savedStatus == "WATCHED" ? "checkmark.circle.fill" : "bookmark.fill")
          .font(.system(size: 24))
          .foregroundColor(.green)
      } else {
        HStack(spacing: 8) {
          Button(action: onWantToWatch) {
            Image(systemName: "bookmark")
              .font(.system(size: 18))
              .foregroundColor(.appForegroundAdaptive)
              .frame(width: 44, height: 44)
              .background(Color.appInputFilled)
              .clipShape(Circle())
          }
          
          Button(action: onAlreadyWatched) {
            Image(systemName: "checkmark")
              .font(.system(size: 18))
              .foregroundColor(.appForegroundAdaptive)
              .frame(width: 44, height: 44)
              .background(Color.appInputFilled)
              .clipShape(Circle())
          }
        }
      }
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 8)
  }
}
