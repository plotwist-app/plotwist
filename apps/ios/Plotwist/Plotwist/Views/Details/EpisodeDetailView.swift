//
//  EpisodeDetailView.swift
//  Plotwist

import SwiftUI

struct EpisodeDetailView: View {
  let seriesId: Int
  let seasonName: String
  let seasonPosterPath: String?
  let episode: Episode

  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var userReview: Review?
  @State private var isLoadingUserReview = false
  @State private var showReviewSheet = false
  @State private var reviewsRefreshId = UUID()
  @State private var hasReviews = false
  @State private var scrollOffset: CGFloat = 0
  @State private var initialScrollOffset: CGFloat? = nil

  private let scrollThreshold: CGFloat = 20

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

          // Review Button
          if AuthService.shared.isAuthenticated {
            ReviewButton(
              hasReview: userReview != nil,
              isLoading: isLoadingUserReview,
              action: { showReviewSheet = true }
            )
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
            .frame(height: 80)
        }
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
        await loadUserReview()
      }
    }
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

        Text(seasonName)
          .font(.headline)
          .foregroundColor(.appForegroundAdaptive)
          .lineLimit(1)

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
        RoundedRectangle(cornerRadius: 12)
          .fill(Color.appBorderAdaptive)
          .overlay(
            ProgressView()
              .scaleEffect(0.8)
          )
      }
      .frame(width: 120, height: 180)
      .clipShape(RoundedRectangle(cornerRadius: 12))
      .posterBorder(cornerRadius: 12)
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
