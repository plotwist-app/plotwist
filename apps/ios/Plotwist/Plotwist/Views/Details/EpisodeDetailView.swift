//
//  EpisodeDetailView.swift
//  Plotwist

import SwiftUI

struct EpisodeDetailView: View {
  let seriesId: Int
  let seasonName: String
  let seasonPosterPath: String?
  let episode: Episode
  var nextEpisode: Episode?
  var previousEpisode: Episode?
  var allEpisodes: [Episode]?
  var allSeasons: [Season]?

  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var userReview: Review?
  @State private var isLoadingUserReview = false
  @State private var showReviewSheet = false
  @State private var reviewsRefreshId = UUID()
  @State private var hasReviews = false
  @State private var scrollOffset: CGFloat = 0
  @State private var initialScrollOffset: CGFloat? = nil
  
  // Episode progress state
  @State private var isWatched = false
  @State private var watchedEpisodeId: String?
  @State private var isLoadingWatchedStatus = false
  @State private var isTogglingWatched = false
  
  // Season navigation state
  @State private var nextSeasonDetails: SeasonDetails?
  @State private var previousSeasonDetails: SeasonDetails?
  @State private var isLoadingNextSeason = false
  @State private var isLoadingPreviousSeason = false
  
  // Swipe navigation state
  @State private var dragOffset: CGFloat = 0
  @State private var showSwipeIndicator = false
  @State private var navigateToPrevious = false
  @State private var navigateToNext = false
  @State private var navigateToPreviousSeason = false
  @State private var navigateToNextSeason = false

  private let scrollThreshold: CGFloat = 20
  private let swipeThreshold: CGFloat = 80
  
  // Check if we need season navigation
  private var needsPreviousSeasonNav: Bool {
    previousEpisode == nil && episode.seasonNumber > 1
  }
  
  private var needsNextSeasonNav: Bool {
    nextEpisode == nil && hasNextSeason
  }
  
  private var hasNextSeason: Bool {
    guard let seasons = allSeasons else { return false }
    return seasons.contains { $0.seasonNumber == episode.seasonNumber + 1 }
  }
  
  private var hasPreviousSeason: Bool {
    guard let seasons = allSeasons else { return false }
    return seasons.contains { $0.seasonNumber == episode.seasonNumber - 1 }
  }
  
  private var previousSeason: Season? {
    allSeasons?.first { $0.seasonNumber == episode.seasonNumber - 1 }
  }
  
  private var nextSeason: Season? {
    allSeasons?.first { $0.seasonNumber == episode.seasonNumber + 1 }
  }
  
  // Swipe action helpers
  private var canSwipeToPrevious: Bool {
    previousEpisode != nil || (needsPreviousSeasonNav && previousSeasonDetails != nil)
  }
  
  private var canSwipeToNext: Bool {
    nextEpisode != nil || (needsNextSeasonNav && nextSeasonDetails != nil)
  }
  
  private var swipeAction: SwipeAction? {
    if dragOffset > swipeThreshold && canSwipeToPrevious {
      if previousEpisode != nil {
        return .previousEpisode
      } else if needsPreviousSeasonNav && previousSeasonDetails != nil {
        return .previousSeason
      }
    } else if dragOffset < -swipeThreshold && canSwipeToNext {
      if nextEpisode != nil {
        return .nextEpisode
      } else if needsNextSeasonNav && nextSeasonDetails != nil {
        return .nextSeason
      }
    }
    return nil
  }
  
  private enum SwipeAction {
    case previousEpisode
    case nextEpisode
    case previousSeason
    case nextSeason
    
    var title: String {
      switch self {
      case .previousEpisode: return L10n.current.previousEpisode
      case .nextEpisode: return L10n.current.nextEpisode
      case .previousSeason: return L10n.current.previousSeason
      case .nextSeason: return L10n.current.nextSeason
      }
    }
    
    var icon: String {
      switch self {
      case .previousEpisode, .previousSeason: return "chevron.left"
      case .nextEpisode, .nextSeason: return "chevron.right"
      }
    }
    
    var isLeft: Bool {
      switch self {
      case .previousEpisode, .previousSeason: return true
      case .nextEpisode, .nextSeason: return false
      }
    }
  }

  private var isScrolled: Bool {
    guard let initial = initialScrollOffset else { return false }
    return scrollOffset < initial - scrollThreshold
  }

  private var seasonPosterURL: URL? {
    guard let seasonPosterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w500\(seasonPosterPath)")
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      ScrollView(showsIndicators: false) {
        VStack(alignment: .leading, spacing: 0) {
          // Header with poster and info
          EpisodeHeaderView(
            seasonName: seasonName,
            seasonPosterURL: seasonPosterURL,
            episode: episode,
            scrollOffset: $scrollOffset,
            initialScrollOffset: $initialScrollOffset
          )

          // Action Buttons Row (Watched + Review)
          if AuthService.shared.isAuthenticated {
            HStack(spacing: 8) {
              // Mark as Watched Button
              Button {
                Task {
                  await toggleWatchedStatus()
                }
              } label: {
                HStack(spacing: 6) {
                  if isTogglingWatched || isLoadingWatchedStatus {
                    ProgressView()
                      .progressViewStyle(CircularProgressViewStyle())
                      .scaleEffect(0.7)
                      .frame(width: 13, height: 13)
                  } else {
                    Image(systemName: isWatched ? "checkmark.circle.fill" : "circle")
                      .font(.system(size: 13))
                      .foregroundColor(isWatched ? .green : .appForegroundAdaptive)
                  }
                  
                  Text(isWatched ? strings.watched : strings.markAsWatched)
                    .font(.footnote.weight(.medium))
                    .foregroundColor(.appForegroundAdaptive)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(Color.appInputFilled)
                .cornerRadius(10)
                .opacity(isTogglingWatched || isLoadingWatchedStatus ? 0.5 : 1)
              }
              .buttonStyle(.plain)
              .disabled(isTogglingWatched || isLoadingWatchedStatus)
              
              // Review Button
              ReviewButton(
                hasReview: userReview != nil,
                isLoading: isLoadingUserReview,
                action: { showReviewSheet = true }
              )
            }
            .animation(.easeInOut(duration: 0.2), value: isWatched)
            .padding(.horizontal, 24)
            .padding(.top, 24)
          }

          // Overview
          if let overview = episode.overview, !overview.isEmpty {
            Text(overview)
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
              .lineSpacing(6)
              .padding(.horizontal, 24)
              .padding(.top, 20)
          }

          // Divider before reviews
          if hasReviews {
            sectionDivider
          }

          // Reviews Section
          EpisodeReviewSectionView(
            seriesId: seriesId,
            seasonNumber: episode.seasonNumber,
            episodeNumber: episode.episodeNumber,
            refreshId: reviewsRefreshId,
            onEmptyStateTapped: {
              if AuthService.shared.isAuthenticated {
                showReviewSheet = true
              }
            },
            onContentLoaded: { hasContent in
              hasReviews = hasContent
            }
          )

          Spacer()
            .frame(height: 40)
        }
      }
      .offset(x: dragOffset * 0.3)
      .gesture(
        DragGesture(minimumDistance: 20)
          .onChanged { value in
            let translation = value.translation.width
            
            // Only allow swipe in valid directions
            if translation > 0 && canSwipeToPrevious {
              dragOffset = translation
              showSwipeIndicator = true
            } else if translation < 0 && canSwipeToNext {
              dragOffset = translation
              showSwipeIndicator = true
            } else {
              dragOffset = translation * 0.2 // Resistance when can't swipe
            }
          }
          .onEnded { value in
            let translation = value.translation.width
            
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
              showSwipeIndicator = false
              dragOffset = 0
            }
            
            // Execute navigation based on swipe direction
            if translation > swipeThreshold && canSwipeToPrevious {
              if previousEpisode != nil {
                navigateToPrevious = true
              } else if needsPreviousSeasonNav && previousSeasonDetails != nil {
                navigateToPreviousSeason = true
              }
            } else if translation < -swipeThreshold && canSwipeToNext {
              if nextEpisode != nil {
                navigateToNext = true
              } else if needsNextSeasonNav && nextSeasonDetails != nil {
                navigateToNextSeason = true
              }
            }
          }
      )
      
      // Swipe Indicator Overlay
      if showSwipeIndicator, let action = swipeAction {
        swipeIndicatorView(action: action)
      }
      
      // Hidden NavigationLinks for programmatic navigation
      if let prev = previousEpisode {
        NavigationLink(
          destination: EpisodeDetailView(
            seriesId: seriesId,
            seasonName: seasonName,
            seasonPosterPath: seasonPosterPath,
            episode: prev,
            nextEpisode: episode,
            previousEpisode: getPreviousEpisode(before: prev),
            allEpisodes: allEpisodes,
            allSeasons: allSeasons
          ),
          isActive: $navigateToPrevious
        ) { EmptyView() }
      }
      
      if let next = nextEpisode {
        NavigationLink(
          destination: EpisodeDetailView(
            seriesId: seriesId,
            seasonName: seasonName,
            seasonPosterPath: seasonPosterPath,
            episode: next,
            nextEpisode: getNextEpisode(after: next),
            previousEpisode: episode,
            allEpisodes: allEpisodes,
            allSeasons: allSeasons
          ),
          isActive: $navigateToNext
        ) { EmptyView() }
      }
      
      if let prevSeason = previousSeason,
         let seasonDetails = previousSeasonDetails,
         let lastEpisode = seasonDetails.episodes.last {
        NavigationLink(
          destination: EpisodeDetailView(
            seriesId: seriesId,
            seasonName: prevSeason.name,
            seasonPosterPath: prevSeason.posterPath,
            episode: lastEpisode,
            nextEpisode: nil,
            previousEpisode: getEpisodeBefore(lastEpisode, in: seasonDetails.episodes),
            allEpisodes: seasonDetails.episodes,
            allSeasons: allSeasons
          ),
          isActive: $navigateToPreviousSeason
        ) { EmptyView() }
      }
      
      if let nextSeasonData = nextSeason,
         let seasonDetails = nextSeasonDetails,
         let firstEpisode = seasonDetails.episodes.first {
        NavigationLink(
          destination: EpisodeDetailView(
            seriesId: seriesId,
            seasonName: nextSeasonData.name,
            seasonPosterPath: nextSeasonData.posterPath,
            episode: firstEpisode,
            nextEpisode: getEpisodeAfter(firstEpisode, in: seasonDetails.episodes),
            previousEpisode: nil,
            allEpisodes: seasonDetails.episodes,
            allSeasons: allSeasons
          ),
          isActive: $navigateToNextSeason
        ) { EmptyView() }
      }

      // Navigation Header
      navigationHeader
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .sheet(isPresented: $showReviewSheet) {
      ReviewSheet(
        mediaId: seriesId,
        mediaType: "tv",
        seasonNumber: episode.seasonNumber,
        episodeNumber: episode.episodeNumber,
        existingReview: userReview,
        onSaved: {
          Task {
            await loadUserReview()
          }
          reviewsRefreshId = UUID()
        },
        onDeleted: {
          userReview = nil
          reviewsRefreshId = UUID()
        }
      )
    }
    .task {
      if AuthService.shared.isAuthenticated {
        isLoadingUserReview = true
        async let reviewTask: () = loadUserReview()
        async let watchedTask: () = loadWatchedStatus()
        _ = await (reviewTask, watchedTask)
      }
      
      // Preload adjacent season details for smoother navigation
      if needsPreviousSeasonNav && previousSeasonDetails == nil {
        await loadPreviousSeasonDetails()
      }
      if needsNextSeasonNav && nextSeasonDetails == nil {
        await loadNextSeasonDetails()
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
    .onReceive(NotificationCenter.default.publisher(for: .dismissEpisodeToSeason)) { _ in
      dismiss()
    }
  }

  // MARK: - Get Next Episode
  private func getNextEpisode(after current: Episode) -> Episode? {
    guard let episodes = allEpisodes else { return nil }
    guard let currentIndex = episodes.firstIndex(where: { 
      $0.seasonNumber == current.seasonNumber && $0.episodeNumber == current.episodeNumber 
    }) else { return nil }
    let nextIndex = currentIndex + 1
    guard nextIndex < episodes.count else { return nil }
    return episodes[nextIndex]
  }

  // MARK: - Get Previous Episode
  private func getPreviousEpisode(before current: Episode) -> Episode? {
    guard let episodes = allEpisodes else { return nil }
    guard let currentIndex = episodes.firstIndex(where: { 
      $0.seasonNumber == current.seasonNumber && $0.episodeNumber == current.episodeNumber 
    }) else { return nil }
    let prevIndex = currentIndex - 1
    guard prevIndex >= 0 else { return nil }
    return episodes[prevIndex]
  }
  
  // MARK: - Get Episode Before (in a given episode list)
  private func getEpisodeBefore(_ current: Episode, in episodes: [Episode]) -> Episode? {
    guard let currentIndex = episodes.firstIndex(where: { 
      $0.seasonNumber == current.seasonNumber && $0.episodeNumber == current.episodeNumber 
    }) else { return nil }
    let prevIndex = currentIndex - 1
    guard prevIndex >= 0 else { return nil }
    return episodes[prevIndex]
  }
  
  // MARK: - Get Episode After (in a given episode list)
  private func getEpisodeAfter(_ current: Episode, in episodes: [Episode]) -> Episode? {
    guard let currentIndex = episodes.firstIndex(where: { 
      $0.seasonNumber == current.seasonNumber && $0.episodeNumber == current.episodeNumber 
    }) else { return nil }
    let nextIndex = currentIndex + 1
    guard nextIndex < episodes.count else { return nil }
    return episodes[nextIndex]
  }
  
  // MARK: - Load Previous Season Details
  private func loadPreviousSeasonDetails() async {
    guard let prevSeason = previousSeason else { return }
    isLoadingPreviousSeason = true
    defer { isLoadingPreviousSeason = false }
    
    do {
      let details = try await TMDBService.shared.getSeasonDetails(
        seriesId: seriesId,
        seasonNumber: prevSeason.seasonNumber
      )
      previousSeasonDetails = details
    } catch {
      print("Error loading previous season details: \(error)")
    }
  }
  
  // MARK: - Load Next Season Details
  private func loadNextSeasonDetails() async {
    guard let nextSeasonData = nextSeason else { return }
    isLoadingNextSeason = true
    defer { isLoadingNextSeason = false }
    
    do {
      let details = try await TMDBService.shared.getSeasonDetails(
        seriesId: seriesId,
        seasonNumber: nextSeasonData.seasonNumber
      )
      nextSeasonDetails = details
    } catch {
      print("Error loading next season details: \(error)")
    }
  }

  // MARK: - Load Watched Status
  private func loadWatchedStatus() async {
    isLoadingWatchedStatus = true
    defer { isLoadingWatchedStatus = false }
    
    do {
      let watchedEpisodes = try await UserEpisodeService.shared.getWatchedEpisodes(tmdbId: seriesId)
      let watched = watchedEpisodes.first { 
        $0.seasonNumber == episode.seasonNumber && $0.episodeNumber == episode.episodeNumber 
      }
      isWatched = watched != nil
      watchedEpisodeId = watched?.id
    } catch {
      print("Error loading watched status: \(error)")
    }
  }

  // MARK: - Toggle Watched Status
  private func toggleWatchedStatus() async {
    isTogglingWatched = true
    defer { isTogglingWatched = false }
    
    do {
      if isWatched, let episodeId = watchedEpisodeId {
        // Unmark as watched
        try await UserEpisodeService.shared.unmarkAsWatched(id: episodeId, tmdbId: seriesId)
        isWatched = false
        watchedEpisodeId = nil
      } else {
        // Mark as watched
        let userEpisode = try await UserEpisodeService.shared.markAsWatched(
          tmdbId: seriesId,
          seasonNumber: episode.seasonNumber,
          episodeNumber: episode.episodeNumber,
          runtime: episode.runtime
        )
        isWatched = true
        watchedEpisodeId = userEpisode.id
        
        // Also set the series status to "WATCHING" if not already set
        await ensureSeriesStatusIsWatching()
      }
      
      // Invalidate collection cache to update profile
      NotificationCenter.default.post(name: .collectionCacheInvalidated, object: nil)
    } catch UserEpisodeError.alreadyExists {
      // Episode already marked, just update UI
      isWatched = true
    } catch {
      print("Error toggling watched status: \(error)")
    }
  }

  // MARK: - Ensure Series Status is Watching
  private func ensureSeriesStatusIsWatching() async {
    do {
      let userItem = try await UserItemService.shared.getUserItem(tmdbId: seriesId, mediaType: "TV_SHOW")
      
      // Only set to WATCHING if no status or if in WATCHLIST
      if userItem == nil || userItem?.status == "WATCHLIST" {
        _ = try await UserItemService.shared.upsertUserItem(
          tmdbId: seriesId,
          mediaType: "TV_SHOW",
          status: .watching
        )
      }
    } catch {
      print("Error ensuring series status: \(error)")
    }
  }

  // MARK: - Swipe Indicator View
  @ViewBuilder
  private func swipeIndicatorView(action: SwipeAction) -> some View {
    let progress = min(abs(dragOffset) / swipeThreshold, 1.0)
    
    VStack {
      Spacer()
      
      HStack {
        if !action.isLeft {
          Spacer()
        }
        
        HStack(spacing: 6) {
          if action.isLeft {
            Image(systemName: action.icon)
              .font(.system(size: 13, weight: .medium))
          }
          
          Text(action.title)
            .font(.footnote.weight(.medium))
          
          if !action.isLeft {
            Image(systemName: action.icon)
              .font(.system(size: 13, weight: .medium))
          }
        }
        .foregroundColor(.appForegroundAdaptive)
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Color.appInputFilled)
        .cornerRadius(10)
        .scaleEffect(0.8 + (0.2 * progress))
        .opacity(Double(progress))
        
        if action.isLeft {
          Spacer()
        }
      }
      .padding(.horizontal, 24)
      
      Spacer()
    }
    .frame(maxWidth: .infinity)
    .allowsHitTesting(false)
  }

  // MARK: - Section Divider
  private var sectionDivider: some View {
    Rectangle()
      .fill(Color.appBorderAdaptive.opacity(0.5))
      .frame(height: 1)
      .padding(.horizontal, 24)
      .padding(.vertical, 24)
  }

  // MARK: - Navigation Header
  private var navigationHeader: some View {
    VStack {
      HStack {
        Button {
          dismiss()
        } label: {
          Image(systemName: "chevron.left")
            .font(.system(size: 18, weight: .semibold))
            .foregroundColor(.appForegroundAdaptive)
            .frame(width: 40, height: 40)
        }

        Spacer()

        Button {
          // Post notification to dismiss all episode views back to season
          NotificationCenter.default.post(name: .dismissEpisodeToSeason, object: nil)
        } label: {
          Text(seasonName)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)
            .underline(color: .appMutedForegroundAdaptive.opacity(0.5))
            .baselineOffset(-2)
            .lineLimit(1)
        }
        .buttonStyle(.plain)

        Spacer()

        Color.clear
          .frame(width: 40, height: 40)
      }
      .padding(.horizontal, 16)
      .padding(.vertical, 12)
      .background(Color.appBackgroundAdaptive)
      .overlay(
        Rectangle()
          .fill(Color.appBorderAdaptive)
          .frame(height: 1)
          .opacity(isScrolled ? 1 : 0),
        alignment: .bottom
      )
      .animation(.easeInOut(duration: 0.2), value: isScrolled)

      Spacer()
    }
  }

  // MARK: - Load User Review
  private func loadUserReview() async {
    isLoadingUserReview = true
    defer { isLoadingUserReview = false }

    do {
      userReview = try await ReviewService.shared.getUserReview(
        tmdbId: seriesId,
        mediaType: "TV_SHOW",
        seasonNumber: episode.seasonNumber,
        episodeNumber: episode.episodeNumber
      )
    } catch {
      userReview = nil
    }
  }
}

// MARK: - Episode Header View
struct EpisodeHeaderView: View {
  let seasonName: String
  let seasonPosterURL: URL?
  let episode: Episode
  @Binding var scrollOffset: CGFloat
  @Binding var initialScrollOffset: CGFloat?
  var topPadding: CGFloat = 80

  private var formattedAirDate: String? {
    guard let airDate = episode.airDate else { return nil }
    let inputFormatter = DateFormatter()
    inputFormatter.dateFormat = "yyyy-MM-dd"
    guard let date = inputFormatter.date(from: airDate) else { return nil }

    let outputFormatter = DateFormatter()
    outputFormatter.dateFormat = "d 'de' MMMM 'de' yyyy"
    outputFormatter.locale = Locale(identifier: Language.current.rawValue)
    return outputFormatter.string(from: date)
  }

  var body: some View {
    HStack(alignment: .bottom, spacing: 16) {
      // Season Poster
      CachedAsyncImage(url: seasonPosterURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
          .fill(Color.appBorderAdaptive)
          .overlay(
            ProgressView()
              .scaleEffect(0.8)
          )
      }
      .frame(width: 120, height: 180)
      .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
      .posterBorder()
      .posterShadow()

      // Info
      VStack(alignment: .leading, spacing: 4) {
        if let airDate = formattedAirDate {
          Text(airDate)
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
        }

        Text("\(episode.episodeNumber). \(episode.name)")
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)
          .lineLimit(3)
      }
      .padding(.bottom, 8)

      Spacer()
    }
    .padding(.horizontal, 24)
    .padding(.top, topPadding)
    .background(
      GeometryReader { geo -> Color in
        DispatchQueue.main.async {
          let offset = geo.frame(in: .global).minY
          if initialScrollOffset == nil {
            initialScrollOffset = offset
          }
          scrollOffset = offset
        }
        return Color.clear
      }
    )
  }
}

// MARK: - Episode Review Section View
struct EpisodeReviewSectionView: View {
  let seriesId: Int
  let seasonNumber: Int
  let episodeNumber: Int
  let refreshId: UUID
  var onEmptyStateTapped: (() -> Void)?
  var onContentLoaded: ((Bool) -> Void)?

  @State private var reviews: [ReviewListItem] = []
  @State private var isLoading = true
  @State private var hasLoaded = false

  private var averageRating: Double {
    guard !reviews.isEmpty else { return 0 }
    let total = reviews.reduce(0) { $0 + $1.rating }
    return total / Double(reviews.count)
  }

  private var reviewsWithText: [ReviewListItem] {
    reviews.filter { !$0.review.isEmpty }
  }

  var body: some View {
    Group {
      if isLoading {
        reviewsSkeleton
      } else if reviews.isEmpty {
        emptyState
      } else {
        reviewsContent
      }
    }
    .task {
      await loadReviews()
    }
    .onChange(of: refreshId) { _, _ in
      Task {
        await loadReviews(forceReload: true)
      }
    }
  }

  // MARK: - Empty State
  private var emptyState: some View {
    VStack(spacing: 0) {
      // Divider
      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
        .padding(.horizontal, 24)
        .padding(.top, 24)

      Button {
        onEmptyStateTapped?()
      } label: {
        VStack(spacing: 12) {
          Image(systemName: "star.bubble")
            .font(.system(size: 40))
            .foregroundColor(.appMutedForegroundAdaptive.opacity(0.6))

          Text(L10n.current.beFirstToReview)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
      }
      .buttonStyle(.plain)
    }
  }

  // MARK: - Reviews Skeleton
  private var reviewsSkeleton: some View {
    VStack(spacing: 16) {
      HStack(spacing: 6) {
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 16, height: 16)
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 30, height: 18)
        Circle()
          .fill(Color.appBorderAdaptive)
          .frame(width: 4, height: 4)
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 80, height: 14)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .padding(.horizontal, 24)
    }
  }

  // MARK: - Reviews Content
  private var reviewsContent: some View {
    VStack(spacing: 16) {
      // Rating Header
      HStack(spacing: 6) {
        Image(systemName: "star.fill")
          .font(.system(size: 16))
          .foregroundColor(.appStarYellow)

        Text(String(format: "%.1f", averageRating))
          .font(.system(size: 18, weight: .semibold))
          .foregroundColor(.appForegroundAdaptive)

        Circle()
          .fill(Color.appMutedForegroundAdaptive.opacity(0.5))
          .frame(width: 4, height: 4)

        Text(
          "\(reviews.count) \(reviews.count == 1 ? L10n.current.reviewSingular.lowercased() : L10n.current.tabReviews.lowercased())"
        )
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .padding(.horizontal, 24)

      // Horizontal scrolling reviews
      if !reviewsWithText.isEmpty {
        ScrollView(.horizontal, showsIndicators: false) {
          HStack(alignment: .top, spacing: 0) {
            ForEach(Array(reviewsWithText.enumerated()), id: \.element.id) { index, review in
              HStack(alignment: .top, spacing: 0) {
                ReviewCardView(review: review)
                  .frame(width: min(UIScreen.main.bounds.width * 0.75, 300))
                  .padding(.leading, index == 0 ? 24 : 0)
                  .padding(.trailing, 24)

                if index < reviewsWithText.count - 1 {
                  Rectangle()
                    .fill(Color.appBorderAdaptive.opacity(0.5))
                    .frame(width: 1)
                    .frame(height: 140)
                    .padding(.trailing, 24)
                }
              }
            }
          }
        }
      }
    }
  }

  // MARK: - Load Reviews
  private func loadReviews(forceReload: Bool = false) async {
    guard !hasLoaded || forceReload else {
      isLoading = false
      onContentLoaded?(!reviews.isEmpty)
      return
    }

    isLoading = true

    do {
      reviews = try await ReviewService.shared.getReviews(
        tmdbId: seriesId,
        mediaType: "TV_SHOW",
        seasonNumber: seasonNumber,
        episodeNumber: episodeNumber
      )
      isLoading = false
      hasLoaded = true
      onContentLoaded?(!reviews.isEmpty)
    } catch {
      isLoading = false
      hasLoaded = true
      onContentLoaded?(false)
    }
  }
}

// MARK: - Notification Names
extension Notification.Name {
  static let dismissEpisodeToSeason = Notification.Name("dismissEpisodeToSeason")
}
