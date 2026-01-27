//
//  SeasonDetailView.swift
//  Plotwist
//

import SwiftUI

struct SeasonDetailView: View {
  let seriesId: Int
  let seriesName: String
  let season: Season

  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var seasonDetails: SeasonDetails?
  @State private var isLoading = true
  @State private var userReview: Review?
  @State private var isLoadingUserReview = false
  @State private var showReviewSheet = false
  @State private var reviewsRefreshId = UUID()
  @State private var hasReviews = false

  private var formattedAirDate: String? {
    guard let airDate = season.airDate else { return nil }
    let inputFormatter = DateFormatter()
    inputFormatter.dateFormat = "yyyy-MM-dd"
    guard let date = inputFormatter.date(from: airDate) else { return nil }
    
    let outputFormatter = DateFormatter()
    outputFormatter.dateFormat = "d 'de' MMMM 'de' yyyy"
    outputFormatter.locale = Locale(identifier: Language.current.rawValue)
    return outputFormatter.string(from: date)
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      ScrollView(showsIndicators: false) {
        VStack(alignment: .leading, spacing: 0) {
          // Header with poster and info
          HStack(alignment: .bottom, spacing: 16) {
            // Poster
            CachedAsyncImage(url: season.posterURL) { image in
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

              Text(season.name)
                .font(.title2.bold())
                .foregroundColor(.appForegroundAdaptive)
            }
            .padding(.bottom, 8)

            Spacer()
          }
          .padding(.horizontal, 24)
          .padding(.top, 80)

          // Review Button
          if AuthService.shared.isAuthenticated {
            ReviewButton(
              hasReview: userReview != nil,
              isLoading: isLoadingUserReview,
              action: {
                showReviewSheet = true
              }
            )
            .padding(.horizontal, 24)
            .padding(.top, 24)
          }

          // Overview
          if let overview = seasonDetails?.overview ?? season.overview, !overview.isEmpty {
            Text(overview)
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
              .lineSpacing(6)
              .padding(.horizontal, 24)
              .padding(.top, 20)
          }

          // Divider
          if hasReviews {
            Rectangle()
              .fill(Color.appBorderAdaptive.opacity(0.5))
              .frame(height: 1)
              .padding(.horizontal, 24)
              .padding(.vertical, 24)
          }

          // Reviews Section
          SeasonReviewSectionView(
            seriesId: seriesId,
            seasonNumber: season.seasonNumber,
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

      // Header overlay
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

          Text(seriesName)
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

        Spacer()
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .sheet(isPresented: $showReviewSheet) {
      ReviewSheet(
        mediaId: seriesId,
        mediaType: "tv",
        seasonNumber: season.seasonNumber,
        existingReview: userReview
      )
    }
    .task {
      if AuthService.shared.isAuthenticated {
        isLoadingUserReview = true
      }
      await loadSeasonDetails()
      if AuthService.shared.isAuthenticated {
        await loadUserReview()
      }
    }
    .onChange(of: showReviewSheet) { _, isPresented in
      if !isPresented && AuthService.shared.isAuthenticated {
        Task {
          await loadUserReview()
        }
        reviewsRefreshId = UUID()
      }
    }
  }

  private func loadSeasonDetails() async {
    isLoading = true
    defer { isLoading = false }

    do {
      seasonDetails = try await TMDBService.shared.getSeasonDetails(
        seriesId: seriesId,
        seasonNumber: season.seasonNumber,
        language: Language.current.rawValue
      )
    } catch {
      seasonDetails = nil
    }
  }

  private func loadUserReview() async {
    isLoadingUserReview = true
    defer { isLoadingUserReview = false }

    do {
      userReview = try await ReviewService.shared.getUserReview(
        tmdbId: seriesId,
        mediaType: "TV_SHOW",
        seasonNumber: season.seasonNumber
      )
    } catch {
      userReview = nil
    }
  }
}

// MARK: - Season Review Section View
struct SeasonReviewSectionView: View {
  let seriesId: Int
  let seasonNumber: Int
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
      } else if reviews.isEmpty {
        EmptyView()
      } else {
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
        seasonNumber: seasonNumber
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
