//
//  SeasonReviewSectionView.swift
//  Plotwist
//

import SwiftUI

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
        reviewsSkeleton
      } else if reviews.isEmpty {
        EmptyView()
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
