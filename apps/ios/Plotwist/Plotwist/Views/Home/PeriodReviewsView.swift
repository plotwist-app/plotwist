//
//  PeriodReviewsView.swift
//  Plotwist

import SwiftUI

struct PeriodReviewsView: View {
  @Environment(\.dismiss) private var dismiss

  @State var reviews: [BestReview]
  let periodLabel: String
  let strings: Strings
  var userId: String? = nil
  var period: String? = nil

  @State private var scrollOffset: CGFloat = 0
  @State private var initialScrollOffset: CGFloat? = nil
  private let scrollThreshold: CGFloat = 10
  @State private var isLoading = false

  private var isScrolled: Bool {
    guard let initial = initialScrollOffset else { return false }
    return scrollOffset < initial - scrollThreshold
  }

  init(reviews: [BestReview], periodLabel: String, strings: Strings, userId: String? = nil, period: String? = nil) {
    _reviews = State(initialValue: reviews)
    self.periodLabel = periodLabel
    self.strings = strings
    self.userId = userId
    self.period = period
  }

  var body: some View {
    VStack(spacing: 0) {
      detailHeaderView(title: strings.bestReviews, isScrolled: isScrolled) { dismiss() }

      if isLoading && reviews.isEmpty {
        Spacer()
        ProgressView()
        Spacer()
      } else {
        ScrollView {
          VStack(alignment: .leading, spacing: 0) {
            Text(periodLabel)
              .font(.system(size: 13, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)

            Text(strings.bestReviews)
              .font(.system(size: 34, weight: .bold))
              .foregroundColor(.appForegroundAdaptive)
              .padding(.bottom, 16)

            LazyVStack(spacing: 16) {
              ForEach(Array(reviews.enumerated()), id: \.element.id) { index, review in
                BestReviewRow(review: review, rank: index + 1)
              }
            }
          }
          .padding(.horizontal, 24)
          .padding(.top, 16)
          .padding(.bottom, 24)
          .background(scrollOffsetReader)
        }
      }
    }
    .background(Color.appBackgroundAdaptive.ignoresSafeArea())
    .navigationBarHidden(true)
    .task { await loadReviewsIfNeeded() }
  }

  private var scrollOffsetReader: some View {
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
  }

  private func loadReviewsIfNeeded() async {
    guard let userId, let period, reviews.isEmpty, period != "all" else { return }
    isLoading = true
    if let loaded = try? await UserStatsService.shared.getBestReviews(
      userId: userId, language: Language.current.rawValue, period: period
    ) {
      reviews = loaded
    }
    isLoading = false
  }
}
