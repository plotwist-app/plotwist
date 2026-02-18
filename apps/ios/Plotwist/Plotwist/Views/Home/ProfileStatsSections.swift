//
//  ProfileStatsSections.swift
//  Plotwist
//

import SwiftUI

// MARK: - Time Watched Card

extension ProfileStatsView {
  var timeWatchedCard: some View {
    NavigationLink {
      TimeWatchedDetailView(
        totalHours: totalHours,
        movieHours: movieHours,
        seriesHours: seriesHours,
        monthlyHours: monthlyHours,
        dailyAverage: dailyAverage,
        dailyAverageLabel: dailyAverageLabel,
        comparisonHours: comparisonHours,
        selectedPeriod: selectedPeriod,
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
          TimelineView(.animation(minimumInterval: 1.0 / 60.0)) { timeline in
            let currentHours = interpolatedHours(at: timeline.date)
            Text(formatTotalMinutes(currentHours))
              .font(.system(size: 48, weight: .bold, design: .rounded))
              .foregroundColor(.appForegroundAdaptive)
              .contentTransition(.numericText(countsDown: false))
          }

          Text(strings.minutes)
            .font(.system(size: 16, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
        }

        HStack(spacing: 8) {
          comparisonBadge
        }
        .padding(.top, 6)
      }
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(Color.statsCardBackground)
      .clipShape(RoundedRectangle(cornerRadius: 22))
    }
    .buttonStyle(.plain)
  }

  @ViewBuilder
  var comparisonBadge: some View {
    if let comparison = comparisonHours, selectedPeriod == .month || selectedPeriod == .year {
      let delta = totalHours - comparison
      let sign = delta >= 0 ? "+" : ""
      let label = selectedPeriod == .month
        ? String(format: strings.vsLastMonth, "\(sign)\(formatHoursMinutes(abs(delta)))")
        : String(format: strings.vsLastYear, "\(sign)\(formatHoursMinutes(abs(delta)))")

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
}

// MARK: - Top Genre Card (half-width, navigates to detail)

extension ProfileStatsView {
  var topGenreCard: some View {
    let topGenre = watchedGenres.first

    return NavigationLink {
      PeriodGenresView(genres: watchedGenres, period: selectedPeriod, strings: strings)
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

// MARK: - Top Review Card (half-width, navigates to detail)

extension ProfileStatsView {
  var topReviewCard: some View {
    let topReview = bestReviews.first

    return NavigationLink {
      PeriodReviewsView(reviews: bestReviews, period: selectedPeriod, strings: strings)
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
  let selectedPeriod: StatsPeriod
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
    if let comparison = comparisonHours, selectedPeriod == .month || selectedPeriod == .year {
      let delta = totalHours - comparison
      let sign = delta >= 0 ? "+" : ""
      let label = selectedPeriod == .month
        ? String(format: strings.vsLastMonth, "\(sign)\(formatHoursMinutes(abs(delta)))")
        : String(format: strings.vsLastYear, "\(sign)\(formatHoursMinutes(abs(delta)))")

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
  let period: StatsPeriod
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
  let period: StatsPeriod
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
        .clipShape(RoundedRectangle(cornerRadius: 6))
        .padding(5)
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
