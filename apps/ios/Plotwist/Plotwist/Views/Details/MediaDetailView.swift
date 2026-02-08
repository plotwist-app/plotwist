//
//  MediaDetailView.swift
//  Plotwist
//

import SwiftUI

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

  // Section visibility state
  @State private var hasReviews = false
  @State private var hasWhereToWatch = false
  @State private var hasSeasons = false
  @State private var hasRecommendations = false

  // Collection state
  @State private var collection: MovieCollection?
  @State private var showCollectionSheet = false
  @State private var selectedCollectionMovieId: Int?
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
                    // Use CachedAsyncImage (no fade) when we have a pre-cached URL from the card,
                    // so the image appears instantly during the zoom transition.
                    // Once details load, the URL stays the same so no reload occurs.
                    CachedAsyncImage(url: url, priority: .high, animated: false) { image in
                      image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                    } placeholder: {
                      Rectangle()
                        .fill(Color.appBorderAdaptive)
                    }
                    .frame(height: backdropHeight + cornerRadius)
                    .frame(maxWidth: .infinity)
                    .clipped()
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
                  VStack(alignment: .leading, spacing: 0) {
                    Spacer()
                      .frame(height: 110)

                    if let details {
                      // Loaded content
                      detailsContent(details)
                    } else {
                      // Skeleton content while loading
                      loadingContentSkeleton()
                    }
                  }
                  .background(Color.appBackgroundAdaptive)
                  .clipShape(
                    RoundedCorner(radius: cornerRadius, corners: [.topLeft, .topRight])
                  )

                  // Poster and Info
                  if let details {
                    posterAndInfo(details)
                  } else {
                    posterAndInfoSkeleton()
                  }
                }
                .offset(y: -cornerRadius)
              }
            }
            .ignoresSafeArea(edges: .top)

            // Sticky Back Button
            VStack {
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
              .padding(.leading, 24)
              Spacer()
            }
            .padding(.top, 8)
            .safeAreaPadding(.top)
          }
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .sheet(isPresented: $showReviewSheet) {
      ReviewSheet(
        mediaId: mediaId,
        mediaType: mediaType,
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
    .sheet(isPresented: $showCollectionSheet) {
      if let collection = collection {
        MovieCollectionSheet(collection: collection) { movieId in
          selectedCollectionMovieId = movieId
        }
      }
    }
    .background(
      NavigationLink(
        destination: Group {
          if let movieId = selectedCollectionMovieId {
            MediaDetailView(mediaId: movieId, mediaType: "movie")
          }
        },
        isActive: Binding(
          get: { selectedCollectionMovieId != nil },
          set: { if !$0 { selectedCollectionMovieId = nil } }
        )
      ) {
        EmptyView()
      }
      .hidden()
    )
    .loginPrompt(isPresented: $showLoginPrompt) {
      // User logged in - reload user-specific data
      Task {
        isLoadingUserReview = true
        isLoadingUserItem = true
        await loadUserReview()
        await loadUserItem()
      }
    }
    .task {
      // Start loading user data states immediately if authenticated
      if AuthService.shared.isAuthenticated {
        isLoadingUserReview = true
        isLoadingUserItem = true
      }

      await loadDetails()
      await loadImages()
      await loadCollection()
      if AuthService.shared.isAuthenticated {
        await loadUserReview()
        await loadUserItem()
      }
    }
  }

  // MARK: - Content Subviews

  @ViewBuilder
  private func detailsContent(_ details: MovieDetails) -> some View {
    VStack(alignment: .leading, spacing: 20) {
      // Action Buttons (Review + Status)
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

      // Overview
      if let overview = details.overview, !overview.isEmpty {
        Text(overview)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
          .lineSpacing(6)
      }
    }
    .padding(.horizontal, 24)
    .padding(.top, 16)

    // Genres Badges
    if let genres = details.genres, !genres.isEmpty {
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 8) {
          ForEach(genres) { genre in
            BadgeView(text: genre.name)
          }
        }
        .padding(.horizontal, 24)
      }
      .scrollClipDisabled()
      .padding(.top, 16)
    }

    // Collection Section
    if let collection = collection {
      MovieCollectionSection(
        collection: collection,
        onSeeCollectionTapped: {
          showCollectionSheet = true
        }
      )
      .padding(.top, 24)
    }

    // Divider before first content section
    if hasReviews || hasWhereToWatch || hasSeasons || hasRecommendations {
      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
        .padding(.horizontal, 24)
        .padding(.vertical, 24)
    }

    // Review Section
    ReviewSectionView(
      mediaId: mediaId,
      mediaType: mediaType,
      refreshId: reviewsRefreshId,
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
    if hasReviews && (hasWhereToWatch || hasSeasons || hasRecommendations) {
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
    if hasWhereToWatch && (hasSeasons || hasRecommendations) {
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
    if hasSeasons && hasRecommendations {
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

    Spacer()
      .frame(height: 80)
  }

  @ViewBuilder
  private func loadingContentSkeleton() -> some View {
    VStack(alignment: .leading, spacing: 20) {
      HStack(spacing: 12) {
        RoundedRectangle(cornerRadius: 12)
          .fill(Color.appBorderAdaptive.opacity(0.5))
          .frame(height: 48)
        RoundedRectangle(cornerRadius: 12)
          .fill(Color.appBorderAdaptive.opacity(0.5))
          .frame(height: 48)
      }
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
    }
    .padding(.horizontal, 24)
    .padding(.top, 16)

    // Genres skeleton
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
      if mediaType == "movie" {
        details = try await TMDBService.shared.getMovieDetails(
          id: mediaId,
          language: Language.current.rawValue
        )
      } else {
        details = try await TMDBService.shared.getTVSeriesDetails(
          id: mediaId,
          language: Language.current.rawValue
        )
      }
      
      // Track media view
      if let details = details {
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
      
      backdropImages = sorted
      // Note: Prefetching is now handled automatically by CarouselBackdropView
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
                
                // Content Section Skeleton
                VStack(alignment: .leading, spacing: 20) {
                  // Action Buttons Skeleton
                  HStack(spacing: 12) {
                    RoundedRectangle(cornerRadius: 12)
                      .fill(Color.appBorderAdaptive.opacity(0.5))
                      .frame(height: 48)
                    
                    RoundedRectangle(cornerRadius: 12)
                      .fill(Color.appBorderAdaptive.opacity(0.5))
                      .frame(height: 48)
                  }
                  
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
                }
                .padding(.horizontal, 24)
                .padding(.top, 16)
                
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
