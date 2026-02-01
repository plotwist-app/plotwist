//
//  OnboardingAddTitlesContent.swift
//  Plotwist

import SwiftUI

struct OnboardingAddTitlesContent: View {
  let onComplete: () -> Void
  @StateObject private var onboardingService = OnboardingService.shared
  @State private var strings = L10n.current
  @State private var items: [SearchResult] = []
  @State private var currentIndex = 0
  @State private var isLoading = true
  @State private var isLoadingMore = false
  @State private var showCelebration = false
  @State private var currentPage = 1
  @State private var dragOffset: CGSize = .zero
  @State private var cardRotation: Double = 0
  
  // Track dismissed items to avoid showing them again
  @State private var dismissedIds: Set<Int> = []
  
  private var savedCount: Int {
    onboardingService.localSavedTitles.count
  }
  
  private var canComplete: Bool {
    savedCount >= 5
  }
  
  private var currentItem: SearchResult? {
    guard currentIndex < items.count else { return nil }
    return items[currentIndex]
  }
  
  private var nextItem: SearchResult? {
    guard currentIndex + 1 < items.count else { return nil }
    return items[currentIndex + 1]
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
          
          Text(strings.onboardingDiscoverSubtitle)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 24)
        .padding(.top, 8)
        .padding(.bottom, 24)
        
        // Card Stack
        if isLoading && items.isEmpty {
          Spacer()
          ProgressView()
          Spacer()
        } else if let item = currentItem {
          cardStack(currentItem: item)
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
        
        // Action buttons
        if currentItem != nil {
          actionButtons
            .padding(.top, 16)
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
  
  // MARK: - Card Stack
  
  private var thirdItem: SearchResult? {
    guard currentIndex + 2 < items.count else { return nil }
    return items[currentIndex + 2]
  }
  
  @ViewBuilder
  private func cardStack(currentItem: SearchResult) -> some View {
    ZStack {
      // Third card (furthest back) - rotated to show corner
      if let thirdItem = thirdItem {
        posterCard(item: thirdItem)
          .id("third-\(thirdItem.id)")
          .scaleEffect(0.88)
          .rotationEffect(.degrees(-12))
          .offset(x: -16, y: 12)
          .transition(.identity) // No animation on appear/disappear
      }
      
      // Second card (behind) - slightly rotated
      if let nextItem = nextItem {
        posterCard(item: nextItem)
          .id("second-\(nextItem.id)")
          .scaleEffect(0.94)
          .rotationEffect(.degrees(6))
          .offset(x: 8, y: 6)
          .transition(.identity) // No animation on appear/disappear
      }
      
      // Current card (front)
      posterCard(item: currentItem)
        .id(currentItem.id)
        .offset(dragOffset)
        .rotationEffect(.degrees(cardRotation))
        .transition(.identity) // No animation on appear/disappear
        .gesture(
          DragGesture()
            .onChanged { gesture in
              dragOffset = gesture.translation
              cardRotation = Double(gesture.translation.width / 20)
            }
            .onEnded { gesture in
              let threshold: CGFloat = 100
              
              if gesture.translation.width > threshold {
                // Swiped right - Want to watch
                swipeCard(direction: .right)
              } else if gesture.translation.width < -threshold {
                // Swiped left - Not interested
                swipeCard(direction: .left)
              } else if gesture.translation.height < -threshold {
                // Swiped up - Already watched
                swipeCard(direction: .up)
              } else {
                // Return to center
                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                  dragOffset = .zero
                  cardRotation = 0
                }
              }
            }
        )
        .overlay(swipeIndicators)
    }
    .padding(.horizontal, 80)
  }
  
  @ViewBuilder
  private func posterCard(item: SearchResult) -> some View {
    // Poster - using HD URL for better quality
    CachedAsyncImage(url: item.hdPosterURL ?? item.imageURL) { image in
      image
        .resizable()
        .aspectRatio(2/3, contentMode: .fit)
    } placeholder: {
      Rectangle()
        .fill(Color.appInputFilled)
        .aspectRatio(2/3, contentMode: .fit)
        .overlay(
          ProgressView()
        )
    }
    .clipShape(RoundedRectangle(cornerRadius: 32))
    .overlay(
      RoundedRectangle(cornerRadius: 32)
        .strokeBorder(Color.appBorderAdaptive.opacity(0.3), lineWidth: 1)
    )
    .shadow(color: .black.opacity(0.25), radius: 12, x: 0, y: 6)
  }
  
  // MARK: - Swipe Indicators
  
  @ViewBuilder
  private var swipeIndicators: some View {
    ZStack {
      // Want to watch (right)
      HStack {
        Spacer()
        Label(strings.onboardingWantToWatch, systemImage: "bookmark.fill")
          .font(.headline)
          .foregroundColor(.white)
          .padding(.horizontal, 16)
          .padding(.vertical, 8)
          .background(Color.blue)
          .clipShape(Capsule())
          .rotationEffect(.degrees(-15))
          .opacity(dragOffset.width > 50 ? min(1, dragOffset.width / 100) : 0)
        Spacer()
      }
      
      // Not interested (left)
      HStack {
        Spacer()
        Label(strings.onboardingNotInterested, systemImage: "xmark")
          .font(.headline)
          .foregroundColor(.white)
          .padding(.horizontal, 16)
          .padding(.vertical, 8)
          .background(Color.red)
          .clipShape(Capsule())
          .rotationEffect(.degrees(15))
          .opacity(dragOffset.width < -50 ? min(1, -dragOffset.width / 100) : 0)
        Spacer()
      }
      
      // Already watched (up)
      VStack {
        Label(strings.onboardingAlreadyWatched, systemImage: "checkmark.circle.fill")
          .font(.headline)
          .foregroundColor(.white)
          .padding(.horizontal, 16)
          .padding(.vertical, 8)
          .background(Color.green)
          .clipShape(Capsule())
          .opacity(dragOffset.height < -50 ? min(1, -dragOffset.height / 100) : 0)
        Spacer()
      }
      .padding(.top, 40)
    }
  }
  
  // MARK: - Action Buttons
  
  private var actionButtons: some View {
    FlowLayout(spacing: 8, alignment: .center) {
      // Not interested
      Button(action: { swipeCard(direction: .left) }) {
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
      
      // Already watched
      Button(action: { swipeCard(direction: .up) }) {
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
      
      // Want to watch
      Button(action: { swipeCard(direction: .right) }) {
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
    }
    .padding(.horizontal, 24)
  }
  
  // MARK: - Actions
  
  private enum SwipeDirection {
    case left, right, up
  }
  
  private func swipeCard(direction: SwipeDirection) {
    guard let item = currentItem else { return }
    
    let impact = UIImpactFeedbackGenerator(style: .medium)
    impact.impactOccurred()
    
    // Animate card off screen
    withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
      switch direction {
      case .left:
        dragOffset = CGSize(width: -500, height: 0)
        cardRotation = -30
      case .right:
        dragOffset = CGSize(width: 500, height: 0)
        cardRotation = 30
      case .up:
        dragOffset = CGSize(width: 0, height: -600)
        cardRotation = 0
      }
    }
    
    // Process action after animation
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
      // Process the action
      switch direction {
      case .left:
        // Not interested - just skip
        break
      case .right:
        // Want to watch
        addTitle(item, status: "WATCHLIST")
      case .up:
        // Already watched
        addTitle(item, status: "WATCHED")
      }
      
      // Reset offset first (without animation) before changing index
      var transaction = Transaction()
      transaction.disablesAnimations = true
      withTransaction(transaction) {
        dragOffset = .zero
        cardRotation = 0
      }
      
      // Then move to next card
      dismissedIds.insert(item.id)
      currentIndex += 1
      
      // Load more if needed
      if currentIndex >= items.count - 3 {
        Task {
          await loadMoreContent()
        }
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
      let genreIds = selectedGenres.map { $0.id }
      
      // Load content based on selected types AND genres
      if contentTypes.isEmpty && genreIds.isEmpty {
        // No preferences - show trending
        allItems = try await TMDBService.shared.getTrending(
          mediaType: "all",
          timeWindow: "week",
          language: language
        )
      } else {
        // Load based on content types and genres
        if contentTypes.contains(.movies) || contentTypes.isEmpty {
          let movies = try await loadDiscoverContent(
            mediaType: "movie",
            genreIds: genreIds,
            language: language,
            page: 1
          )
          allItems.append(contentsOf: movies)
        }
        
        if contentTypes.contains(.series) {
          let series = try await loadDiscoverContent(
            mediaType: "tv",
            genreIds: genreIds,
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
      
      // Remove duplicates and shuffle
      var seen = Set<Int>()
      items = allItems.filter { item in
        if seen.contains(item.id) { return false }
        seen.insert(item.id)
        return true
      }.shuffled()
      
      // Preload first few poster images in HD
      let posterUrls = items.prefix(5).compactMap { $0.hdPosterURL ?? $0.imageURL }
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
    let genreIds = selectedGenres.map { $0.id }
    
    do {
      var newItems: [SearchResult] = []
      
      if contentTypes.contains(.movies) || contentTypes.isEmpty {
        let movies = try await loadDiscoverContent(
          mediaType: "movie",
          genreIds: genreIds,
          language: language,
          page: currentPage
        )
        newItems.append(contentsOf: movies)
      }
      
      if contentTypes.contains(.series) {
        let series = try await loadDiscoverContent(
          mediaType: "tv",
          genreIds: genreIds,
          language: language,
          page: currentPage
        )
        newItems.append(contentsOf: series)
      }
      
      // Filter out already seen/dismissed items
      let existingIds = Set(items.map { $0.id }).union(dismissedIds)
      let uniqueNewItems = newItems.filter { !existingIds.contains($0.id) }
      
      items.append(contentsOf: uniqueNewItems.shuffled())
      
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
