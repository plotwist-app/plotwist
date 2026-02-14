//
//  AllReviewsView.swift
//  Plotwist
//

import SwiftUI

struct AllReviewsView: View {
  let mediaId: Int
  let mediaType: String
  var mediaTitle: String? = nil
  var mediaPosterPath: String? = nil
  var mediaYear: String? = nil
  var highlightedReviewId: String? = nil

  @State private var reviews: [ReviewListItem] = []
  @State private var isLoading = true
  @State private var error: String?
  @State private var expandedReviewIds: Set<String> = []
  @State private var hasScrolledToHighlight = false
  @ObservedObject private var themeManager = ThemeManager.shared

  private var averageRating: Double {
    guard !reviews.isEmpty else { return 0 }
    return reviews.reduce(0) { $0 + $1.rating } / Double(reviews.count)
  }

  var body: some View {
    ScrollViewReader { proxy in
      ScrollView(showsIndicators: false) {
        LazyVStack(spacing: 0) {
          if isLoading {
            ForEach(0..<5, id: \.self) { _ in
              ReviewItemSkeleton()
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
            }
          } else if let error = error {
            VStack(spacing: 8) {
              Image(systemName: "exclamationmark.triangle")
                .font(.title2)
                .foregroundColor(.appMutedForegroundAdaptive)
              Text(error)
                .font(.subheadline)
                .foregroundColor(.appMutedForegroundAdaptive)
            }
            .frame(maxWidth: .infinity)
            .padding(.top, 40)
          } else if reviews.isEmpty {
            VStack(spacing: 12) {
              Image(systemName: "star.bubble")
                .font(.system(size: 40))
                .foregroundColor(.appMutedForegroundAdaptive)

              Text(L10n.current.beFirstToReview)
                .font(.subheadline)
                .foregroundColor(.appMutedForegroundAdaptive)
            }
            .frame(maxWidth: .infinity)
            .padding(.top, 60)
          } else {
            // Rating summary
            HStack(spacing: 6) {
              Image(systemName: "star.fill")
                .font(.system(size: 14))
                .foregroundColor(.appStarYellow)

              Text(String(format: "%.1f", averageRating))
                .font(.subheadline.weight(.semibold))
                .foregroundColor(.appForegroundAdaptive)

              Text("·")
                .foregroundColor(.appMutedForegroundAdaptive)

              Text(
                "\(reviews.count) \(reviews.count == 1 ? L10n.current.reviewSingular.lowercased() : L10n.current.tabReviews.lowercased())"
              )
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 24)
            .padding(.top, 12)
            .padding(.bottom, 4)

            // Reviews list
            ForEach(Array(reviews.enumerated()), id: \.element.id) { index, review in
              let isHighlighted = review.id == highlightedReviewId
              let isExpanded = expandedReviewIds.contains(review.id)

              ReviewItemView(
                review: review,
                lineLimit: isExpanded || isHighlighted ? nil : 4
              )
              .padding(.horizontal, 24)
              .padding(.vertical, 20)
              .background(
                isHighlighted && !hasScrolledToHighlight
                  ? Color.accentColor.opacity(0.06)
                  : Color.clear
              )
              .id(review.id)
              .contentShape(Rectangle())
              .onTapGesture {
                withAnimation(.easeInOut(duration: 0.2)) {
                  if expandedReviewIds.contains(review.id) {
                    expandedReviewIds.remove(review.id)
                  } else {
                    expandedReviewIds.insert(review.id)
                  }
                }
              }

              if index < reviews.count - 1 {
                Divider()
                  .padding(.horizontal, 24)
              }
            }
          }
        }
        .padding(.bottom, 40)
      }
      .onChange(of: reviews.count) { _, _ in
        if let highlightId = highlightedReviewId,
           !hasScrolledToHighlight,
           reviews.contains(where: { $0.id == highlightId })
        {
          DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            withAnimation(.easeInOut(duration: 0.4)) {
              proxy.scrollTo(highlightId, anchor: .top)
            }
            // Fade out highlight after a moment
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
              withAnimation(.easeOut(duration: 0.6)) {
                hasScrolledToHighlight = true
              }
            }
          }
        }
      }
    }
    .background(Color.appBackgroundAdaptive.ignoresSafeArea())
    .navigationBarTitleDisplayMode(.inline)
    .navigationTitle(L10n.current.tabReviews)
    .preferredColorScheme(themeManager.current.colorScheme)
    .task { await loadReviews() }
  }

  private func loadReviews() async {
    isLoading = true
    error = nil
    do {
      let apiType = mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      reviews = try await ReviewService.shared.getReviews(tmdbId: mediaId, mediaType: apiType)
      isLoading = false
    } catch {
      self.error = error.localizedDescription
      isLoading = false
    }
  }
}
