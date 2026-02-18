//
//  ReviewSectionView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Review Section
struct ReviewSectionView: View {
  let mediaId: Int
  let mediaType: String
  let refreshId: UUID
  var mediaTitle: String? = nil
  var mediaPosterPath: String? = nil
  var mediaYear: String? = nil
  var onEmptyStateTapped: (() -> Void)?
  var onContentLoaded: ((Bool) -> Void)?

  @State private var reviews: [ReviewListItem] = []
  @State private var isLoading = true
  @State private var error: String?
  @State private var hasLoaded = false

  private var averageRating: Double {
    guard !reviews.isEmpty else { return 0 }
    let total = reviews.reduce(0) { $0 + $1.rating }
    return total / Double(reviews.count)
  }

  private var reviewsWithText: [ReviewListItem] {
    reviews.filter { !$0.review.isEmpty }
  }

  /// Show at most 3 reviews in the preview
  private var previewReviews: [ReviewListItem] {
    Array(reviewsWithText.prefix(3))
  }

  var body: some View {
    Group {
      if isLoading {
        // Loading skeleton
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
        // No reviews - show nothing
        EmptyView()
      } else {
        // Has reviews - show content
        VStack(spacing: 0) {
          // Rating header
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
                    NavigationLink {
                      AllReviewsView(
                        mediaId: mediaId,
                        mediaType: mediaType,
                        mediaTitle: mediaTitle,
                        mediaPosterPath: mediaPosterPath,
                        mediaYear: mediaYear,
                        highlightedReviewId: review.id
                      )
                    } label: {
                      ReviewItemView(review: review, lineLimit: 3)
                    }
                    .buttonStyle(.plain)
                    .frame(width: min(UIScreen.main.bounds.width * 0.75, 300))
                    .padding(.leading, index == 0 ? 24 : 0)
                    .padding(.trailing, 24)

                    // Vertical divider (except for last item)
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
            .padding(.top, 16)
          }

          // See all button
          if reviews.count >= 3 {
            NavigationLink {
              AllReviewsView(
                mediaId: mediaId,
                mediaType: mediaType,
                mediaTitle: mediaTitle,
                mediaPosterPath: mediaPosterPath,
                mediaYear: mediaYear
              )
            } label: {
              Text(L10n.current.seeAll)
                .font(.footnote.weight(.medium))
                .foregroundColor(.appForegroundAdaptive)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color.appInputFilled)
                .cornerRadius(10)
            }
            .buttonStyle(.plain)
            .padding(.horizontal, 24)
            .padding(.top, 16)
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
    // Skip if already loaded (unless force reload)
    guard !hasLoaded || forceReload else {
      isLoading = false
      onContentLoaded?(!reviews.isEmpty)
      return
    }

    isLoading = true
    error = nil

    do {
      let apiMediaType = mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      reviews = try await ReviewService.shared.getReviews(
        tmdbId: mediaId,
        mediaType: apiMediaType
      )
      isLoading = false
      hasLoaded = true
      onContentLoaded?(!reviews.isEmpty)
    } catch {
      self.error = error.localizedDescription
      isLoading = false
      hasLoaded = true
      onContentLoaded?(false)
    }
  }
}
