//
//  MediaDetailView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Media Detail Cache
class MediaDetailCache {
  static let shared = MediaDetailCache()
  private init() {}

  private var cache: [String: CachedEntry] = [:]
  private let cacheDuration: TimeInterval = 300

  private struct CachedEntry {
    let details: MovieDetails?
    let images: [TMDBImage]
    let collection: MovieCollection?
    let timestamp: Date
  }

  private func key(_ mediaId: Int, _ mediaType: String) -> String {
    "\(mediaType)_\(mediaId)"
  }

  func get(mediaId: Int, mediaType: String) -> (details: MovieDetails?, images: [TMDBImage], collection: MovieCollection?)? {
    let k = key(mediaId, mediaType)
    guard let entry = cache[k],
          Date().timeIntervalSince(entry.timestamp) < cacheDuration else {
      return nil
    }
    return (entry.details, entry.images, entry.collection)
  }

  func set(mediaId: Int, mediaType: String, details: MovieDetails?, images: [TMDBImage], collection: MovieCollection?) {
    let k = key(mediaId, mediaType)
    cache[k] = CachedEntry(details: details, images: images, collection: collection, timestamp: Date())
  }

  func invalidate(mediaId: Int, mediaType: String) {
    cache.removeValue(forKey: key(mediaId, mediaType))
  }
}

struct MediaDetailView: View {
  let mediaId: Int
  let mediaType: String
  var initialBackdropURL: URL? = nil

  @Environment(\.dismiss) private var dismiss
  @State private var details: MovieDetails?
  @State private var isLoading = true
  @State private var userReview: Review?
  @State private var userItem: UserItem?
  @State private var isLoadingUserReview = false
  @State private var isLoadingUserItem = false
  @State private var showReviewSheet = false
  @State private var reviewsRefreshId = UUID()
  @State private var backdropImages: [TMDBImage] = []
  @State private var currentBackdropIndex = 0
  @ObservedObject private var themeManager = ThemeManager.shared

  // Favorite state (moved from actions bar to menu)
  @State private var isFavorite = false
  @State private var isTogglingFavorite = false

  // Recommendation
  @State private var showRecommendSheet = false

  // Section visibility state
  @State private var hasCast = false
  @State private var hasReviews = false
  @State private var hasWhereToWatch = false
  @State private var hasSeasons = false
  @State private var hasRecommendations = false

  // Collection state
  @State private var collection: MovieCollection?
  @State private var isCollectionExpanded = false
  @State private var collectionAbovePoster = false
  @State private var showLoginPrompt = false

  // Layout constants
  private let cornerRadius: CGFloat = 24
  private let posterOverlapOffset: CGFloat = -70

  /// Resolve the best backdrop URL: prefer details (API), fall back to initialBackdropURL (from card cache)
  private var resolvedBackdropURL: URL? {
    details?.backdropURL ?? initialBackdropURL
  }

  var body: some View {
    ZStack {
      // Background color
      Color.appBackgroundAdaptive.ignoresSafeArea()

      if isLoading && initialBackdropURL == nil {
        // No pre-cached backdrop available — show full skeleton
        MediaDetailSkeletonView(cornerRadius: cornerRadius)
      } else {
        // Unified layout: backdrop stays in place, content transitions from skeleton → real
        GeometryReader { geometry in
          let backdropHeight = geometry.size.height * 0.45

          ZStack(alignment: .topLeading) {
            ScrollView(showsIndicators: false) {
              VStack(alignment: .leading, spacing: 0) {
                // MARK: Backdrop Section
                ZStack(alignment: .bottomTrailing) {
                  if !backdropImages.isEmpty {
                    NavigationLink(
                      destination: MediaImagesView(mediaId: mediaId, mediaType: mediaType)
                    ) {
                      CarouselBackdropView(
                        images: backdropImages,
                        height: backdropHeight + cornerRadius,
                        currentIndex: $currentBackdropIndex
                      )
                    }
                    .buttonStyle(.plain)
                  } else if let url = resolvedBackdropURL {
                    // Check cache synchronously so the image is visible on the very first frame.
                    // This avoids any placeholder flash during the zoom transition.
                    if let cached = ImageCache.shared.image(for: url) {
                      Image(uiImage: cached)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: geometry.size.width, height: backdropHeight + cornerRadius)
                        .clipped()
                    } else {
                      // Fallback: image not in cache yet, load async
                      CachedAsyncImage(url: url, priority: .high, animated: false) { image in
                        image
                          .resizable()
                          .aspectRatio(contentMode: .fill)
                      } placeholder: {
                        Rectangle()
                          .fill(Color.appBorderAdaptive)
                      }
                      .frame(width: geometry.size.width, height: backdropHeight + cornerRadius)
                      .clipped()
                    }
                  } else {
                    Rectangle()
                      .fill(Color.appBorderAdaptive)
                      .frame(height: backdropHeight + cornerRadius)
                  }

                  // Image counter
                  if !backdropImages.isEmpty {
                    Text("\(currentBackdropIndex + 1)/\(min(backdropImages.count, 10))")
                      .font(.caption.weight(.semibold))
                      .foregroundColor(.white)
                      .padding(.horizontal, 10)
                      .padding(.vertical, 6)
                      .background(Color.black.opacity(0.6))
                      .clipShape(RoundedRectangle(cornerRadius: 6))
                      .padding(.trailing, 16)
                      .padding(.bottom, cornerRadius + 12)
                  }
                }

                // MARK: Content Card (rounded, overlaps backdrop)
                ZStack(alignment: .topLeading) {
                  // Background layer (always behind poster)
                  Color.appBackgroundAdaptive
                    .clipShape(
                      RoundedCorner(radius: cornerRadius, corners: [.topLeft, .topRight])
                    )

                  // Content layer (above poster when collection is expanded)
                  VStack(alignment: .leading, spacing: 0) {
                    Spacer()
                      .frame(height: 110)

                    if let details {
                      detailsContent(details)
                        .transition(.opacity.animation(.easeOut(duration: 0.2)))
                    } else {
                      loadingContentSkeleton()
                        .transition(.opacity.animation(.easeOut(duration: 0.15)))
                    }
                  }
                  .zIndex(collectionAbovePoster ? 2 : 0)

                  // Poster and Info (always zIndex 1)
                  Group {
                    if let details {
                      posterAndInfo(details)
                        .transition(.opacity.animation(.easeOut(duration: 0.2)))
                    } else {
                      posterAndInfoSkeleton()
                        .transition(.opacity.animation(.easeOut(duration: 0.15)))
                    }
                  }
                  .zIndex(1)
                }
                .offset(y: -cornerRadius)
              }
            }
            .ignoresSafeArea(edges: .top)
            .scrollClipDisabled(isCollectionExpanded)
            .scrollDisabled(isCollectionExpanded)
            .onChange(of: isCollectionExpanded) { _, expanded in
              if expanded {
                collectionAbovePoster = true
              } else {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.55) {
                  collectionAbovePoster = false
                }
              }
            }

            // Sticky Back + Menu Buttons (hidden when collection is expanded)
            if !isCollectionExpanded {
              VStack {
                HStack {
                  Button {
                    dismiss()
                  } label: {
                    Image(systemName: "chevron.left")
                      .font(.system(size: 18, weight: .semibold))
                      .foregroundColor(.white)
                      .frame(width: 40, height: 40)
                      .background(.ultraThinMaterial)
                      .clipShape(Circle())
                  }

                  Spacer()

                  Menu {
                    Button {
                      if AuthService.shared.isAuthenticated {
                        Task { await toggleFavorite() }
                      } else {
                        showLoginPrompt = true
                      }
                    } label: {
                      Label(
                        isFavorite ? L10n.current.favorited : L10n.current.favorite,
                        systemImage: isFavorite ? "heart.fill" : "heart"
                      )
                    }

                    Button {
                      if AuthService.shared.isAuthenticated {
                        showRecommendSheet = true
                      } else {
                        showLoginPrompt = true
                      }
                    } label: {
                      Label(L10n.current.recommend, systemImage: "paperplane")
                    }
                  } label: {
                    Image(systemName: "ellipsis")
                      .font(.system(size: 18, weight: .semibold))
                      .foregroundColor(.white)
                      .frame(width: 40, height: 40)
                      .background(.ultraThinMaterial)
                      .clipShape(Circle())
                  }
                }
                .padding(.horizontal, 24)
                Spacer()
              }
              .padding(.top, 16)
            }

          }
        }
      }

    }
    .navigationBarBackButtonHidden(true)
    .toolbar(.hidden, for: .navigationBar)
    .background { ForceHideNavigationBar() }
    .preferredColorScheme(themeManager.current.colorScheme)
    .sheet(isPresented: $showReviewSheet) {
      ReviewSheet(
        mediaId: mediaId,
        mediaType: mediaType,
        existingReview: userReview,
        mediaTitle: details?.displayTitle,
        mediaPosterPath: details?.posterPath,
        mediaYear: details?.year,
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
    .sheet(isPresented: $showRecommendSheet) {
      RecommendSheet(
        mediaId: mediaId,
        mediaType: mediaType,
        mediaTitle: details?.displayTitle ?? "",
        mediaPosterPath: details?.posterPath,
        mediaOverview: details?.overview
      )
      .floatingSheetPresentation(height: 480)
      .preferredColorScheme(themeManager.current.colorScheme)
    }
    .loginPrompt(isPresented: $showLoginPrompt) {
      // User logged in - reload user-specific data
      Task {
        isLoadingUserReview = true
        isLoadingUserItem = true
        await loadUserReview()
        await loadUserItem()
      }
    }
    .onAppear { restoreFromCache() }
    .task {
      if AuthService.shared.isAuthenticated {
        isLoadingUserReview = true
        isLoadingUserItem = true
      }

      await loadDetails()

      await withTaskGroup(of: Void.self) { group in
        group.addTask { await loadImages() }
        group.addTask { await loadCollection() }
        if AuthService.shared.isAuthenticated {
          group.addTask { await loadUserReview() }
          group.addTask { await loadUserItem() }
          group.addTask { await loadFavoriteStatus() }
        }
      }

      saveToCache()
    }
  }

  // MARK: - Content Subviews

  @ViewBuilder
  private func detailsContent(_ details: MovieDetails) -> some View {
    MediaDetailViewActions(
      mediaId: mediaId,
      mediaType: mediaType,
      userReview: userReview,
      userItem: userItem,
      isLoadingReview: isLoadingUserReview,
      isLoadingStatus: isLoadingUserItem,
      onReviewTapped: {
        if AuthService.shared.isAuthenticated {
          showReviewSheet = true
        } else {
          showLoginPrompt = true
        }
      },
      onStatusChanged: { newItem in
        userItem = newItem
      },
      onLoginRequired: {
        showLoginPrompt = true
      }
    )
    .padding(.top, 16)

    if let overview = details.overview, !overview.isEmpty {
      Text(overview)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
        .lineSpacing(6)
        .padding(.horizontal, 24)
        .padding(.top, 20)
    }

    // Rating + Genres Badges
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 8) {
        // Genre Badges
        if let genres = details.genres {
          ForEach(genres) { genre in
            BadgeView(text: genre.name)
          }
        }

        // TMDB Rating Badge
        if let rating = details.voteAverage, rating > 0 {
          TMDBRatingBadge(rating: rating)
        }
      }
      .padding(.horizontal, 24)
    }
    .scrollClipDisabled()
    .padding(.top, 16)

    // Collection Section (expandable card)
    if let collection = collection {
      MovieCollectionSection(
        collection: collection,
        isExpanded: $isCollectionExpanded
      )
      .frame(height: 260, alignment: .top)
      .zIndex(1)
      .padding(.top, 24)
    }

    Rectangle()
      .fill(Color.appBorderAdaptive.opacity(0.5))
      .frame(height: 1)
      .padding(.horizontal, 24)
      .padding(.vertical, 24)

    // Review Section
    ReviewSectionView(
      mediaId: mediaId,
      mediaType: mediaType,
      refreshId: reviewsRefreshId,
      mediaTitle: details.displayTitle,
      mediaPosterPath: details.posterPath,
      mediaYear: details.year,
      onEmptyStateTapped: {
        if AuthService.shared.isAuthenticated {
          showReviewSheet = true
        } else {
          showLoginPrompt = true
        }
      },
      onContentLoaded: { hasContent in
        hasReviews = hasContent
      }
    )

    // Divider after reviews
    if hasReviews && (hasWhereToWatch || hasSeasons || hasRecommendations || hasCast) {
      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
        .padding(.horizontal, 24)
        .padding(.vertical, 24)
    }

    // Where to Watch Section
    WhereToWatchSection(
      mediaId: mediaId,
      mediaType: mediaType,
      onContentLoaded: { hasContent in
        hasWhereToWatch = hasContent
      }
    )

    // Divider after where to watch
    if hasWhereToWatch && (hasSeasons || hasRecommendations || hasCast) {
      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
        .padding(.horizontal, 24)
        .padding(.vertical, 24)
    }

    // Seasons Section (only for TV series)
    if mediaType != "movie" {
      SeasonsSection(
        seasons: details.displaySeasons,
        seriesId: mediaId,
        seriesName: details.displayTitle,
        onContentLoaded: { hasContent in
          hasSeasons = hasContent
        }
      )
    }

    // Divider after seasons
    if hasSeasons && (hasRecommendations || hasCast) {
      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
        .padding(.horizontal, 24)
        .padding(.vertical, 24)
    }

    // Recommendations Section
    RelatedSection(
      mediaId: mediaId,
      mediaType: mediaType,
      onContentLoaded: { hasContent in
        hasRecommendations = hasContent
      }
    )

    // Divider after recommendations
    if hasRecommendations && hasCast {
      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
        .padding(.horizontal, 24)
        .padding(.vertical, 24)
    }

    // Cast Section
    CastSection(
      mediaId: mediaId,
      mediaType: mediaType,
      onContentLoaded: { hasContent in
        hasCast = hasContent
      }
    )

    Spacer()
      .frame(height: 80)
  }

  @ViewBuilder
  private func loadingContentSkeleton() -> some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 10) {
        RoundedRectangle(cornerRadius: 10)
          .fill(Color.appBorderAdaptive.opacity(0.5))
          .frame(width: 90, height: 34)
        RoundedRectangle(cornerRadius: 10)
          .fill(Color.appBorderAdaptive.opacity(0.5))
          .frame(width: 120, height: 34)
      }
      .padding(.horizontal, 24)
    }
    .scrollClipDisabled()
    .padding(.top, 16)

    VStack(alignment: .leading, spacing: 8) {
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 14)
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 14)
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(width: 200, height: 14)
    }
    .padding(.horizontal, 24)
    .padding(.top, 20)

    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 8) {
        ForEach(0..<4, id: \.self) { _ in
          RoundedRectangle(cornerRadius: 8)
            .fill(Color.appBorderAdaptive.opacity(0.5))
            .frame(width: 70, height: 28)
        }
      }
      .padding(.horizontal, 24)
    }
    .scrollClipDisabled()
    .padding(.top, 16)

    Spacer()
      .frame(height: 80)
  }

  @ViewBuilder
  private func posterAndInfo(_ details: MovieDetails) -> some View {
    HStack(alignment: .bottom, spacing: 16) {
      CachedAsyncImage(
        url: details.posterURL,
        priority: .high
      ) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
          .fill(Color.appBorderAdaptive)
      }
      .frame(width: 120, height: 180)
      .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
      .posterBorder()
      .posterShadow()

      VStack(alignment: .leading, spacing: 4) {
        if let releaseDate = details.formattedReleaseDate(
          locale: Language.current.rawValue)
        {
          Text(releaseDate)
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
        }

        Text(details.displayTitle)
          .font(.headline)
          .foregroundColor(.appForegroundAdaptive)
      }
      .padding(.bottom, 8)

      Spacer()
    }
    .padding(.horizontal, 24)
    .offset(y: -70)
  }

  @ViewBuilder
  private func posterAndInfoSkeleton() -> some View {
    HStack(alignment: .bottom, spacing: 16) {
      RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(width: 120, height: 180)

      VStack(alignment: .leading, spacing: 8) {
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive.opacity(0.5))
          .frame(width: 80, height: 12)
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive.opacity(0.5))
          .frame(width: 150, height: 18)
      }
      .padding(.bottom, 8)

      Spacer()
    }
    .padding(.horizontal, 24)
    .offset(y: -70)
  }

  // MARK: - Favorite

  private var apiMediaType: String {
    mediaType == "movie" ? "MOVIE" : "TV_SHOW"
  }

  private func loadFavoriteStatus() async {
    do {
      let result = try await FavoritesService.shared.checkFavorite(
        tmdbId: mediaId, mediaType: apiMediaType
      )
      await MainActor.run { isFavorite = result }
    } catch {}
  }

  private func toggleFavorite() async {
    isTogglingFavorite = true
    defer { isTogglingFavorite = false }

    let previous = isFavorite
    withAnimation(.easeInOut(duration: 0.2)) { isFavorite = !previous }
    isFavorite ? Haptics.notification(.success) : Haptics.impact(.light)

    do {
      let result = try await FavoritesService.shared.toggleFavorite(
        tmdbId: mediaId, mediaType: apiMediaType
      )
      let added = result.action == "added"
      if added != !previous {
        withAnimation(.easeInOut(duration: 0.2)) { isFavorite = added }
      }
    } catch {
      withAnimation(.easeInOut(duration: 0.2)) { isFavorite = previous }
    }
  }

  // MARK: - Cache

  private let detailCache = MediaDetailCache.shared

  private func restoreFromCache() {
    if let cached = detailCache.get(mediaId: mediaId, mediaType: mediaType) {
      if let d = cached.details { details = d; isLoading = false }
      if !cached.images.isEmpty { backdropImages = cached.images }
      if let c = cached.collection { collection = c }
    }
  }

  private func saveToCache() {
    detailCache.set(
      mediaId: mediaId,
      mediaType: mediaType,
      details: details,
      images: backdropImages,
      collection: collection
    )
  }

  // MARK: - Data Loading

  private func loadDetails() async {
    // Skip if already loaded
    guard details == nil else {
      isLoading = false
      return
    }

    isLoading = true
    defer { isLoading = false }

    do {
      var loaded: MovieDetails?
      if mediaType == "movie" {
        loaded = try await TMDBService.shared.getMovieDetails(
          id: mediaId,
          language: Language.current.rawValue
        )
      } else {
        loaded = try await TMDBService.shared.getTVSeriesDetails(
          id: mediaId,
          language: Language.current.rawValue
        )
      }

      withAnimation(.easeOut(duration: 0.3)) {
        details = loaded
      }

      if let details = loaded {
        AnalyticsService.shared.track(.mediaViewed(
          tmdbId: mediaId,
          mediaType: mediaType,
          title: details.displayTitle
        ))
      }
    } catch {
      details = nil
    }
  }

  private func loadUserReview() async {
    isLoadingUserReview = true
    defer { isLoadingUserReview = false }

    do {
      userReview = try await ReviewService.shared.getUserReview(
        tmdbId: mediaId,
        mediaType: mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      )
    } catch {
      userReview = nil
    }
  }

  private func loadUserItem() async {
    isLoadingUserItem = true
    defer { isLoadingUserItem = false }

    do {
      userItem = try await UserItemService.shared.getUserItem(
        tmdbId: mediaId,
        mediaType: mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      )
    } catch {
      userItem = nil
    }
  }

  private func loadImages() async {
    // Skip if already loaded
    guard backdropImages.isEmpty else { return }

    do {
      let images = try await TMDBService.shared.getImages(id: mediaId, mediaType: mediaType)
      // Reset index before setting images to avoid flash
      currentBackdropIndex = 0
      
      // Ensure the main backdrop (from details) is always first in the carousel
      var sorted = images.sortedBackdrops
      if let mainPath = details?.backdropPath,
         let mainIndex = sorted.firstIndex(where: { $0.filePath == mainPath }),
         mainIndex != 0 {
        let mainImage = sorted.remove(at: mainIndex)
        sorted.insert(mainImage, at: 0)
      }
      
      // Pre-warm the cache for the first carousel image so BackdropImage
      // can resolve it synchronously in its init, preventing any flash.
      if let firstURL = sorted.first?.backdropURL,
         ImageCache.shared.image(for: firstURL) == nil {
        _ = await ImageCache.shared.loadImage(from: firstURL, priority: .high)
      }
      
      withAnimation(.easeOut(duration: 0.3)) {
        backdropImages = sorted
      }
    } catch {
      backdropImages = []
    }
  }

  private func loadCollection() async {
    // Only load collection for movies
    guard mediaType == "movie" else { return }
    guard let details = details, let belongsTo = details.belongsToCollection else { return }

    do {
      collection = try await TMDBService.shared.getCollectionDetails(
        id: belongsTo.id,
        language: Language.current.rawValue
      )
    } catch {
      collection = nil
    }
  }

}

// MARK: - TMDB Rating Badge
struct TMDBRatingBadge: View {
  let rating: Double

  private var formattedRating: String {
    if rating == rating.rounded() {
      return String(format: "%.0f", rating)
    }
    return String(format: "%.1f", rating)
  }

  var body: some View {
    HStack(spacing: 4) {
      Image("tmdb-logo")
        .resizable()
        .aspectRatio(contentMode: .fit)
        .frame(height: 10)

      Text(formattedRating)
        .font(.caption)
        .foregroundColor(.appForegroundAdaptive)
    }
    .padding(.horizontal, 10)
    .padding(.vertical, 6)
    .background(Color.appInputFilled)
    .clipShape(RoundedRectangle(cornerRadius: 8))
  }
}

// MARK: - Badge View
struct BadgeView: View {
  let text: String

  var body: some View {
    Text(text)
      .font(.caption)
      .foregroundColor(.appForegroundAdaptive)
      .padding(.horizontal, 10)
      .padding(.vertical, 6)
      .background(Color.appInputFilled)
      .clipShape(RoundedRectangle(cornerRadius: 8))
  }
}

// MARK: - Rounded Corner Shape
struct RoundedCorner: Shape {
  var radius: CGFloat = .infinity
  var corners: UIRectCorner = .allCorners

  func path(in rect: CGRect) -> Path {
    let path = UIBezierPath(
      roundedRect: rect,
      byRoundingCorners: corners,
      cornerRadii: CGSize(width: radius, height: radius)
    )
    return Path(path.cgPath)
  }
}

// MARK: - Media Detail Skeleton View
struct MediaDetailSkeletonView: View {
  let cornerRadius: CGFloat
  
  var body: some View {
    GeometryReader { geometry in
      let backdropHeight = geometry.size.height * 0.45
      
      ZStack(alignment: .topLeading) {
        ScrollView(showsIndicators: false) {
          VStack(alignment: .leading, spacing: 0) {
            // Backdrop Skeleton
            Rectangle()
              .fill(Color.appBorderAdaptive.opacity(0.5))
              .frame(height: backdropHeight + cornerRadius)
            
            // Content Card Skeleton
            ZStack(alignment: .topLeading) {
              VStack(alignment: .leading, spacing: 0) {
                // Spacer for poster overlap area
                Spacer()
                  .frame(height: 110)
                
                // Action Buttons Skeleton
                ScrollView(.horizontal, showsIndicators: false) {
                  HStack(spacing: 10) {
                    RoundedRectangle(cornerRadius: 10)
                      .fill(Color.appBorderAdaptive.opacity(0.5))
                      .frame(width: 90, height: 34)
                    
                    RoundedRectangle(cornerRadius: 10)
                      .fill(Color.appBorderAdaptive.opacity(0.5))
                      .frame(width: 120, height: 34)
                  }
                  .padding(.horizontal, 24)
                }
                .scrollClipDisabled()
                .padding(.top, 16)
                
                // Overview Skeleton
                VStack(alignment: .leading, spacing: 8) {
                  RoundedRectangle(cornerRadius: 4)
                    .fill(Color.appBorderAdaptive.opacity(0.5))
                    .frame(height: 14)
                  
                  RoundedRectangle(cornerRadius: 4)
                    .fill(Color.appBorderAdaptive.opacity(0.5))
                    .frame(height: 14)
                  
                  RoundedRectangle(cornerRadius: 4)
                    .fill(Color.appBorderAdaptive.opacity(0.5))
                    .frame(width: 200, height: 14)
                }
                .padding(.horizontal, 24)
                .padding(.top, 20)
                
                // Genres Skeleton
                ScrollView(.horizontal, showsIndicators: false) {
                  HStack(spacing: 8) {
                    ForEach(0..<4, id: \.self) { _ in
                      RoundedRectangle(cornerRadius: 8)
                        .fill(Color.appBorderAdaptive.opacity(0.5))
                        .frame(width: 70, height: 28)
                    }
                  }
                  .padding(.horizontal, 24)
                }
                .scrollClipDisabled()
                .padding(.top, 16)
                
                Spacer()
                  .frame(height: 80)
              }
              .background(Color.appBackgroundAdaptive)
              .clipShape(
                RoundedCorner(radius: cornerRadius, corners: [.topLeft, .topRight])
              )
              
              // Poster and Info Skeleton
              HStack(alignment: .bottom, spacing: 16) {
                // Poster Skeleton
                RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
                  .fill(Color.appBorderAdaptive.opacity(0.5))
                  .frame(width: 120, height: 180)
                
                // Info Skeleton
                VStack(alignment: .leading, spacing: 8) {
                  RoundedRectangle(cornerRadius: 4)
                    .fill(Color.appBorderAdaptive.opacity(0.5))
                    .frame(width: 80, height: 12)
                  
                  RoundedRectangle(cornerRadius: 4)
                    .fill(Color.appBorderAdaptive.opacity(0.5))
                    .frame(width: 150, height: 18)
                }
                .padding(.bottom, 8)
                
                Spacer()
              }
              .padding(.horizontal, 24)
              .offset(y: -70)
            }
            .offset(y: -cornerRadius)
          }
        }
        .ignoresSafeArea(edges: .top)
        
        // Back Button Skeleton
        VStack {
          Circle()
            .fill(Color.appBorderAdaptive.opacity(0.3))
            .frame(width: 40, height: 40)
            .padding(.leading, 24)
          Spacer()
        }
        .padding(.top, 8)
        .safeAreaPadding(.top)
      }
    }
  }
}
