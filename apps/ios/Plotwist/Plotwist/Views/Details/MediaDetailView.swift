//
//  MediaDetailView.swift
//  Plotwist
//

import SwiftUI

struct MediaDetailView: View {
  let mediaId: Int
  let mediaType: String

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
  @State private var hasRecommendations = false

  // Layout constants
  private let cornerRadius: CGFloat = 24
  private let posterOverlapOffset: CGFloat = -70

  var body: some View {
    ZStack {
      // Background color
      Color.appBackgroundAdaptive.ignoresSafeArea()

      if isLoading {
        ProgressView()
      } else if let details {
        GeometryReader { geometry in
          let backdropHeight = geometry.size.height * 0.45

          ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
              // Backdrop Section (stays behind content)
              ZStack(alignment: .topLeading) {
                // Backdrop Image/Carousel
                if backdropImages.isEmpty {
                  CachedAsyncImage(url: details.backdropURL) { image in
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
                  ZStack(alignment: .bottomTrailing) {
                    NavigationLink(
                      destination: MediaImagesView(mediaId: mediaId, mediaType: mediaType)
                    ) {
                      TabView(selection: $currentBackdropIndex) {
                        ForEach(Array(backdropImages.prefix(10).enumerated()), id: \.element.id) {
                          index, backdrop in
                          CachedAsyncImage(url: backdrop.backdropURL) { image in
                            image
                              .resizable()
                              .aspectRatio(contentMode: .fill)
                          } placeholder: {
                            Rectangle()
                              .fill(Color.appBorderAdaptive)
                          }
                          .tag(index)
                        }
                      }
                      .tabViewStyle(.page(indexDisplayMode: .never))
                      .frame(height: backdropHeight + cornerRadius)
                      .frame(maxWidth: .infinity)
                      .clipped()
                    }
                    .buttonStyle(.plain)

                    // Image counter
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

                // Back button
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
                .padding(.top, 60)
                .padding(.leading, 24)
              }

              // Content Card (rounded, overlaps backdrop)
              ZStack(alignment: .topLeading) {
                // Background card with rounded corners
                VStack(alignment: .leading, spacing: 0) {
                  // Spacer for poster overlap area
                  Spacer()
                    .frame(height: 110)

                  // Content Section
                  VStack(alignment: .leading, spacing: 20) {
                    // Action Buttons (Review + Status)
                    if AuthService.shared.isAuthenticated {
                      MediaDetailViewActions(
                        mediaId: mediaId,
                        mediaType: mediaType,
                        userReview: userReview,
                        userItem: userItem,
                        isLoadingReview: isLoadingUserReview,
                        isLoadingStatus: isLoadingUserItem,
                        onReviewTapped: {
                          showReviewSheet = true
                        },
                        onStatusChanged: { newItem in
                          userItem = newItem
                        }
                      )
                    }

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

                  // Genres Badges (outside padding for full-width scroll)
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

                  // Divider before first content section
                  if hasReviews || hasWhereToWatch || hasRecommendations {
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
                      }
                    },
                    onContentLoaded: { hasContent in
                      hasReviews = hasContent
                    }
                  )

                  // Divider after reviews
                  if hasReviews && (hasWhereToWatch || hasRecommendations) {
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
                  if hasWhereToWatch && hasRecommendations {
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
                .background(Color.appBackgroundAdaptive)
                .clipShape(
                  RoundedCorner(radius: cornerRadius, corners: [.topLeft, .topRight])
                )

                // Poster and Info (overlaid on top, outside clipShape)
                HStack(alignment: .bottom, spacing: 16) {
                  // Poster
                  CachedAsyncImage(url: details.posterURL) { image in
                    image
                      .resizable()
                      .aspectRatio(contentMode: .fill)
                  } placeholder: {
                    RoundedRectangle(cornerRadius: 12)
                      .fill(Color.appBorderAdaptive)
                  }
                  .frame(width: 120, height: 180)
                  .clipShape(RoundedRectangle(cornerRadius: 12))
                  .posterBorder(cornerRadius: 12)
                  .posterShadow()

                  // Info
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
              .offset(y: -cornerRadius)
            }
          }
          .ignoresSafeArea(edges: .top)
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .sheet(isPresented: $showReviewSheet) {
      ReviewSheet(mediaId: mediaId, mediaType: mediaType, existingReview: userReview)
    }
    .task {
      // Start loading user data states immediately if authenticated
      if AuthService.shared.isAuthenticated {
        isLoadingUserReview = true
        isLoadingUserItem = true
      }
      
      await loadDetails()
      await loadImages()
      if AuthService.shared.isAuthenticated {
        await loadUserReview()
        await loadUserItem()
      }
    }
    .onChange(of: showReviewSheet) { _, isPresented in
      if !isPresented && AuthService.shared.isAuthenticated {
        Task {
          await loadUserReview()
        }
        // Refresh the reviews list
        reviewsRefreshId = UUID()
      }
    }
  }

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
      backdropImages = images.sortedBackdrops

      // Preload backdrop images in background
      await preloadBackdropImages()
    } catch {
      backdropImages = []
    }
  }

  private func preloadBackdropImages() async {
    let imagesToPreload = Array(backdropImages.prefix(10))

    await withTaskGroup(of: Void.self) { group in
      for image in imagesToPreload {
        guard let url = image.backdropURL else { continue }
        group.addTask {
          do {
            let (_, _) = try await URLSession.shared.data(from: url)
          } catch {
            // Silently ignore preload failures
          }
        }
      }
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
