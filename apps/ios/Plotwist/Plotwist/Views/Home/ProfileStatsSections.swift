//
//  ProfileStatsSections.swift
//  Plotwist
//

import SwiftUI

// MARK: - Time Watched Card

extension ProfileStatsView {
  func timeWatchedCard(for section: MonthSection, period: String) -> some View {
    NavigationLink {
      TimeWatchedDetailView(
        totalHours: section.totalHours,
        movieHours: section.movieHours,
        seriesHours: section.seriesHours,
        monthlyHours: section.monthlyHours,
        dailyAverage: computeDailyAverage(section: section, period: period),
        dailyAverageLabel: strings.perDayThisMonth,
        comparisonHours: section.comparisonHours,
        periodLabel: period == "all" ? strings.allTime : section.displayName,
        showComparison: period != "all",
        strings: strings
      )
    } label: {
      VStack(alignment: .leading, spacing: 0) {
        HStack(alignment: .top) {
          Text(strings.timeWatched.uppercased())
            .font(.system(size: 11, weight: .medium))
            .tracking(1.5)
            .foregroundColor(.appMutedForegroundAdaptive)
          Spacer()
          Image(systemName: "chevron.right")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .padding(.bottom, 14)

        HStack(alignment: .firstTextBaseline, spacing: 6) {
          Text(formatTotalMinutes(section.totalHours))
            .font(.system(size: 48, weight: .bold, design: .rounded))
            .foregroundColor(.appForegroundAdaptive)
            .contentTransition(.numericText(countsDown: false))

          Text(strings.minutes)
            .font(.system(size: 16, weight: .medium))
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

  func computeDailyAverage(section: MonthSection, period: String) -> Double {
    guard section.totalHours > 0 else { return 0 }
    if period == "all" {
      if let firstMonth = section.monthlyHours.first?.month {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM"
        if let startDate = formatter.date(from: firstMonth) {
          let days = max(Calendar.current.dateComponents([.day], from: startDate, to: Date()).day ?? 30, 1)
          return section.totalHours / Double(days)
        }
      }
      return section.totalHours / 30
    }

    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM"
    if let date = formatter.date(from: period) {
      let now = Date()
      let cal = Calendar.current
      let sameMonth = cal.isDate(date, equalTo: now, toGranularity: .month)
      if sameMonth {
        let day = max(cal.component(.day, from: now), 1)
        return section.totalHours / Double(day)
      } else {
        let range = cal.range(of: .day, in: .month, for: date)
        return section.totalHours / Double(range?.count ?? 30)
      }
    }

    return section.totalHours / 30
  }
}

// MARK: - Top Genre Card

extension ProfileStatsView {
  func topGenreCard(for section: MonthSection) -> some View {
    let topGenre = section.watchedGenres.first

    return NavigationLink {
      PeriodGenresView(genres: section.watchedGenres, periodLabel: section.yearMonth == "all" ? strings.allTime : section.displayName, strings: strings)
    } label: {
      VStack(alignment: .leading, spacing: 0) {
        HStack(alignment: .top) {
          Text(strings.favoriteGenre.uppercased())
            .font(.system(size: 11, weight: .medium))
            .tracking(1.5)
            .foregroundColor(.appMutedForegroundAdaptive)
          Spacer()
          Image(systemName: "chevron.right")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .padding(.bottom, 14)

        if let genre = topGenre {
          Text(genre.name)
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(1)
            .padding(.bottom, 10)

          if let posterURL = genre.posterURL {
            statsPoster(url: posterURL)
          }
        }
      }
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(Color.statsCardBackground)
      .clipShape(RoundedRectangle(cornerRadius: 22))
    }
    .buttonStyle(.plain)
  }
}

// MARK: - Top Review Card

extension ProfileStatsView {
  func topReviewCard(for section: MonthSection) -> some View {
    let topReview = section.bestReviews.first

    return NavigationLink {
      PeriodReviewsView(reviews: section.bestReviews, periodLabel: section.yearMonth == "all" ? strings.allTime : section.displayName, strings: strings)
    } label: {
      VStack(alignment: .leading, spacing: 0) {
        HStack(alignment: .top) {
          Text(strings.bestReview.uppercased())
            .font(.system(size: 11, weight: .medium))
            .tracking(1.5)
            .foregroundColor(.appMutedForegroundAdaptive)
          Spacer()
          Image(systemName: "chevron.right")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .padding(.bottom, 14)

        if let review = topReview {
          Text(review.title)
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(1)
            .padding(.bottom, 10)

          statsPoster(url: review.posterURL, rating: review.rating)
        }
      }
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(Color.statsCardBackground)
      .clipShape(RoundedRectangle(cornerRadius: 22))
    }
    .buttonStyle(.plain)
  }
}


// MARK: - Time Watched Detail View

struct TimeWatchedDetailView: View {
  @Environment(\.dismiss) private var dismiss

  let totalHours: Double
  let movieHours: Double
  let seriesHours: Double
  let monthlyHours: [MonthlyHoursEntry]
  let dailyAverage: Double
  let dailyAverageLabel: String
  let comparisonHours: Double?
  let periodLabel: String
  let showComparison: Bool
  let strings: Strings

  @State private var scrollOffset: CGFloat = 0
  @State private var initialScrollOffset: CGFloat?
  private let scrollThreshold: CGFloat = 40

  private var isScrolled: Bool {
    guard let initial = initialScrollOffset else { return false }
    return scrollOffset < initial - scrollThreshold
  }

  var body: some View {
    VStack(spacing: 0) {
      detailHeaderView(title: strings.timeWatched, isScrolled: isScrolled) { dismiss() }

      ScrollView {
        VStack(alignment: .leading, spacing: 24) {
          scrollOffsetReader
            .frame(height: 0)

          Text(strings.timeWatched)
            .font(.system(size: 34, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)

          VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
              Text(formatTotalMinutes(totalHours))
                .font(.system(size: 56, weight: .bold, design: .rounded))
                .foregroundColor(.appForegroundAdaptive)

              Text(strings.minutes)
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(.appMutedForegroundAdaptive)
            }

            comparisonBadge
              .padding(.top, 4)
          }

          if dailyAverage > 0 {
            HStack(spacing: 8) {
              Image(systemName: "clock.fill")
                .font(.system(size: 14))
                .foregroundColor(Color(hex: "3B82F6"))
              Text("\(formatHoursMinutes(dailyAverage)) \(dailyAverageLabel)")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(Color(hex: "3B82F6").opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 12))
          }

          if movieHours > 0 || seriesHours > 0 {
            VStack(alignment: .leading, spacing: 12) {
              breakdownRow(
                color: Color(hex: "3B82F6"),
                label: strings.movies,
                minutes: formatTotalMinutes(movieHours),
                percentage: totalHours > 0 ? movieHours / totalHours * 100 : 0
              )
              breakdownRow(
                color: Color(hex: "10B981"),
                label: strings.series,
                minutes: formatTotalMinutes(seriesHours),
                percentage: totalHours > 0 ? seriesHours / totalHours * 100 : 0
              )
            }
            .padding(16)
            .background(Color.appInputFilled.opacity(0.4))
            .clipShape(RoundedRectangle(cornerRadius: 16))
          }

          if monthlyHours.count >= 2 {
            VStack(alignment: .leading, spacing: 12) {
              Text(strings.activity.uppercased())
                .font(.system(size: 11, weight: .medium))
                .tracking(1.5)
                .foregroundColor(.appMutedForegroundAdaptive)

              chartView
            }
            .padding(16)
            .background(Color.appInputFilled.opacity(0.4))
            .clipShape(RoundedRectangle(cornerRadius: 16))
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        .padding(.bottom, 24)
      }
    }
    .navigationBarHidden(true)
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

  @ViewBuilder
  var comparisonBadge: some View {
    if showComparison, let comparison = comparisonHours {
      let delta = totalHours - comparison
      let sign = delta >= 0 ? "+" : ""
      let label = String(format: strings.vsLastMonth, "\(sign)\(formatHoursMinutes(abs(delta)))")

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
  }

  func breakdownRow(color: Color, label: String, minutes: String, percentage: Double) -> some View {
    HStack(spacing: 12) {
      RoundedRectangle(cornerRadius: 3)
        .fill(color)
        .frame(width: 4, height: 36)

      VStack(alignment: .leading, spacing: 2) {
        Text(label)
          .font(.system(size: 14, weight: .semibold))
          .foregroundColor(.appForegroundAdaptive)
        Text("\(minutes) min")
          .font(.system(size: 13))
          .foregroundColor(.appMutedForegroundAdaptive)
      }

      Spacer()

      Text(String(format: "%.0f%%", percentage))
        .font(.system(size: 16, weight: .bold, design: .rounded))
        .foregroundColor(.appMutedForegroundAdaptive)
    }
  }

  var chartView: some View {
    let maxHours = max(monthlyHours.map(\.hours).max() ?? 1, 1)
    let avgHours: Double = {
      let nonZero = monthlyHours.filter { $0.hours > 0 }
      guard !nonZero.isEmpty else { return 0.0 }
      return nonZero.map(\.hours).reduce(0, +) / Double(nonZero.count)
    }()
    let chartHeight: CGFloat = 140
    let gridSteps = computeGridSteps(maxValue: maxHours)
    let ceilMax = gridSteps.last ?? maxHours
    let isDaily = monthlyHours.first?.month.split(separator: "-").count == 3

    return VStack(spacing: 0) {
      HStack(alignment: .bottom, spacing: 0) {
        HStack(alignment: .bottom, spacing: isDaily ? 2 : 6) {
          ForEach(monthlyHours) { entry in
            let barHeight = entry.hours > 0 ? CGFloat(entry.hours / ceilMax) * chartHeight : 0

            RoundedRectangle(cornerRadius: isDaily ? 2 : 3)
              .fill(
                entry.hours > 0
                  ? LinearGradient(
                      colors: [Color(hex: "3B82F6"), Color(hex: "10B981")],
                      startPoint: .bottom,
                      endPoint: .top
                    )
                  : LinearGradient(
                      colors: [Color.appBorderAdaptive.opacity(0.2)],
                      startPoint: .bottom,
                      endPoint: .top
                    )
              )
              .frame(height: max(barHeight, 2))
              .frame(maxWidth: .infinity)
          }
        }
        .frame(height: chartHeight)
        .overlay(
          avgHours > 0 ?
            AnyView(
              GeometryReader { geo in
                let y = geo.size.height - CGFloat(avgHours / ceilMax) * geo.size.height
                Path { path in
                  path.move(to: CGPoint(x: 0, y: y))
                  path.addLine(to: CGPoint(x: geo.size.width, y: y))
                }
                .stroke(style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
                .foregroundColor(Color(hex: "F59E0B").opacity(0.6))
              }
            ) : AnyView(EmptyView())
        )

        VStack(alignment: .trailing) {
          ForEach(Array(gridSteps.reversed().enumerated()), id: \.offset) { idx, step in
            if idx > 0 { Spacer() }
            Text(formatAxisLabel(step))
              .font(.system(size: 8, weight: .medium, design: .rounded))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
        .frame(width: 24, height: chartHeight)
        .padding(.leading, 4)
      }

      if !isDaily {
        HStack(spacing: 6) {
          ForEach(monthlyHours) { entry in
            Text(shortMonthLabel(entry.month))
              .font(.system(size: 9, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
              .frame(maxWidth: .infinity)
          }
          Spacer().frame(width: 28)
        }
        .padding(.top, 4)
      }
    }
  }
}

// MARK: - All Genres Detail View

struct PeriodGenresView: View {
  @Environment(\.dismiss) private var dismiss

  let genres: [WatchedGenre]
  let periodLabel: String
  let strings: Strings

  @State private var scrollOffset: CGFloat = 0
  @State private var initialScrollOffset: CGFloat?
  private let scrollThreshold: CGFloat = 40

  private var isScrolled: Bool {
    guard let initial = initialScrollOffset else { return false }
    return scrollOffset < initial - scrollThreshold
  }

  var body: some View {
    VStack(spacing: 0) {
      detailHeaderView(title: strings.favoriteGenres, isScrolled: isScrolled) { dismiss() }

      ScrollView {
        let maxCount = genres.map(\.count).max() ?? 1

        VStack(alignment: .leading, spacing: 0) {
          scrollOffsetReader
            .frame(height: 0)

          Text(strings.favoriteGenres)
            .font(.system(size: 34, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
            .padding(.bottom, 16)

          LazyVStack(spacing: 0) {
            ForEach(Array(genres.enumerated()), id: \.element.id) { index, genre in
              VStack(spacing: 0) {
                HStack {
                  Text("\(index + 1)")
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .frame(width: 24, alignment: .leading)

                  Text(genre.name)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(.appForegroundAdaptive)

                  Spacer()

                  Text(String(format: "%.0f%%", genre.percentage))
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundColor(.appMutedForegroundAdaptive)
                }
                .padding(.vertical, 14)

                GeometryReader { geo in
                  ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                      .fill(Color.appBorderAdaptive.opacity(0.3))
                      .frame(height: 5)
                    RoundedRectangle(cornerRadius: 3)
                      .fill(Color(hex: "3B82F6"))
                      .frame(width: geo.size.width * CGFloat(genre.count) / CGFloat(max(maxCount, 1)), height: 5)
                  }
                }
                .frame(height: 5)

                if index < genres.count - 1 {
                  Divider().padding(.top, 12)
                }
              }
            }
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        .padding(.bottom, 24)
      }
    }
    .navigationBarHidden(true)
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
}

// MARK: - All Reviews Detail View

struct PeriodReviewsView: View {
  @Environment(\.dismiss) private var dismiss

  let reviews: [BestReview]
  let periodLabel: String
  let strings: Strings

  @State private var scrollOffset: CGFloat = 0
  @State private var initialScrollOffset: CGFloat?
  private let scrollThreshold: CGFloat = 40

  private var isScrolled: Bool {
    guard let initial = initialScrollOffset else { return false }
    return scrollOffset < initial - scrollThreshold
  }

  var body: some View {
    VStack(spacing: 0) {
      detailHeaderView(title: strings.bestReviews, isScrolled: isScrolled) { dismiss() }

      ScrollView {
        VStack(alignment: .leading, spacing: 0) {
          scrollOffsetReader
            .frame(height: 0)

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
    }
    .navigationBarHidden(true)
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
}

// MARK: - Shared Detail Header

@ViewBuilder
func detailHeaderView(title: String, isScrolled: Bool, onBack: @escaping () -> Void) -> some View {
  ZStack {
    if isScrolled {
      Text(title)
        .font(.headline)
        .foregroundColor(.appForegroundAdaptive)
        .transition(.opacity.combined(with: .move(edge: .bottom)))
    }

    HStack {
      Button(action: onBack) {
        Image(systemName: "chevron.left")
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(.appForegroundAdaptive)
          .frame(width: 36, height: 36)
          .background(Color.appInputFilled)
          .clipShape(Circle())
      }

      Spacer()
    }
  }
  .padding(.horizontal, 24)
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
}

// MARK: - Stats Poster (70% width, standard corner radius)

@ViewBuilder
func statsPoster(url: URL?, rating: Double? = nil) -> some View {
  let cr = DesignTokens.CornerRadius.poster

  GeometryReader { geo in
    let posterWidth = geo.size.width * 0.7

    CachedAsyncImage(url: url) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: cr)
        .fill(Color.appBorderAdaptive.opacity(0.3))
    }
    .frame(width: posterWidth, height: posterWidth * 3 / 2)
    .clipShape(RoundedRectangle(cornerRadius: cr))
    .overlay(alignment: .bottomTrailing) {
      if let rating {
        HStack(spacing: 2) {
          Image(systemName: "star.fill")
            .font(.system(size: 9))
            .foregroundColor(Color(hex: "F59E0B"))
          Text(String(format: "%.1f", rating))
            .font(.system(size: 12, weight: .bold, design: .rounded))
            .foregroundColor(.white)
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 4)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: cr * 0.5))
        .padding(6)
      }
    }
    .posterBorder()
  }
  .aspectRatio(1.0 / 1.05, contentMode: .fit)
}

// MARK: - Shimmer Effect

struct ShimmerEffect: ViewModifier {
  @State private var phase: CGFloat = 0

  func body(content: Content) -> some View {
    content
      .opacity(0.4 + 0.3 * Foundation.sin(Double(phase)))
      .onAppear {
        withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true)) {
          phase = .pi
        }
      }
  }
}

// MARK: - Stats Share Card (Stories 9:16)

struct StatsShareCardView: View {
  let section: MonthSection
  let strings: Strings

  private let cardWidth: CGFloat = 1080 / 3
  private let cardHeight: CGFloat = 1920 / 3

  private let accentBlue = Color(hex: "3B82F6")
  private let accentGreen = Color(hex: "10B981")

  var body: some View {
    ZStack {
      // Background gradient
      LinearGradient(
        stops: [
          .init(color: Color(hex: "000000"), location: 0),
          .init(color: Color(hex: "0A0A0A"), location: 0.3),
          .init(color: Color(hex: "141414"), location: 0.6),
          .init(color: Color(hex: "1A1A1A"), location: 1),
        ],
        startPoint: .top,
        endPoint: .bottom
      )

      VStack(spacing: 0) {
        // Top section: month + time
        VStack(alignment: .leading, spacing: 16) {
          Text(section.displayName.uppercased())
            .font(.system(size: 11, weight: .bold))
            .tracking(2.5)
            .foregroundColor(accentBlue)

          Text(strings.myMonthInReview)
            .font(.system(size: 20, weight: .bold))
            .foregroundColor(.white)

          VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .firstTextBaseline, spacing: 6) {
              Text(formatTotalMinutes(section.totalHours))
                .font(.system(size: 52, weight: .heavy, design: .rounded))
                .foregroundColor(.white)

              Text(strings.minutes)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.white.opacity(0.5))
            }

            if section.movieHours > 0 || section.seriesHours > 0 {
              HStack(spacing: 14) {
                HStack(spacing: 5) {
                  Circle().fill(accentBlue).frame(width: 6, height: 6)
                  Text("\(strings.movies) \(formatTotalMinutes(section.movieHours))m")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.white.opacity(0.5))
                }
                HStack(spacing: 5) {
                  Circle().fill(accentGreen).frame(width: 6, height: 6)
                  Text("\(strings.series) \(formatTotalMinutes(section.seriesHours))m")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.white.opacity(0.5))
                }
              }
            }
          }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 24)
        .padding(.top, 48)

        Spacer().frame(height: 24)

        // Posters section
        HStack(alignment: .top, spacing: 12) {
          // Genre poster
          if let genre = section.watchedGenres.first {
            VStack(alignment: .leading, spacing: 8) {
              sharePoster(url: genre.posterURL)

              Text(strings.favoriteGenre.uppercased())
                .font(.system(size: 9, weight: .bold))
                .tracking(1)
                .foregroundColor(.white.opacity(0.35))

              Text(genre.name)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
          }

          // Review poster
          if let review = section.bestReviews.first {
            VStack(alignment: .leading, spacing: 8) {
              sharePoster(url: review.posterURL, rating: review.rating)

              Text(strings.bestReview.uppercased())
                .font(.system(size: 9, weight: .bold))
                .tracking(1)
                .foregroundColor(.white.opacity(0.35))

              Text(review.title)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
          }
        }
        .padding(.horizontal, 24)

        Spacer()

        // Footer
        HStack {
          Text("plotwist")
            .font(.system(size: 14, weight: .bold, design: .rounded))
            .foregroundColor(.white.opacity(0.25))

          Spacer()

          Text("plotwist.app")
            .font(.system(size: 11, weight: .medium))
            .foregroundColor(.white.opacity(0.2))
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 32)
      }
    }
    .frame(width: cardWidth, height: cardHeight)
  }

  @ViewBuilder
  func sharePoster(url: URL?, rating: Double? = nil) -> some View {
    let cr: CGFloat = 12

    CachedAsyncImage(url: url) { image in
      image
        .resizable()
        .aspectRatio(2 / 3, contentMode: .fit)
    } placeholder: {
      RoundedRectangle(cornerRadius: cr)
        .fill(Color.white.opacity(0.08))
        .aspectRatio(2 / 3, contentMode: .fit)
    }
    .clipShape(RoundedRectangle(cornerRadius: cr))
    .overlay(alignment: .bottomTrailing) {
      if let rating {
        HStack(spacing: 3) {
          Image(systemName: "star.fill")
            .font(.system(size: 8))
            .foregroundColor(Color(hex: "F59E0B"))
          Text(String(format: "%.1f", rating))
            .font(.system(size: 11, weight: .bold, design: .rounded))
            .foregroundColor(.white)
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 4)
        .background(.ultraThinMaterial.opacity(0.9))
        .clipShape(RoundedRectangle(cornerRadius: cr * 0.5))
        .padding(6)
      }
    }
  }
}
