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
  
  // Animation states
  @State private var isTransitioning = false
  @State private var exitingItem: SearchResult? = nil
  @State private var exitOffset: CGSize = .zero
  @State private var exitRotation: Double = 0
  
  // Track dismissed items to avoid showing them again
  @State private var dismissedIds: Set<Int> = []
  
  // Card position configurations
  private struct CardPosition {
    let scale: CGFloat
    let rotation: Double
    let offsetX: CGFloat
    let offsetY: CGFloat
    
    static let front = CardPosition(scale: 1.0, rotation: 0, offsetX: 0, offsetY: 0)
    static let second = CardPosition(scale: 0.93, rotation: 10, offsetX: 12, offsetY: 4)
    static let third = CardPosition(scale: 0.86, rotation: -18, offsetX: -20, offsetY: 8)
  }
  
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
        } else if currentItem != nil {
          cardStack()
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
    items[safe: currentIndex + 2]
  }
  
  private var fourthItem: SearchResult? {
    items[safe: currentIndex + 3]
  }
  
  @ViewBuilder
  private func cardStack() -> some View {
    let springAnimation = Animation.spring(response: 0.4, dampingFraction: 0.8)
    
    ZStack {
      // Fourth card (appears at third position during transition)
      if isTransitioning, let fourth = fourthItem {
        posterCard(item: fourth)
          .id("card-\(fourth.id)")
          .scaleEffect(CardPosition.third.scale)
          .rotationEffect(.degrees(CardPosition.third.rotation))
          .offset(x: CardPosition.third.offsetX, y: CardPosition.third.offsetY)
          .zIndex(-1)
      }
      
      // Third card - animates from third to second position during transition
      if let third = thirdItem {
        let pos = isTransitioning ? CardPosition.second : CardPosition.third
        posterCard(item: third)
          .id("card-\(third.id)")
          .scaleEffect(pos.scale)
          .rotationEffect(.degrees(pos.rotation))
          .offset(x: pos.offsetX, y: pos.offsetY)
          .zIndex(0)
          .animation(springAnimation, value: isTransitioning)
      }
      
      // Second card - animates from second to front position during transition
      if let next = nextItem {
        let pos = isTransitioning ? CardPosition.front : CardPosition.second
        posterCard(item: next)
          .id("card-\(next.id)")
          .scaleEffect(pos.scale)
          .rotationEffect(.degrees(pos.rotation))
          .offset(x: pos.offsetX, y: pos.offsetY)
          .zIndex(1)
          .animation(springAnimation, value: isTransitioning)
      }
      
      // Current front card (only when not transitioning)
      if !isTransitioning, let current = currentItem {
        posterCard(item: current)
          .id("card-\(current.id)")
          .scaleEffect(CardPosition.front.scale)
          .rotationEffect(.degrees(cardRotation))
          .offset(dragOffset)
          .zIndex(2)
          .gesture(
            DragGesture()
              .onChanged { gesture in
                guard exitingItem == nil else { return }
                dragOffset = gesture.translation
                cardRotation = Double(gesture.translation.width / 20)
              }
              .onEnded { gesture in
                guard exitingItem == nil else { return }
                let threshold: CGFloat = 100
                
                if gesture.translation.width > threshold {
                  swipeCard(direction: .right)
                } else if gesture.translation.width < -threshold {
                  swipeCard(direction: .left)
                } else if gesture.translation.height < -threshold {
                  swipeCard(direction: .up)
                } else {
                  withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                    dragOffset = .zero
                    cardRotation = 0
                  }
                }
              }
          )
          .overlay(swipeIndicators)
      }
      
      // Exiting card (animates off screen from drag position)
      if let exiting = exitingItem {
        posterCard(item: exiting)
          .id("exiting-\(exiting.id)")
          .scaleEffect(CardPosition.front.scale)
          .offset(exitOffset)
          .rotationEffect(.degrees(exitRotation))
          .zIndex(3)
      }
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
      swipeIndicatorPill(
        icon: "bookmark.fill",
        iconColor: .blue,
        text: strings.onboardingWantToWatch
      )
      .opacity(dragOffset.width > 50 ? min(1, dragOffset.width / 100) : 0)
      
      // Not interested (left)
      swipeIndicatorPill(
        icon: "xmark",
        iconColor: .red,
        text: strings.onboardingNotInterested
      )
      .opacity(dragOffset.width < -50 ? min(1, -dragOffset.width / 100) : 0)
      
      // Already watched (up)
      swipeIndicatorPill(
        icon: "checkmark.circle.fill",
        iconColor: .green,
        text: strings.onboardingAlreadyWatched
      )
      .opacity(dragOffset.height < -50 ? min(1, -dragOffset.height / 100) : 0)
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
    guard !isTransitioning else { return } // Prevent double swipe
    
    let impact = UIImpactFeedbackGenerator(style: .medium)
    impact.impactOccurred()
    
    // Process the action
    switch direction {
    case .left:
      break // Not interested - just skip
    case .right:
      addTitle(item, status: "WATCHLIST")
    case .up:
      addTitle(item, status: "WATCHED")
    }
    
    dismissedIds.insert(item.id)
    
    // Set up exiting card with current drag position
    exitingItem = item
    exitOffset = dragOffset
    exitRotation = cardRotation
    
    // Reset drag state
    dragOffset = .zero
    cardRotation = 0
    
    // Start transition - background cards animate to new positions
    isTransitioning = true
    
    // Animate exiting card off screen
    withAnimation(.easeOut(duration: 0.35)) {
      switch direction {
      case .left:
        exitOffset = CGSize(width: -500, height: 0)
        exitRotation = -30
      case .right:
        exitOffset = CGSize(width: 500, height: 0)
        exitRotation = 30
      case .up:
        exitOffset = CGSize(width: 0, height: -600)
        exitRotation = 0
      }
    }
    
    // After animation completes, update index and reset state
    Task { @MainActor in
      try? await Task.sleep(nanoseconds: 400_000_000)
      
      // Update index and reset state without animation
      var transaction = Transaction()
      transaction.disablesAnimations = true
      withTransaction(transaction) {
        currentIndex += 1
        isTransitioning = false
        exitingItem = nil
        exitOffset = .zero
        exitRotation = 0
      }
    }
    
    // Load more if needed
    if currentIndex >= items.count - 5 {
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
      
      // Remove duplicates (keep order by popularity)
      var seen = Set<Int>()
      items = allItems.filter { item in
        if seen.contains(item.id) { return false }
        seen.insert(item.id)
        return true
      }
      
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
      
      items.append(contentsOf: uniqueNewItems)
      
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

// MARK: - Safe Array Subscript

private extension Array {
  subscript(safe index: Index) -> Element? {
    indices.contains(index) ? self[index] : nil
  }
}
