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
      HStack(alignment: .top, spacing: 12) {
        topGenreCard
        topReviewCard
      }
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
        .font(.system(size: 20, weight: .bold))
        .foregroundColor(.appForegroundAdaptive)

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
        dailyAverage: computeDailyAverage(),
        dailyAverageLabel: strings.perDayThisMonth,
        comparisonHours: section.comparisonHours,
        periodLabel: period == "all" ? strings.allTime : section.displayName,
        showComparison: period != "all",
        strings: strings,
        userId: userId,
        period: section.yearMonth
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

  private static let ymFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "yyyy-MM"
    return f
  }()

  func computeDailyAverage() -> Double {
    guard section.totalHours > 0 else { return 0 }
    if period == "all" {
      if let firstMonth = section.monthlyHours.first?.month {
        if let startDate = Self.ymFormatter.date(from: firstMonth) {
          let days = max(Calendar.current.dateComponents([.day], from: startDate, to: Date()).day ?? 30, 1)
          return section.totalHours / Double(days)
        }
      }
      return section.totalHours / 30
    }

    if let date = Self.ymFormatter.date(from: period) {
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

extension MonthSectionContentView {
  private var topGenreCard: some View {
    let hasGenres = section.hasGenreData

    return NavigationLink {
      PeriodGenresView(
        genres: section.watchedGenres,
        periodLabel: section.yearMonth == "all" ? strings.allTime : section.displayName,
        strings: strings,
        userId: userId,
        period: section.yearMonth
      )
    } label: {
      VStack(alignment: .leading, spacing: 0) {
        HStack(alignment: .top) {
          Text(strings.favoriteGenre.uppercased())
            .font(.system(size: 11, weight: .medium))
            .tracking(1.5)
            .foregroundColor(.appMutedForegroundAdaptive)
          Spacer()
          if hasGenres {
            Image(systemName: "chevron.right")
              .font(.system(size: 12, weight: .semibold))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
        .padding(.bottom, 14)

        if let name = section.topGenreName {
          Text(name)
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(1)
            .padding(.bottom, 10)

          if let posterURL = section.topGenrePosterURL {
            statsPoster(url: posterURL)
          }
        } else {
          Text("–")
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
      .padding(16)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
      .background(Color.statsCardBackground)
      .clipShape(RoundedRectangle(cornerRadius: 22))
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
          Text(strings.bestReview.uppercased())
            .font(.system(size: 11, weight: .medium))
            .tracking(1.5)
            .foregroundColor(.appMutedForegroundAdaptive)
          Spacer()
          if hasReviews {
            Image(systemName: "chevron.right")
              .font(.system(size: 12, weight: .semibold))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
        .padding(.bottom, 14)

        if let title = section.topReviewTitle {
          Text(title)
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(1)
            .padding(.bottom, 10)

          statsPoster(url: section.topReviewPosterURL, rating: section.topReviewRating)
        } else {
          Text("–")
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
      .padding(16)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
      .background(Color.statsCardBackground)
      .clipShape(RoundedRectangle(cornerRadius: 22))
    }
    .buttonStyle(.plain)
    .disabled(!hasReviews)
  }
}


// MARK: - Time Watched Detail View

struct TimeWatchedDetailView: View {
  @Environment(\.dismiss) private var dismiss

  let totalHours: Double
  let movieHours: Double
  let seriesHours: Double
  @State var monthlyHours: [MonthlyHoursEntry]
  let dailyAverage: Double
  let dailyAverageLabel: String
  let comparisonHours: Double?
  let periodLabel: String
  let showComparison: Bool
  let strings: Strings
  var userId: String? = nil
  var period: String? = nil

  @State private var isScrolled = false

  init(totalHours: Double, movieHours: Double, seriesHours: Double, monthlyHours: [MonthlyHoursEntry],
       dailyAverage: Double, dailyAverageLabel: String, comparisonHours: Double?,
       periodLabel: String, showComparison: Bool, strings: Strings,
       userId: String? = nil, period: String? = nil) {
    self.totalHours = totalHours
    self.movieHours = movieHours
    self.seriesHours = seriesHours
    _monthlyHours = State(initialValue: monthlyHours)
    self.dailyAverage = dailyAverage
    self.dailyAverageLabel = dailyAverageLabel
    self.comparisonHours = comparisonHours
    self.periodLabel = periodLabel
    self.showComparison = showComparison
    self.strings = strings
    self.userId = userId
    self.period = period
  }

  var body: some View {
    VStack(spacing: 0) {
      detailHeaderView(title: strings.timeWatched, isScrolled: isScrolled) { dismiss() }

      ScrollView {
        VStack(alignment: .leading, spacing: 24) {
          GeometryReader { geo in
            Color.clear.preference(key: ScrollOffsetPreferenceKey.self, value: geo.frame(in: .named("scroll")).minY)
          }
          .frame(height: 0)

          Text(periodLabel)
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)

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
      .coordinateSpace(name: "scroll")
      .onPreferenceChange(ScrollOffsetPreferenceKey.self) { value in
        isScrolled = value < -40
      }
    }
    .background(Color.appBackgroundAdaptive.ignoresSafeArea())
    .navigationBarHidden(true)
    .task { await loadMonthlyHoursIfNeeded() }
  }

  private func loadMonthlyHoursIfNeeded() async {
    guard let userId, let period, monthlyHours.isEmpty, period != "all" else { return }
    if let result = try? await UserStatsService.shared.getTotalHours(userId: userId, period: period) {
      monthlyHours = result.monthlyHours
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

  @State var genres: [WatchedGenre]
  let periodLabel: String
  let strings: Strings
  var userId: String? = nil
  var period: String? = nil

  @State private var isScrolled = false
  @State private var isLoading = false

  init(genres: [WatchedGenre], periodLabel: String, strings: Strings, userId: String? = nil, period: String? = nil) {
    _genres = State(initialValue: genres)
    self.periodLabel = periodLabel
    self.strings = strings
    self.userId = userId
    self.period = period
  }

  var body: some View {
    VStack(spacing: 0) {
      detailHeaderView(title: strings.favoriteGenres, isScrolled: isScrolled) { dismiss() }

      if isLoading && genres.isEmpty {
        Spacer()
        ProgressView()
        Spacer()
      } else {
        ScrollView {
          let maxCount = genres.map(\.count).max() ?? 1

          VStack(alignment: .leading, spacing: 0) {
            GeometryReader { geo in
              Color.clear.preference(key: ScrollOffsetPreferenceKey.self, value: geo.frame(in: .named("scroll")).minY)
            }
            .frame(height: 0)

            Text(periodLabel)
              .font(.system(size: 14, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)

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
        .coordinateSpace(name: "scroll")
        .onPreferenceChange(ScrollOffsetPreferenceKey.self) { value in
          isScrolled = value < -40
        }
      }
    }
    .background(Color.appBackgroundAdaptive.ignoresSafeArea())
    .navigationBarHidden(true)
    .task { await loadGenresIfNeeded() }
  }

  private func loadGenresIfNeeded() async {
    guard let userId, let period, genres.count <= 1, period != "all" else { return }
    isLoading = true
    if let loaded = try? await UserStatsService.shared.getWatchedGenres(
      userId: userId, language: Language.current.rawValue, period: period
    ) {
      genres = loaded
    }
    isLoading = false
  }
}

// MARK: - All Reviews Detail View

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
              .font(.system(size: 14, weight: .medium))
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
          isScrolled = value < -40
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
  let screenWidth = UIScreen.main.bounds.width
  let cardContentWidth = (screenWidth - 60) / 2 - 32
  let posterWidth = cardContentWidth * 0.7
  let posterHeight = posterWidth * 1.5

  CachedAsyncImage(url: url) { image in
    image
      .resizable()
      .aspectRatio(contentMode: .fill)
  } placeholder: {
    RoundedRectangle(cornerRadius: cr)
      .fill(Color.appBorderAdaptive.opacity(0.3))
  }
  .frame(width: posterWidth, height: posterHeight)
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
  let genrePosterImage: UIImage?
  let reviewPosterImage: UIImage?

  private let cardWidth: CGFloat = 1080 / 3
  private let cardHeight: CGFloat = 1920 / 3

  private let accentBlue = Color(hex: "3B82F6")
  private let accentGreen = Color(hex: "10B981")

  var body: some View {
    ZStack {
      LinearGradient(
        stops: [
          .init(color: Color(hex: "000000"), location: 0),
          .init(color: Color(hex: "050505"), location: 0.4),
          .init(color: Color(hex: "0C0C0C"), location: 0.7),
          .init(color: Color(hex: "111111"), location: 1),
        ],
        startPoint: .top,
        endPoint: .bottom
      )

      VStack(spacing: 0) {
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

        // Posters
        HStack(alignment: .top, spacing: 12) {
          if let genreName = section.topGenreName {
            VStack(alignment: .leading, spacing: 8) {
              shareCardPoster(image: genrePosterImage)
              Text(strings.favoriteGenre.uppercased())
                .font(.system(size: 9, weight: .bold))
                .tracking(1)
                .foregroundColor(.white.opacity(0.35))
              Text(genreName)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
          }

          if let reviewTitle = section.topReviewTitle {
            VStack(alignment: .leading, spacing: 8) {
              shareCardPoster(image: reviewPosterImage, rating: section.topReviewRating)
              Text(strings.bestReview.uppercased())
                .font(.system(size: 9, weight: .bold))
                .tracking(1)
                .foregroundColor(.white.opacity(0.35))
              Text(reviewTitle)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
          }
        }
        .padding(.horizontal, 24)

        Spacer()

        // Footer with logo
        HStack {
          Image("PlotistLogo")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .frame(height: 22)
            .opacity(0.35)

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
  func shareCardPoster(image: UIImage?, rating: Double? = nil) -> some View {
    let cr: CGFloat = 12

    if let uiImage = image {
      Image(uiImage: uiImage)
        .resizable()
        .aspectRatio(2 / 3, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: cr))
        .overlay(alignment: .bottomTrailing) {
          ratingBadge(rating: rating, cornerRadius: cr)
        }
    } else {
      RoundedRectangle(cornerRadius: cr)
        .fill(Color.white.opacity(0.06))
        .aspectRatio(2 / 3, contentMode: .fit)
    }
  }

  @ViewBuilder
  func ratingBadge(rating: Double?, cornerRadius cr: CGFloat) -> some View {
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
      .background(Color.black.opacity(0.6))
      .clipShape(RoundedRectangle(cornerRadius: cr * 0.5))
      .padding(6)
    }
  }
}
