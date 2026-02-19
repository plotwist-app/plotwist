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

  @State private var isScrolled = false
  @State private var isLoading = false

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
            GeometryReader { geo in
              Color.clear.preference(key: ScrollOffsetPreferenceKey.self, value: geo.frame(in: .named("scroll")).minY)
            }
            .frame(height: 0)

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
        }
        .coordinateSpace(name: "scroll")
        .onPreferenceChange(ScrollOffsetPreferenceKey.self) { value in
          isScrolled = value < -10
        }
      }
    }
    .background(Color.appBackgroundAdaptive.ignoresSafeArea())
    .navigationBarHidden(true)
    .task { await loadReviewsIfNeeded() }
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
