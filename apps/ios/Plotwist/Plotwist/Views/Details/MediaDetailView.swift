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
  @State private var showReviewSheet = false
  @State private var reviewsRefreshId = UUID()
  @State private var backdropImages: [TMDBImage] = []
  @State private var currentBackdropIndex = 0
  @ObservedObject private var themeManager = ThemeManager.shared

  // Layout constants
  private let posterOverlapOffset: CGFloat = -70
  private let contentOffset: CGFloat = -54

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      if isLoading {
        ProgressView()
      } else if let details {
        GeometryReader { geometry in
          let backdropHeight = geometry.size.height * 0.40

          ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
              // Backdrop Carousel
              ZStack(alignment: .topLeading) {
                if backdropImages.isEmpty {
                  // Fallback to single backdrop
                  AsyncImage(url: details.backdropURL) { phase in
                    switch phase {
                    case .success(let image):
                      image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                    default:
                      Rectangle()
                        .fill(Color.appBorderAdaptive)
                    }
                  }
                  .frame(height: backdropHeight)
                  .frame(maxWidth: .infinity)
                  .clipped()
                } else {
                  // Carousel
                  ZStack(alignment: .bottomTrailing) {
                    NavigationLink(
                      destination: MediaImagesView(mediaId: mediaId, mediaType: mediaType)
                    ) {
                      TabView(selection: $currentBackdropIndex) {
                        ForEach(Array(backdropImages.prefix(10).enumerated()), id: \.element.id) {
                          index, backdrop in
                          AsyncImage(url: backdrop.backdropURL) { phase in
                            switch phase {
                            case .success(let image):
                              image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                            default:
                              Rectangle()
                                .fill(Color.appBorderAdaptive)
                            }
                          }
                          .tag(index)
                        }
                      }
                      .tabViewStyle(.page(indexDisplayMode: .never))
                      .frame(height: backdropHeight)
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
                      .padding(.bottom, 12)
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
              .overlay(
                Rectangle()
                  .fill(Color.appBorderAdaptive.opacity(0.5))
                  .frame(height: 1),
                alignment: .bottom
              )

              // Content with poster overlap
              HStack(alignment: .bottom, spacing: 16) {
                // Poster
                AsyncImage(url: details.posterURL) { phase in
                  switch phase {
                  case .success(let image):
                    image
                      .resizable()
                      .aspectRatio(contentMode: .fill)
                  default:
                    RoundedRectangle(cornerRadius: 16)
                      .fill(Color.appBorderAdaptive)
                  }
                }
                .frame(width: 140, height: 210)
                .clipShape(RoundedRectangle(cornerRadius: 16))
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

                Spacer()
              }
              .padding(.horizontal, 24)
              .offset(y: posterOverlapOffset)

              // Content Section
              VStack(alignment: .leading, spacing: 20) {
                // Review Button
                if AuthService.shared.isAuthenticated {
                  HStack {
                    ReviewButton(hasReview: userReview != nil) {
                      showReviewSheet = true
                    }

                    Spacer()
                  }
                }

                // Overview
                if let overview = details.overview, !overview.isEmpty {
                  Text(overview)
                    .font(.subheadline)
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .lineSpacing(4)
                }

                // Genres Badges
                if let genres = details.genres, !genres.isEmpty {
                  ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                      ForEach(genres) { genre in
                        BadgeView(text: genre.name)
                      }
                    }
                  }
                }
              }
              .padding(.horizontal, 24)
              .offset(y: contentOffset)

              Spacer()
                .frame(height: 32)
                .offset(y: contentOffset)

              // Divider
              Rectangle()
                .fill(Color.appBorderAdaptive.opacity(0.5))
                .frame(height: 1)
                .padding(.horizontal, 24)
                .offset(y: contentOffset)

              Spacer()
                .frame(height: 16)
                .offset(y: contentOffset)

              // Rating Section (Airbnb style)
              RatingSectionView(
                mediaId: mediaId,
                mediaType: mediaType,
                refreshId: reviewsRefreshId,
                onEmptyStateTapped: {
                  if AuthService.shared.isAuthenticated {
                    showReviewSheet = true
                  }
                }
              )
              .offset(y: contentOffset)
            }
            .padding(.bottom, 80)
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
      await loadDetails()
      await loadImages()
      if AuthService.shared.isAuthenticated {
        await loadUserReview()
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
    do {
      userReview = try await ReviewService.shared.getUserReview(
        tmdbId: mediaId,
        mediaType: mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      )
    } catch {
      userReview = nil
    }
  }

  private func loadImages() async {
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

// MARK: - Rating Section (Airbnb style)
struct RatingSectionView: View {
  let mediaId: Int
  let mediaType: String
  let refreshId: UUID
  var onEmptyStateTapped: (() -> Void)?

  @State private var reviews: [ReviewListItem] = []
  @State private var isLoading = true
  @State private var error: String?

  private var averageRating: Double {
    guard !reviews.isEmpty else { return 0 }
    let total = reviews.reduce(0) { $0 + $1.rating }
    return total / Double(reviews.count)
  }

  private var reviewsWithText: [ReviewListItem] {
    reviews.filter { !$0.review.isEmpty }
  }

  // Show featured rating (with film strips) only for highly rated content with many reviews
  private var isFeaturedRating: Bool {
    reviews.count >= 10 && averageRating >= 4.5
  }

  var body: some View {
    VStack(spacing: 0) {
      // Rating Header
      VStack(spacing: 16) {
        if isLoading {
          // Loading skeleton
          VStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 8)
              .fill(Color.appInputFilled)
              .frame(width: 80, height: 48)
            RoundedRectangle(cornerRadius: 4)
              .fill(Color.appInputFilled)
              .frame(width: 100, height: 16)
          }
          .shimmer()
        } else if reviews.isEmpty {
          // Empty state - tappable to open review sheet
          Button(action: {
            onEmptyStateTapped?()
          }) {
            VStack(spacing: 8) {
              Text(L10n.current.beFirstToReview)
                .font(.subheadline)
                .foregroundColor(.appForegroundAdaptive)
              Text(L10n.current.shareYourOpinion)
                .font(.caption)
                .foregroundColor(.appMutedForegroundAdaptive)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 32)
            .overlay(
              RoundedRectangle(cornerRadius: 12)
                .stroke(style: StrokeStyle(lineWidth: 1, dash: [5]))
                .foregroundColor(.appBorderAdaptive)
            )
          }
          .buttonStyle(.plain)
          .padding(.horizontal, 24)
        } else if isFeaturedRating {
          // Featured rating display with film strips (10+ reviews AND rating >= 4.5)
          HStack(spacing: 8) {
            // Left film strip
            Image("FilmStrip")
              .resizable()
              .aspectRatio(contentMode: .fit)
              .frame(height: 140)
              .shadow(color: Color.black.opacity(0.1), radius: 3, x: 0, y: 3)
              .shadow(color: Color.black.opacity(0.06), radius: 6, x: 0, y: 6)

            // Rating content
            VStack(spacing: 4) {
              // Large rating number
              Text(String(format: "%.1f", averageRating))
                .font(.system(size: 56, weight: .semibold, design: .rounded))
                .foregroundColor(.appForegroundAdaptive)

              // Stars
              HStack(spacing: 4) {
                ForEach(1...5, id: \.self) { index in
                  Image(systemName: starIcon(for: index))
                    .font(.system(size: 14))
                    .foregroundColor(starColor(for: index))
                }
              }

              // Reviews count
              Text(
                "\(reviews.count) \(reviews.count == 1 ? L10n.current.review.lowercased() : L10n.current.tabReviews.lowercased())"
              )
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
              .padding(.top, 4)
            }

            // Right film strip (mirrored)
            Image("FilmStrip")
              .resizable()
              .aspectRatio(contentMode: .fit)
              .frame(height: 140)
              .scaleEffect(x: -1, y: 1)
              .shadow(color: Color.black.opacity(0.1), radius: 3, x: 0, y: 3)
              .shadow(color: Color.black.opacity(0.06), radius: 6, x: 0, y: 6)
          }
          .frame(maxWidth: .infinity)
          .padding(.vertical, 24)
        } else {
          // Simple rating display (star + rating + dot + reviews count)
          HStack(spacing: 6) {
            Image(systemName: "star.fill")
              .font(.system(size: 16))
              .foregroundColor(.appForegroundAdaptive)

            Text(String(format: "%.1f", averageRating))
              .font(.system(size: 18, weight: .semibold, design: .rounded))
              .foregroundColor(.appForegroundAdaptive)

            Circle()
              .fill(Color.appMutedForegroundAdaptive.opacity(0.5))
              .frame(width: 4, height: 4)

            Text(
              "\(reviews.count) \(reviews.count == 1 ? L10n.current.review.lowercased() : L10n.current.tabReviews.lowercased())"
            )
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
          }
          .frame(maxWidth: .infinity, alignment: .leading)
          .padding(.horizontal, 24)
          .padding(.vertical, 16)
        }
      }

      // Horizontal scrolling reviews
      if !isLoading && !reviewsWithText.isEmpty {
        ScrollView(.horizontal, showsIndicators: false) {
          HStack(alignment: .top, spacing: 0) {
            ForEach(Array(reviewsWithText.enumerated()), id: \.element.id) { index, review in
              HStack(alignment: .top, spacing: 0) {
                // Gap before first item
                if index == 0 {
                  Spacer()
                    .frame(width: 24)
                }

                ReviewCardView(review: review)
                  .frame(width: UIScreen.main.bounds.width * 0.75)

                // Vertical divider (except for last item)
                if index < reviewsWithText.count - 1 {
                  Rectangle()
                    .fill(Color.appBorderAdaptive.opacity(0.5))
                    .frame(width: 1)
                    .frame(height: 160)
                    .padding(.horizontal, 24)
                }
              }
            }
          }
        }

        // See all button (only show if 10+ reviews)
        if reviews.count >= 10 {
          Button(action: {
            // TODO: Navigate to all reviews
          }) {
            Text(L10n.current.seeAll)
              .font(.subheadline.weight(.medium))
              .foregroundColor(.appMutedForegroundAdaptive)
              .frame(maxWidth: .infinity)
              .padding(.vertical, 14)
              .background(Color.appInputFilled)
              .cornerRadius(12)
          }
          .disabled(true)
          .opacity(0.5)
          .padding(.horizontal, 24)
        }
      }
    }
    .task {
      await loadReviews()
    }
    .onChange(of: refreshId) { _, _ in
      Task {
        await loadReviews()
      }
    }
  }

  private func loadReviews() async {
    isLoading = true
    error = nil

    do {
      let apiMediaType = mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      reviews = try await ReviewService.shared.getReviews(
        tmdbId: mediaId,
        mediaType: apiMediaType
      )
      isLoading = false
    } catch {
      self.error = error.localizedDescription
      isLoading = false
    }
  }

  private func starIcon(for index: Int) -> String {
    if Double(index) <= averageRating {
      return "star.fill"
    } else if Double(index) - 0.5 <= averageRating {
      return "star.leadinghalf.filled"
    } else {
      return "star"
    }
  }

  private func starColor(for index: Int) -> Color {
    if Double(index) <= averageRating || Double(index) - 0.5 <= averageRating {
      return .appForegroundAdaptive
    } else {
      return .gray.opacity(0.3)
    }
  }
}

// MARK: - Review Card (for horizontal scroll)
struct ReviewCardView: View {
  let review: ReviewListItem

  // Fixed height for review card content
  private let cardHeight: CGFloat = 180
  private let maxTextLines: Int = 3

  private var usernameInitial: String {
    review.user.username.first?.uppercased() ?? "?"
  }

  private var timeAgo: String {
    let formatter = RelativeDateTimeFormatter()
    formatter.unitsStyle = .abbreviated

    let dateFormatter = ISO8601DateFormatter()
    dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

    if let date = dateFormatter.date(from: review.createdAt) {
      return formatter.localizedString(for: date, relativeTo: Date())
    }
    return ""
  }

  private var userRank: String {
    // Fictional rank based on review count or rating
    let ranks = ["Cinéfilo", "Crítico", "Entusiasta", "Maratonista", "Expert"]
    let index = abs(review.user.id.hashValue) % ranks.count
    return ranks[index]
  }

  // Check if text is likely truncated (rough estimate)
  private var isTextLong: Bool {
    review.review.count > 150
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      // Header: Avatar + Username + Badge
      HStack(spacing: 10) {
        // Avatar
        if let avatarUrl = review.user.avatarUrl,
          let url = URL(string: avatarUrl)
        {
          AsyncImage(url: url) { phase in
            switch phase {
            case .success(let image):
              image
                .resizable()
                .aspectRatio(contentMode: .fill)
            default:
              avatarFallback
            }
          }
          .frame(width: 40, height: 40)
          .clipShape(Circle())
        } else {
          avatarFallback
        }

        VStack(alignment: .leading, spacing: 2) {
          Text(review.user.username)
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)

          // Rank badge
          Text(userRank)
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
        }

        Spacer()
      }

      // Stars + Time
      HStack(spacing: 6) {
        // Stars
        HStack(spacing: 2) {
          ForEach(1...5, id: \.self) { index in
            Image(systemName: ratingIcon(for: index))
              .font(.system(size: 10))
              .foregroundColor(ratingColor(for: index))
          }
        }

        Circle()
          .fill(Color.appMutedForegroundAdaptive.opacity(0.5))
          .frame(width: 3, height: 3)

        Text(timeAgo)
          .font(.caption2)
          .foregroundColor(.appMutedForegroundAdaptive)

        Spacer()
      }

      // Review text
      if !review.review.isEmpty {
        Text(review.review)
          .font(.callout)
          .foregroundColor(.appForegroundAdaptive)
          .lineSpacing(4)
          .lineLimit(maxTextLines)
          .frame(maxWidth: .infinity, alignment: .leading)
          .blur(radius: review.hasSpoilers ? 6 : 0)
          .overlay(
            review.hasSpoilers
              ? Text(L10n.current.containSpoilers)
                .font(.caption.weight(.medium))
                .foregroundColor(.appMutedForegroundAdaptive)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.appInputFilled)
                .cornerRadius(6)
              : nil
          )
      }

      // Show more button (if text is long)
      if isTextLong && !review.hasSpoilers {
        Button(action: {
          // TODO: Expand review
        }) {
          Text(L10n.current.showMore)
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appMutedForegroundAdaptive)
            .underline()
        }
        .disabled(true)
      }

      Spacer(minLength: 0)
    }
    .frame(height: cardHeight)
    .frame(maxWidth: .infinity, alignment: .leading)
  }

  private var avatarFallback: some View {
    Circle()
      .fill(Color.appInputFilled)
      .frame(width: 40, height: 40)
      .overlay(
        Text(usernameInitial)
          .font(.subheadline.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
      )
  }

  private func ratingIcon(for index: Int) -> String {
    let rating = review.rating
    if Double(index) <= rating {
      return "star.fill"
    } else if Double(index) - 0.5 <= rating {
      return "star.leadinghalf.filled"
    } else {
      return "star"
    }
  }

  private func ratingColor(for index: Int) -> Color {
    let rating = review.rating
    if Double(index) <= rating || Double(index) - 0.5 <= rating {
      return .yellow
    } else {
      return .gray.opacity(0.3)
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
