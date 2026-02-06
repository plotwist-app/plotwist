//
//  OnboardingAddTitlesContent.swift
//  Plotwist

import SwiftUI
import Deck

struct OnboardingAddTitlesContent: View {
  let onComplete: () -> Void
  @StateObject private var onboardingService = OnboardingService.shared
  @State private var strings = L10n.current
  @StateObject private var deck: Deck<SearchResult> = Deck([])
  @State private var isLoading = true
  @State private var isLoadingMore = false
  @State private var showCelebration = false
  @State private var currentPage = 1
  
  // Track dismissed items to avoid showing them again
  @State private var dismissedIds: Set<Int> = []
  
  // Track current swipe direction for overlay
  @State private var currentSwipeDirection: Direction = .none
  @State private var swipeProgress: CGFloat = 0
  
  private var savedCount: Int {
    onboardingService.localSavedTitles.count
  }
  
  private var canComplete: Bool {
    savedCount >= 5
  }
  
  private var progressText: String {
    if canComplete {
      return strings.onboardingReadyToContinue
    } else {
      let remaining = 5 - savedCount
      return "\(remaining) \(strings.onboardingMoreToGo)"
    }
  }
  
  var body: some View {
    ZStack {
      VStack(spacing: 0) {
        // Header
        VStack(spacing: 8) {
          Text(strings.onboardingDiscoverTitle)
            .font(.system(size: 24, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
            .multilineTextAlignment(.center)
          
          Text(strings.onboardingDiscoverSubtitle)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 24)
        .padding(.top, 8)
        
        // Card Stack
        if isLoading && deck.data.isEmpty {
          Spacer()
          ProgressView()
          Spacer()
        } else if !deck.data.isEmpty {
          DeckStack(
            deck,
            option: Option(
              allowedDirections: [.left, .top, .right],
              numberOfVisibleCards: 3,
              maximumRotationOfCard: 12,
              judgmentThreshold: 120
            )
          ) { item, targetID in
            let position = cardPosition(for: item.id, targetID: targetID)
            cardView(item: item, position: position)
          }
          .onGesture(
            DeckDragGesture()
              .onChange { state in
                currentSwipeDirection = state.direction
                swipeProgress = state.progress
              }
              .onEnd { state in
                if state.isJudged {
                  deck.swipe(to: state.direction, id: state.id)
                } else {
                  deck.cancel(id: state.id)
                }
                currentSwipeDirection = .none
                swipeProgress = 0
              }
          )
          .onJudged { id, direction in
            handleSwipe(id: id, direction: direction)
          }
          .padding(.horizontal, 80)
          .padding(.top, 16)
          .frame(maxHeight: UIScreen.main.bounds.height * 0.42)
          
          // Action buttons
          actionButtons
            .padding(.top, 20)
        } else {
          Spacer()
          VStack(spacing: 12) {
            Image(systemName: "checkmark.circle.fill")
              .font(.system(size: 48))
              .foregroundColor(.green)
            Text(strings.onboardingNoMoreItems)
              .font(.headline)
              .foregroundColor(.appForegroundAdaptive)
          }
          Spacer()
        }
        
        Spacer()
        
        // Continue button (fixed at bottom)
        Button(action: {
          if canComplete {
            showCelebration = true
          }
        }) {
          Text(canComplete ? strings.onboardingContinueToApp : progressText)
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(canComplete ? .appBackgroundAdaptive : .appMutedForegroundAdaptive)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(canComplete ? Color.appForegroundAdaptive : Color.appInputFilled)
            .clipShape(Capsule())
        }
        .disabled(!canComplete)
        .padding(.horizontal, 24)
        .padding(.bottom, 40)
      }
      .frame(maxWidth: .infinity)
      
      // Celebration overlay
      if showCelebration {
        OnboardingCelebration(onDismiss: onComplete)
      }
    }
    .task {
      await loadContent()
    }
  }
  
  // MARK: - Card Position
  
  // Card position configurations (same as original custom implementation)
  private struct CardStyle {
    let scale: CGFloat
    let rotation: Double
    let offsetX: CGFloat
    let offsetY: CGFloat
    
    static let front = CardStyle(scale: 1.0, rotation: 0, offsetX: 0, offsetY: 0)
    static let second = CardStyle(scale: 0.93, rotation: 10, offsetX: 12, offsetY: 4)
    static let third = CardStyle(scale: 0.86, rotation: -18, offsetX: -20, offsetY: 8)
  }
  
  /// Returns the position of a card relative to the target (0 = front, 1 = second, 2 = third, etc.)
  private func cardPosition(for itemID: Int, targetID: Int?) -> Int {
    guard let targetID = targetID,
          let targetIndex = deck.data.firstIndex(where: { $0.id == targetID }),
          let itemIndex = deck.data.firstIndex(where: { $0.id == itemID }) else {
      return 0
    }
    return itemIndex - targetIndex
  }
  
  private func styleForPosition(_ position: Int) -> CardStyle {
    switch position {
    case 0: return .front
    case 1: return .second
    default: return .third
    }
  }
  
  // MARK: - Card View
  
  @ViewBuilder
  private func cardView(item: SearchResult, position: Int) -> some View {
    let style = styleForPosition(position)
    let isTopCard = position == 0
    
    ZStack {
      // Poster
      CachedAsyncImage(url: item.hdPosterURL ?? item.imageURL) { image in
        image
          .resizable()
          .aspectRatio(2/3, contentMode: .fit)
      } placeholder: {
        Rectangle()
          .fill(Color.appInputFilled)
          .aspectRatio(2/3, contentMode: .fit)
          .overlay(ProgressView())
      }
      .clipShape(RoundedRectangle(cornerRadius: 32))
      .overlay(
        RoundedRectangle(cornerRadius: 32)
          .strokeBorder(Color.appBorderAdaptive.opacity(0.3), lineWidth: 1)
      )
      .shadow(color: .black.opacity(0.25), radius: 12, x: 0, y: 6)
      
      // Swipe indicator overlay (only on top card)
      if isTopCard && swipeProgress > 0.3 {
        swipeOverlay(direction: currentSwipeDirection)
          .opacity(Double(swipeProgress))
      }
    }
    // Apply stacked card transformations for background cards
    .scaleEffect(isTopCard ? 1.0 : style.scale)
    .rotationEffect(.degrees(isTopCard ? 0 : style.rotation))
    .offset(x: isTopCard ? 0 : style.offsetX, y: isTopCard ? 0 : style.offsetY)
  }
  
  @ViewBuilder
  private func swipeOverlay(direction: Direction) -> some View {
    Group {
      switch direction {
      case .right:
        // Want to watch
        swipeIndicatorPill(
          icon: "bookmark.fill",
          iconColor: .blue,
          text: strings.onboardingWantToWatch
        )
      case .left:
        // Not interested
        swipeIndicatorPill(
          icon: "xmark",
          iconColor: .red,
          text: strings.onboardingNotInterested
        )
      case .top:
        // Already watched
        swipeIndicatorPill(
          icon: "checkmark.circle.fill",
          iconColor: .green,
          text: strings.onboardingAlreadyWatched
        )
      default:
        EmptyView()
      }
    }
  }
  
  @ViewBuilder
  private func swipeIndicatorPill(icon: String, iconColor: Color, text: String) -> some View {
    HStack(spacing: 6) {
      Image(systemName: icon)
        .foregroundColor(iconColor)
      Text(text)
        .foregroundColor(.white)
    }
    .font(.headline)
    .padding(.horizontal, 16)
    .padding(.vertical, 8)
    .background(Color.black)
    .clipShape(Capsule())
  }
  
  // MARK: - Action Buttons
  
  private var actionButtons: some View {
    FlowLayout(spacing: 8, alignment: .center) {
      // Already watched (up) - first
      Button(action: {
        if let targetID = deck.targetID {
          deck.swipe(to: .top, id: targetID)
        }
      }) {
        HStack(spacing: 6) {
          Image(systemName: "checkmark")
            .font(.system(size: 13))
            .foregroundColor(.green)
          
          Text(strings.onboardingAlreadyWatched)
            .font(.footnote.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(1)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Color.appInputFilled)
        .cornerRadius(10)
      }
      
      // Want to watch (right) - second
      Button(action: {
        if let targetID = deck.targetID {
          deck.swipe(to: .right, id: targetID)
        }
      }) {
        HStack(spacing: 6) {
          Image(systemName: "bookmark.fill")
            .font(.system(size: 13))
            .foregroundColor(.orange)
          
          Text(strings.onboardingWantToWatch)
            .font(.footnote.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(1)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Color.appInputFilled)
        .cornerRadius(10)
      }
      
      // Not interested (left) - last
      Button(action: {
        if let targetID = deck.targetID {
          deck.swipe(to: .left, id: targetID)
        }
      }) {
        HStack(spacing: 6) {
          Image(systemName: "xmark")
            .font(.system(size: 13))
            .foregroundColor(.red)
          
          Text(strings.onboardingNotInterested)
            .font(.footnote.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(1)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Color.appInputFilled)
        .cornerRadius(10)
      }
    }
    .padding(.horizontal, 24)
  }
  
  // MARK: - Actions
  
  private func handleSwipe(id: Int, direction: Direction) {
    guard let item = deck.data.first(where: { $0.id == id }) else { return }
    
    let impact = UIImpactFeedbackGenerator(style: .medium)
    impact.impactOccurred()
    
    dismissedIds.insert(item.id)
    
    switch direction {
    case .right:
      // Want to watch
      addTitle(item, status: "WATCHLIST")
    case .top:
      // Already watched
      addTitle(item, status: "WATCHED")
    case .left:
      // Not interested - just skip
      break
    default:
      break
    }
    
    // Calculate remaining items (total - dismissed)
    let remainingItems = deck.data.count - dismissedIds.count
    
    // Load more if running low on items (less than 5 remaining)
    if remainingItems < 5 && !isLoadingMore {
      Task {
        await loadMoreContent()
      }
    }
  }
  
  private func addTitle(_ item: SearchResult, status: String) {
    onboardingService.addLocalTitle(
      tmdbId: item.id,
      mediaType: item.mediaType ?? "movie",
      title: item.displayTitle,
      posterPath: item.posterPath,
      status: status
    )
  }
  
  // MARK: - Genre ID Mapping
  
  // Valid genre IDs for movies
  private let movieGenreIds: Set<Int> = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 53, 10752, 37]
  
  // Valid genre IDs for TV shows
  private let tvGenreIds: Set<Int> = [10759, 16, 35, 80, 18, 10765, 10768, 9648, 10751, 10764, 10749]
  
  // Map movie genres to equivalent TV genres
  private let movieToTVGenreMap: [Int: Int] = [
    28: 10759,   // Action -> Action & Adventure
    12: 10759,   // Adventure -> Action & Adventure
    878: 10765,  // Sci-Fi -> Sci-Fi & Fantasy
    14: 10765,   // Fantasy -> Sci-Fi & Fantasy
    10752: 10768 // War -> War & Politics
  ]
  
  // Get compatible genre IDs for a media type
  private func getCompatibleGenreIds(for mediaType: String, from selectedGenreIds: [Int]) -> [Int] {
    if mediaType == "movie" {
      // For movies, only use valid movie genre IDs
      return selectedGenreIds.filter { movieGenreIds.contains($0) }
    } else {
      // For TV, map movie genres to TV equivalents and filter valid ones
      var tvIds: [Int] = []
      for genreId in selectedGenreIds {
        if tvGenreIds.contains(genreId) {
          tvIds.append(genreId)
        } else if let mappedId = movieToTVGenreMap[genreId] {
          tvIds.append(mappedId)
        }
      }
      return Array(Set(tvIds)) // Remove duplicates
    }
  }
  
  // MARK: - Data Loading
  
  private func loadContent() async {
    isLoading = true
    defer { isLoading = false }
    
    let language = Language.current.rawValue
    let contentTypes = onboardingService.contentTypes
    let selectedGenres = onboardingService.selectedGenres
    
    do {
      var allItems: [SearchResult] = []
      
      // Get genre IDs if any
      let allGenreIds = selectedGenres.map { $0.id }
      
      // Load content based on selected types AND genres
      if contentTypes.isEmpty && allGenreIds.isEmpty {
        // No preferences - show trending
        allItems = try await TMDBService.shared.getTrending(
          mediaType: "all",
          timeWindow: "week",
          language: language
        )
      } else {
        // Load based on content types and genres
        if contentTypes.contains(.movies) || contentTypes.isEmpty {
          let movieGenres = getCompatibleGenreIds(for: "movie", from: allGenreIds)
          let movies = try await loadDiscoverContent(
            mediaType: "movie",
            genreIds: movieGenres,
            language: language,
            page: 1
          )
          allItems.append(contentsOf: movies)
        }
        
        if contentTypes.contains(.series) {
          let tvGenres = getCompatibleGenreIds(for: "tv", from: allGenreIds)
          let series = try await loadDiscoverContent(
            mediaType: "tv",
            genreIds: tvGenres,
            language: language,
            page: 1
          )
          allItems.append(contentsOf: series)
        }
        
        if contentTypes.contains(.anime) {
          let animes = try await TMDBService.shared.getPopularAnimes(language: language)
          allItems.append(contentsOf: animes.results)
        }
        
        if contentTypes.contains(.dorama) {
          let doramas = try await TMDBService.shared.getPopularDoramas(language: language)
          allItems.append(contentsOf: doramas.results)
        }
      }
      
      // Remove duplicates (keep order by popularity)
      var seen = Set<Int>()
      let uniqueItems = allItems.filter { item in
        if seen.contains(item.id) { return false }
        seen.insert(item.id)
        return true
      }
      
      // Update deck data
      deck.data = uniqueItems
      
      // Preload first few poster images in HD
      let posterUrls = uniqueItems.prefix(5).compactMap { $0.hdPosterURL ?? $0.imageURL }
      ImageCache.shared.prefetch(urls: posterUrls, priority: .high)
      
    } catch {
      print("Failed to load onboarding content: \(error)")
    }
  }
  
  private func loadMoreContent() async {
    guard !isLoadingMore else { return }
    isLoadingMore = true
    defer { isLoadingMore = false }
    
    currentPage += 1
    let language = Language.current.rawValue
    let contentTypes = onboardingService.contentTypes
    let selectedGenres = onboardingService.selectedGenres
    let allGenreIds = selectedGenres.map { $0.id }
    
    do {
      var newItems: [SearchResult] = []
      
      if contentTypes.contains(.movies) || contentTypes.isEmpty {
        let movieGenres = getCompatibleGenreIds(for: "movie", from: allGenreIds)
        let movies = try await loadDiscoverContent(
          mediaType: "movie",
          genreIds: movieGenres,
          language: language,
          page: currentPage
        )
        newItems.append(contentsOf: movies)
      }
      
      if contentTypes.contains(.series) {
        let tvGenres = getCompatibleGenreIds(for: "tv", from: allGenreIds)
        let series = try await loadDiscoverContent(
          mediaType: "tv",
          genreIds: tvGenres,
          language: language,
          page: currentPage
        )
        newItems.append(contentsOf: series)
      }
      
      if contentTypes.contains(.anime) {
        let animes = try await TMDBService.shared.getPopularAnimes(language: language, page: currentPage)
        newItems.append(contentsOf: animes.results)
      }
      
      if contentTypes.contains(.dorama) {
        let doramas = try await TMDBService.shared.getPopularDoramas(language: language, page: currentPage)
        newItems.append(contentsOf: doramas.results)
      }
      
      // Filter out already seen/dismissed items
      let existingIds = Set(deck.data.map { $0.id }).union(dismissedIds)
      let uniqueNewItems = newItems.filter { !existingIds.contains($0.id) }
      
      deck.data.append(contentsOf: uniqueNewItems)
      
      // Preload new poster images in HD
      let posterUrls = uniqueNewItems.prefix(5).compactMap { $0.hdPosterURL ?? $0.imageURL }
      ImageCache.shared.prefetch(urls: posterUrls, priority: .medium)
      
    } catch {
      print("Failed to load more content: \(error)")
    }
  }
  
  private func loadDiscoverContent(
    mediaType: String,
    genreIds: [Int],
    language: String,
    page: Int
  ) async throws -> [SearchResult] {
    if genreIds.isEmpty {
      // No genres - use popular
      if mediaType == "movie" {
        let response = try await TMDBService.shared.getPopularMovies(language: language, page: page)
        return response.results
      } else {
        let response = try await TMDBService.shared.getPopularTVSeries(language: language, page: page)
        return response.results
      }
    } else {
      // Use discover with genres
      return try await TMDBService.shared.discoverByGenres(
        mediaType: mediaType,
        genreIds: genreIds,
        language: language,
        page: page
      )
    }
  }
}
