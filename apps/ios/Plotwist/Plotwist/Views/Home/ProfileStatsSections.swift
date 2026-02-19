//
//  ProfileStatsSections.swift
//  Plotwist

import SwiftUI

// MARK: - Month Section Content View (Equatable to prevent cascading re-renders)

struct MonthSectionContentView: View, Equatable {
  let section: MonthSection
  let userId: String
  let strings: Strings
  let period: String

  nonisolated static func == (lhs: Self, rhs: Self) -> Bool {
    lhs.section == rhs.section
  }

  var body: some View {
    VStack(spacing: 16) {
      timeWatchedCard
      topGenreAndReviewRow
    }
  }

  private var topGenreAndReviewRow: some View {
    let needsFade = section.watchedGenres.count > 5

    return HStack(alignment: .top, spacing: 12) {
      Color.statsCardBackground
        .clipShape(RoundedRectangle(cornerRadius: 22))
        .overlay(alignment: .top) {
          topGenreCard
            .mask(
              VStack(spacing: 0) {
                Color.black
                if needsFade {
                  LinearGradient(
                    colors: [Color.black, Color.black.opacity(0)],
                    startPoint: .top,
                    endPoint: .bottom
                  )
                  .frame(height: 60)
                }
              }
            )
        }
        .clipped()
        .clipShape(RoundedRectangle(cornerRadius: 22))
      topReviewCard
    }
  }
}

// MARK: - Month Section Header View (Equatable to prevent cascading re-renders)

struct MonthSectionHeaderView: View, Equatable {
  let section: MonthSection
  let isOwnProfile: Bool
  let onShare: () -> Void

  nonisolated static func == (lhs: Self, rhs: Self) -> Bool {
    lhs.section == rhs.section && lhs.isOwnProfile == rhs.isOwnProfile
  }

  var body: some View {
    HStack {
      Text(section.displayName)
        .font(.system(size: 15, weight: .semibold))
        .foregroundColor(.appMutedForegroundAdaptive)

      Spacer()

      if isOwnProfile {
        Button(action: onShare) {
          Image(systemName: "square.and.arrow.up")
            .font(.system(size: 16, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 10)
    .background(
      GeometryReader { geo in
        Color.appBackgroundAdaptive
          .overlay(alignment: .bottom) {
            Rectangle()
              .fill(Color.appBorderAdaptive)
              .frame(height: 1)
              .opacity(geo.frame(in: .named("statsTimeline")).minY < 2 ? 1 : 0)
          }
      }
    )
  }
}

// MARK: - Time Watched Card

extension MonthSectionContentView {
  private var timeWatchedCard: some View {
    NavigationLink {
      TimeWatchedDetailView(
        totalHours: section.totalHours,
        movieHours: section.movieHours,
        seriesHours: section.seriesHours,
        monthlyHours: section.monthlyHours,
        comparisonHours: section.comparisonHours,
        peakTimeSlot: section.peakTimeSlot,
        hourlyDistribution: section.hourlyDistribution,
        dailyActivity: section.dailyActivity,
        percentileRank: section.percentileRank,
        periodLabel: period == "all" ? strings.allTime : section.displayName,
        strings: strings,
        userId: userId,
        period: section.yearMonth
      )
    } label: {
      VStack(alignment: .leading, spacing: 0) {
        HStack(alignment: .top) {
          Text(strings.timeWatched)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
          Spacer()
          Image(systemName: "chevron.right")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .padding(.bottom, 20)

        HStack(alignment: .firstTextBaseline, spacing: 6) {
          Text(formatTotalHours(section.totalHours))
            .font(.system(size: 34, weight: .bold, design: .rounded))
            .foregroundColor(.appForegroundAdaptive)
            .contentTransition(.numericText(countsDown: false))

          Text(strings.hours)
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
        }

        if period != "all", let comparison = section.comparisonHours {
          comparisonBadgeView(totalHours: section.totalHours, comparison: comparison)
            .padding(.top, 6)
        }
      }
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(Color.statsCardBackground)
      .clipShape(RoundedRectangle(cornerRadius: 22))
    }
    .buttonStyle(.plain)
  }

  @ViewBuilder
  func comparisonBadgeView(totalHours: Double, comparison: Double) -> some View {
    let delta = totalHours - comparison
    let sign = delta >= 0 ? "+" : ""
    let label = "\(sign)\(formatHoursMinutes(abs(delta))) \(strings.vsLastMonthShort)"

    HStack(spacing: 4) {
      Image(systemName: delta >= 0 ? "arrow.up.right" : "arrow.down.right")
        .font(.system(size: 10, weight: .bold))
      Text(label)
        .font(.system(size: 12, weight: .semibold))
    }
    .foregroundColor(delta >= 0 ? Color(hex: "10B981") : Color(hex: "EF4444"))
    .padding(.horizontal, 10)
    .padding(.vertical, 6)
    .background((delta >= 0 ? Color(hex: "10B981") : Color(hex: "EF4444")).opacity(0.08))
    .clipShape(RoundedRectangle(cornerRadius: 10))
  }

  private static let ymFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "yyyy-MM"
    return f
  }()

  func computeDailyAverage() -> Double {
    guard section.totalHours > 0 else { return 0 }
    let cal = Calendar.current
    if period == "all" {
      if let firstMonth = section.monthlyHours.first?.month,
         let startDate = Self.ymFormatter.date(from: firstMonth) {
        let days = max(cal.dateComponents([.day], from: startDate, to: Date()).day ?? 30, 1)
        return section.totalHours / Double(days)
      }
      return section.totalHours / 30
    }
    if let date = Self.ymFormatter.date(from: period) {
      let now = Date()
      if cal.isDate(date, equalTo: now, toGranularity: .month) {
        return section.totalHours / Double(max(cal.component(.day, from: now), 1))
      } else {
        return section.totalHours / Double(cal.range(of: .day, in: .month, for: date)?.count ?? 30)
      }
    }
    return section.totalHours / 30
  }
}

// MARK: - Top Genre Card

extension MonthSectionContentView {
  private var topGenreCard: some View {
    let hasGenres = section.hasGenreData

    let genres = section.watchedGenres
    let maxCount = genres.first?.count ?? 1

    return NavigationLink {
      PeriodGenresView(
        genres: genres,
        periodLabel: section.yearMonth == "all" ? strings.allTime : section.displayName,
        strings: strings,
        userId: userId,
        period: section.yearMonth
      )
    } label: {
      VStack(alignment: .leading, spacing: 0) {
        HStack(alignment: .top) {
          Text(strings.favoriteGenre)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
          Spacer()
          if hasGenres {
            Image(systemName: "chevron.right")
              .font(.system(size: 12, weight: .semibold))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
        .padding(.bottom, 16)

        if !genres.isEmpty {
          VStack(spacing: 16) {
            ForEach(Array(genres.enumerated()), id: \.element.id) { index, genre in
              VStack(alignment: .leading, spacing: 4) {
                HStack {
                  Text(genre.name)
                    .font(.system(size: index == 0 ? 15 : 13, weight: index == 0 ? .bold : .semibold))
                    .foregroundColor(.appForegroundAdaptive)
                    .lineLimit(1)
                  Spacer()
                  Text("\(genre.count)")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.appMutedForegroundAdaptive)
                }

                GeometryReader { geo in
                  let fraction = maxCount > 0 ? CGFloat(genre.count) / CGFloat(maxCount) : 0
                  RoundedRectangle(cornerRadius: 3)
                    .fill(Color.appForegroundAdaptive.opacity(index == 0 ? 0.25 : 0.12))
                    .frame(width: geo.size.width * fraction)
                }
                .frame(height: 4)
              }
            }
          }
        } else {
          Text("–")
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
      .padding(16)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
    .buttonStyle(.plain)
    .disabled(!hasGenres)
  }
}

// MARK: - Top Review Card

extension MonthSectionContentView {
  private var topReviewCard: some View {
    let hasReviews = section.hasReviewData

    return NavigationLink {
      PeriodReviewsView(
        reviews: section.bestReviews,
        periodLabel: section.yearMonth == "all" ? strings.allTime : section.displayName,
        strings: strings,
        userId: userId,
        period: section.yearMonth
      )
    } label: {
      VStack(alignment: .leading, spacing: 0) {
        HStack(alignment: .top) {
          Text(strings.bestReview)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
          Spacer()
          if hasReviews {
            Image(systemName: "chevron.right")
              .font(.system(size: 12, weight: .semibold))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
        .padding(.bottom, 20)

        if let title = section.topReviewTitle {
          Text(title)
            .font(.system(size: 16, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(2)
            .minimumScaleFactor(0.85)
            .padding(.bottom, 10)

          statsPoster(url: section.topReviewPosterURL, rating: section.topReviewRating)
        } else {
          Text("–")
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .topLeading)
      .background(Color.statsCardBackground)
      .clipShape(RoundedRectangle(cornerRadius: 22))
    }
    .buttonStyle(.plain)
    .disabled(!hasReviews)
  }
}
