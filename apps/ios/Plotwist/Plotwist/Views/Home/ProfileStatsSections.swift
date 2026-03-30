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
          VStack(spacing: 14) {
            ForEach(Array(genres.enumerated()), id: \.element.id) { index, genre in
              VStack(alignment: .leading, spacing: 5) {
                HStack {
                  Text(genre.name)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.appForegroundAdaptive)
                    .lineLimit(1)
                  Spacer()
                  Text("\(genre.count)")
                    .font(.system(size: 12, weight: .medium, design: .rounded))
                    .foregroundColor(.appMutedForegroundAdaptive)
                }

                GeometryReader { geo in
                  let fraction = maxCount > 0 ? CGFloat(genre.count) / CGFloat(maxCount) : 0
                  ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                      .fill(Color.appForegroundAdaptive.opacity(0.08))
                    RoundedRectangle(cornerRadius: 3)
                      .fill(Color.appForegroundAdaptive.opacity(index == 0 ? 0.7 : 0.35))
                      .frame(width: geo.size.width * fraction)
                  }
                }
                .frame(height: 5)
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

// MARK: - Skeleton Loading Cards

struct StatsSkeletonView: View {
  var body: some View {
    VStack(spacing: 16) {
      skeletonTimeWatched
      HStack(alignment: .top, spacing: 12) {
        skeletonGenre
        skeletonReview
      }
    }
  }

  private var skeletonTimeWatched: some View {
    VStack(alignment: .leading, spacing: 0) {
      shimmerRect(width: 100, height: 12)
        .padding(.bottom, 20)

      shimmerRect(width: 80, height: 32)
        .padding(.bottom, 6)

      shimmerRect(width: 50, height: 12)
    }
    .padding(16)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(Color.statsCardBackground)
    .clipShape(RoundedRectangle(cornerRadius: 22))
  }

  private var skeletonGenre: some View {
    VStack(alignment: .leading, spacing: 0) {
      shimmerRect(width: 90, height: 12)
        .padding(.bottom, 16)

      VStack(spacing: 14) {
        ForEach(0..<4, id: \.self) { i in
          VStack(alignment: .leading, spacing: 5) {
            HStack {
              shimmerRect(width: CGFloat(70 - i * 10), height: 12)
              Spacer()
              shimmerRect(width: 16, height: 10)
            }
            shimmerRect(height: 5)
              .frame(width: CGFloat([1.0, 0.7, 0.5, 0.3][i]) * 100, alignment: .leading)
          }
        }
      }
    }
    .padding(16)
    .frame(maxWidth: .infinity, alignment: .topLeading)
    .background(Color.statsCardBackground)
    .clipShape(RoundedRectangle(cornerRadius: 22))
  }

  private var skeletonReview: some View {
    VStack(alignment: .leading, spacing: 0) {
      shimmerRect(width: 80, height: 12)
        .padding(.bottom, 20)

      shimmerRect(width: 100, height: 14)
        .padding(.bottom, 10)

      RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
        .fill(Color.appBorderAdaptive.opacity(0.3))
        .aspectRatio(2 / 3, contentMode: .fit)
        .modifier(ShimmerEffect())
    }
    .padding(16)
    .frame(maxWidth: .infinity, alignment: .topLeading)
    .background(Color.statsCardBackground)
    .clipShape(RoundedRectangle(cornerRadius: 22))
  }

  private func shimmerRect(width: CGFloat? = nil, height: CGFloat) -> some View {
    RoundedRectangle(cornerRadius: height / 2)
      .fill(Color.appBorderAdaptive.opacity(0.5))
      .frame(width: width, height: height)
      .modifier(ShimmerEffect())
  }
}

// MARK: - Locked PRO Cards

struct LockedStatsCardsView: View {
  let strings: Strings
  let onUpgrade: () -> Void

  var body: some View {
    VStack(spacing: 16) {
      tasteDNACard
      ratingInsightsCard
      countriesCard
      aiRecommendationsCard

      Button(action: onUpgrade) {
        HStack(spacing: 8) {
          ProBadge()
          Text(strings.unlockFullProfile)
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.appForegroundAdaptive)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 48)
        .background(Color.appInputFilled)
        .clipShape(Capsule())
      }
      .buttonStyle(.plain)
    }
  }

  // MARK: - Taste DNA

  private var tasteDNACard: some View {
    lockedCard(title: strings.yourTasteDNA, onTap: onUpgrade) {
      VStack(spacing: 16) {
        ForEach(0..<4, id: \.self) { i in
          let labels = ["Pace", "Tone", "Format", "Origin"]
          let icons = ["waveform.path", "theatermasks", "play.rectangle.on.rectangle", "globe"]
          let fills: [CGFloat] = [0.75, 0.6, 0.9, 0.45]

          HStack(spacing: 10) {
            Image(systemName: icons[i])
              .font(.system(size: 13))
              .foregroundColor(.appForegroundAdaptive.opacity(0.3))
              .frame(width: 20)

            VStack(alignment: .leading, spacing: 4) {
              Text(labels[i])
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.appMutedForegroundAdaptive)

              GeometryReader { geo in
                RoundedRectangle(cornerRadius: 3)
                  .fill(Color.appForegroundAdaptive.opacity(0.15))
                  .frame(width: geo.size.width * fills[i])
              }
              .frame(height: 6)
            }

            RoundedRectangle(cornerRadius: 2)
              .fill(Color.appBorderAdaptive.opacity(0.5))
              .frame(width: 60, height: 10)
          }
        }
      }
      .blur(radius: 5)
    }
  }

  // MARK: - Rating Insights

  private var ratingInsightsCard: some View {
    lockedCard(title: strings.ratingInsights, onTap: onUpgrade) {
      VStack(spacing: 12) {
        HStack(alignment: .firstTextBaseline, spacing: 4) {
          Text("3.8")
            .font(.system(size: 28, weight: .bold, design: .rounded))
            .foregroundColor(.appForegroundAdaptive)
          Image(systemName: "star.fill")
            .font(.system(size: 14))
            .foregroundColor(.appStarYellow)
        }
        .frame(maxWidth: .infinity, alignment: .leading)

        HStack(alignment: .bottom, spacing: 3) {
          let heights: [CGFloat] = [0.15, 0.25, 0.45, 0.9, 0.7, 0.55, 0.3, 0.2, 0.1, 0.05]
          ForEach(0..<10, id: \.self) { i in
            RoundedRectangle(cornerRadius: 2)
              .fill(Color.appForegroundAdaptive.opacity(0.18))
              .frame(maxWidth: .infinity)
              .frame(height: 50 * heights[i])
          }
        }
        .frame(height: 50)
        .blur(radius: 5)
      }
    }
  }

  // MARK: - Countries

  private var countriesCard: some View {
    lockedCard(title: strings.watchedCountries, onTap: onUpgrade) {
      VStack(spacing: 14) {
        ForEach(0..<4, id: \.self) { i in
          let widths: [CGFloat] = [1.0, 0.6, 0.4, 0.25]
          let flags = ["🇺🇸", "🇰🇷", "🇬🇧", "🇯🇵"]
          HStack(spacing: 8) {
            Text(flags[i])
              .font(.system(size: 16))

            VStack(alignment: .leading, spacing: 4) {
              RoundedRectangle(cornerRadius: 2)
                .fill(Color.appForegroundAdaptive.opacity(0.15))
                .frame(width: CGFloat(70 - i * 10), height: 10)

              GeometryReader { geo in
                RoundedRectangle(cornerRadius: 3)
                  .fill(Color.appForegroundAdaptive.opacity(i == 0 ? 0.25 : 0.12))
                  .frame(width: geo.size.width * widths[i])
              }
              .frame(height: 4)
            }

            Spacer()

            RoundedRectangle(cornerRadius: 2)
              .fill(Color.appBorderAdaptive.opacity(0.5))
              .frame(width: 20, height: 10)
          }
        }
      }
      .blur(radius: 5)
    }
  }

  // MARK: - AI Recommendations

  private var aiRecommendationsCard: some View {
    lockedCard(title: strings.aiRecommendations, icon: "sparkles", onTap: onUpgrade) {
      HStack(spacing: 10) {
        ForEach(0..<3, id: \.self) { _ in
          VStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 10)
              .fill(Color.appForegroundAdaptive.opacity(0.1))
              .aspectRatio(2 / 3, contentMode: .fit)

            RoundedRectangle(cornerRadius: 2)
              .fill(Color.appForegroundAdaptive.opacity(0.12))
              .frame(height: 8)

            RoundedRectangle(cornerRadius: 2)
              .fill(Color.appBorderAdaptive.opacity(0.4))
              .frame(width: 50, height: 6)
          }
        }
      }
      .blur(radius: 5)
    }
  }

  // MARK: - Reusable Locked Card Shell

  private func lockedCard<Content: View>(
    title: String,
    icon: String? = nil,
    onTap: @escaping () -> Void,
    @ViewBuilder content: () -> Content
  ) -> some View {
    Button(action: onTap) {
      VStack(alignment: .leading, spacing: 0) {
        HStack(alignment: .top) {
          HStack(spacing: 4) {
            if let icon {
              Image(systemName: icon)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.appMutedForegroundAdaptive)
            }
            Text(title)
              .font(.system(size: 13, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
          Spacer()
          ProBadge(size: .small)
        }
        .padding(.bottom, 16)

        content()
      }
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(Color.statsCardBackground)
      .clipShape(RoundedRectangle(cornerRadius: 22))
    }
    .buttonStyle(.plain)
  }
}
