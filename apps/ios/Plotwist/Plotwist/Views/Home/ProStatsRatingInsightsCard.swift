//
//  ProStatsRatingInsightsCard.swift
//  Plotwist
//

import SwiftUI

struct ProStatsRatingInsightsCard: View {
  let insights: RatingInsights
  let strings: Strings

  var body: some View {
    ProStatsCardShell.card(title: strings.ratingInsights) {
      VStack(alignment: .leading, spacing: 20) {
        HStack(alignment: .center, spacing: 16) {
          HStack(alignment: .firstTextBaseline, spacing: 6) {
            Text(String(format: "%.1f", insights.averageRating))
              .font(.system(size: 32, weight: .bold, design: .rounded))
              .foregroundColor(.appForegroundAdaptive)
            Image(systemName: "star.fill")
              .font(.system(size: 18))
              .foregroundColor(.appStarYellow)
          }
          .padding(.horizontal, 14)
          .padding(.vertical, 10)
          .background(Color.appForegroundAdaptive.opacity(0.06))
          .clipShape(RoundedRectangle(cornerRadius: 12))

          VStack(alignment: .leading, spacing: 2) {
            Text("\(insights.totalReviews) \(strings.reviewsLabel)")
              .font(.system(size: 15, weight: .semibold, design: .rounded))
              .foregroundColor(.appForegroundAdaptive)
            Text(strings.avgRating)
              .font(.system(size: 12, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
          }

          Spacer(minLength: 0)

          VStack(alignment: .trailing, spacing: 2) {
            Text(strings.mostGiven)
              .font(.system(size: 11, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
            HStack(spacing: 3) {
              Text(String(format: "%.1f", insights.mostFrequentRating))
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundColor(.appForegroundAdaptive)
              Image(systemName: "star.fill")
                .font(.system(size: 10))
                .foregroundColor(.appStarYellow)
            }
          }
        }

        ratingDistributionBars(insights.distribution)
      }
    }
  }

  private func ratingDistributionBars(_ distribution: [RatingBucket]) -> some View {
    let maxCount = distribution.map(\.count).max() ?? 1
    let sorted = distribution.sorted { $0.rating > $1.rating }
    let peakRating = distribution.max(by: { $0.count < $1.count })?.rating

    return VStack(spacing: 8) {
      ForEach(sorted) { bucket in
        HStack(alignment: .center, spacing: 10) {
          Text(bucket.rating.truncatingRemainder(dividingBy: 1) == 0 ? "\(Int(bucket.rating))" : String(format: "%.1f", bucket.rating))
            .font(.system(size: 12, weight: .medium, design: .rounded))
            .foregroundColor(.appMutedForegroundAdaptive)
            .frame(width: 20, alignment: .leading)

          GeometryReader { geo in
            let fraction = maxCount > 0 ? CGFloat(bucket.count) / CGFloat(maxCount) : 0
            ZStack(alignment: .leading) {
              RoundedRectangle(cornerRadius: 3)
                .fill(Color.appForegroundAdaptive.opacity(0.08))
              RoundedRectangle(cornerRadius: 3)
                .fill(bucket.rating == peakRating ? Color.appStarYellow.opacity(0.9) : Color.appForegroundAdaptive.opacity(0.28))
                .frame(width: max(geo.size.width * fraction, 4))
            }
          }
          .frame(height: 8)

          Text("\(bucket.count)")
            .font(.system(size: 12, weight: .semibold, design: .rounded))
            .foregroundColor(.appMutedForegroundAdaptive)
            .frame(width: 24, alignment: .trailing)
        }
      }
    }
  }
}

struct ProStatsRatingInsightsSkeleton: View {
  var body: some View {
    ProStatsCardShell.shell {
      VStack(alignment: .leading, spacing: 20) {
        HStack(alignment: .center, spacing: 16) {
          RoundedRectangle(cornerRadius: 12)
            .fill(Color.appBorderAdaptive.opacity(0.3))
            .frame(width: 72, height: 44)
            .modifier(ShimmerEffect())
          VStack(alignment: .leading, spacing: 4) {
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.25))
              .frame(width: 60, height: 14)
              .modifier(ShimmerEffect())
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.2))
              .frame(width: 50, height: 11)
              .modifier(ShimmerEffect())
          }
          Spacer(minLength: 0)
          VStack(alignment: .trailing, spacing: 4) {
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.2))
              .frame(width: 56, height: 11)
              .modifier(ShimmerEffect())
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.25))
              .frame(width: 36, height: 14)
              .modifier(ShimmerEffect())
          }
        }
        VStack(spacing: 8) {
          ForEach(0..<5, id: \.self) { _ in
            HStack(spacing: 10) {
              RoundedRectangle(cornerRadius: 3)
                .fill(Color.appBorderAdaptive.opacity(0.2))
                .frame(width: 20, height: 10)
                .modifier(ShimmerEffect())
              RoundedRectangle(cornerRadius: 3)
                .fill(Color.appBorderAdaptive.opacity(0.15))
                .frame(height: 8)
                .modifier(ShimmerEffect())
              RoundedRectangle(cornerRadius: 3)
                .fill(Color.appBorderAdaptive.opacity(0.2))
                .frame(width: 24, height: 10)
                .modifier(ShimmerEffect())
            }
          }
        }
      }
    }
  }
}
