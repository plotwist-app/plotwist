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
        .padding(.bottom, 20)

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
  let comparisonHours: Double?
  @State var peakTimeSlot: PeakTimeSlot?
  @State var hourlyDistribution: [HourlyEntry]
  @State var dailyActivity: [DailyActivityEntry]
  let percentileRank: Int?
  let periodLabel: String
  let strings: Strings
  var userId: String? = nil
  var period: String? = nil

  @State private var isScrolled = false

  init(totalHours: Double, movieHours: Double, seriesHours: Double, monthlyHours: [MonthlyHoursEntry],
       comparisonHours: Double? = nil,
       peakTimeSlot: PeakTimeSlot? = nil,
       hourlyDistribution: [HourlyEntry] = [],
       dailyActivity: [DailyActivityEntry] = [],
       percentileRank: Int? = nil,
       periodLabel: String, strings: Strings,
       userId: String? = nil, period: String? = nil) {
    self.totalHours = totalHours
    self.movieHours = movieHours
    self.seriesHours = seriesHours
    _monthlyHours = State(initialValue: monthlyHours)
    self.comparisonHours = comparisonHours
    _peakTimeSlot = State(initialValue: peakTimeSlot)
    _hourlyDistribution = State(initialValue: hourlyDistribution)
    _dailyActivity = State(initialValue: dailyActivity)
    self.percentileRank = percentileRank
    self.periodLabel = periodLabel
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

          VStack(alignment: .leading, spacing: 8) {
            Text(periodLabel)
              .font(.system(size: 13, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)

            Text(String(format: strings.youSpentWatching, formatTotalHours(totalHours)))
              .font(.system(size: 28, weight: .bold))
              .foregroundColor(.appForegroundAdaptive)

            if period == "all", let pct = percentileRank, pct > 0 {
              HStack(spacing: 6) {
                Image(systemName: "flame.fill")
                  .font(.system(size: 12))
                Text(String(format: strings.topPercentile, pct))
                  .font(.system(size: 14, weight: .medium))
              }
              .foregroundColor(Color(hex: "F59E0B"))
            } else {
              comparisonLine
            }
          }

          if movieHours > 0 || seriesHours > 0 {
            Divider()

            VStack(alignment: .leading, spacing: 12) {
              Text(strings.distribution)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.appMutedForegroundAdaptive)

              movieSeriesSplitBar
            }
          }

          if !dailyActivity.isEmpty {
            Divider()
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)

        if !dailyActivity.isEmpty {
          activityHeatmap
            .padding(.horizontal, 24)
            .padding(.top, 8)
        }

        if !hourlyDistribution.isEmpty {
          VStack(alignment: .leading, spacing: 24) {
            Divider()
            hourlyDistributionChart
          }
          .padding(.horizontal, 24)
          .padding(.top, 16)
        }

        Spacer().frame(height: 24)
      }
      .coordinateSpace(name: "scroll")
      .onPreferenceChange(ScrollOffsetPreferenceKey.self) { value in
        isScrolled = value < -40
      }
    }
    .background(Color.appBackgroundAdaptive.ignoresSafeArea())
    .navigationBarHidden(true)
    .task(id: "\(period ?? "")-\(dailyActivity.count)-\(hourlyDistribution.count)") {
      await loadDetailDataIfNeeded()
    }
  }

  private func loadDetailDataIfNeeded() async {
    guard let userId, let period, period != "all" else { return }
    let needsFetch = dailyActivity.isEmpty || hourlyDistribution.isEmpty || peakTimeSlot == nil
    guard needsFetch else { return }
    if let result = try? await UserStatsService.shared.getTotalHours(userId: userId, period: period) {
      if monthlyHours.isEmpty { monthlyHours = result.monthlyHours }
      if dailyActivity.isEmpty { dailyActivity = result.dailyActivity ?? [] }
      if hourlyDistribution.isEmpty { hourlyDistribution = result.hourlyDistribution ?? [] }
      if peakTimeSlot == nil { peakTimeSlot = result.peakTimeSlot }
    }
  }

  // MARK: - Comparison Line

  @ViewBuilder
  var comparisonLine: some View {
    if let comparison = comparisonHours, comparison > 0 {
      let delta = totalHours - comparison
      let pctChange = abs(delta) / comparison * 100
      let isUp = delta >= 0
      let sign = isUp ? "+" : "-"
      let color: Color = isUp ? Color(hex: "10B981") : Color(hex: "EF4444")

      HStack(spacing: 6) {
        Image(systemName: isUp ? "arrow.up.right" : "arrow.down.right")
          .font(.system(size: 11, weight: .bold))

        Text("\(sign)\(formatHoursMinutes(abs(delta))) vs \(strings.vsLastMonthShort.replacingOccurrences(of: "vs ", with: "")) (\(String(format: "%.0f%%", pctChange)))")
          .font(.system(size: 14, weight: .medium))
      }
      .foregroundColor(color)
    }
  }

  private static func previousMonthName(period: String?) -> String {
    guard let period else { return "" }
    let lang = Language.current.rawValue
    let locale = Locale(identifier: lang.replacingOccurrences(of: "-", with: "_"))
    let fmt = DateFormatter()
    fmt.dateFormat = "yyyy-MM"
    fmt.locale = locale
    guard let date = fmt.date(from: period),
          let prev = Calendar.current.date(byAdding: .month, value: -1, to: date) else {
      return ""
    }
    let display = DateFormatter()
    display.dateFormat = "MMMM"
    display.locale = locale
    let monthName = display.string(from: prev)
    return monthName.prefix(1).uppercased() + monthName.dropFirst()
  }

  // MARK: - Peak Time

  // MARK: - Hourly Distribution Chart

  var hourlyDistributionChart: some View {
    let maxCount = max(hourlyDistribution.map(\.count).max() ?? 1, 1)
    let peakHourEntry = hourlyDistribution.max(by: { $0.count < $1.count })
    let peakDayName = Self.peakDayOfWeek(from: dailyActivity)

    return VStack(alignment: .leading, spacing: 16) {
      Text(strings.peakTime)
        .font(.system(size: 13, weight: .medium))
        .foregroundColor(.appMutedForegroundAdaptive)

      if let peak = peakHourEntry, peak.count > 0 {
        peakWithBars(peak: peak, peakDay: peakDayName, maxCount: maxCount)
      }
    }
  }

  @ViewBuilder
  private func peakWithBars(peak: HourlyEntry, peakDay: String?, maxCount: Int) -> some View {
    let slotLabel = Self.slotLabel(for: peak.hour, strings: strings)
    let hourLabel = String(format: "%02d:00", peak.hour)
    let barHeight: CGFloat = 60

    VStack(alignment: .leading, spacing: 14) {
      VStack(alignment: .leading, spacing: 2) {
        if let day = peakDay {
          Text("\(day) à \(slotLabel.lowercased())")
            .font(.system(size: 22, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
        } else {
          Text(slotLabel)
            .font(.system(size: 22, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
        }

        Text(hourLabel)
          .font(.system(size: 14, weight: .medium, design: .rounded))
          .foregroundColor(.appMutedForegroundAdaptive)
      }

      VStack(spacing: 4) {
        ZStack(alignment: .bottom) {
          VStack(spacing: 0) {
            ForEach(0..<3, id: \.self) { _ in
              Divider().opacity(0.2)
              Spacer()
            }
            Divider().opacity(0.2)
          }
          .frame(height: barHeight)

          HStack(alignment: .bottom, spacing: 3) {
            ForEach(hourlyDistribution.sorted(by: { $0.hour < $1.hour }), id: \.hour) { entry in
              let ratio = CGFloat(entry.count) / CGFloat(maxCount)
              let isPeak = entry.hour == peak.hour

              RoundedRectangle(cornerRadius: 3)
                .fill(isPeak
                      ? Self.heatmapHigh
                      : ratio > 0 ? Self.heatmapColor(hours: ratio, max: 1.0) : Self.heatmapEmpty)
                .frame(maxWidth: .infinity, minHeight: 2)
                .frame(height: max(barHeight * ratio, 2))
            }
          }
        }
        .frame(height: barHeight)

        HStack {
          Text("0h")
          Spacer()
          Text("6h")
          Spacer()
          Text("12h")
          Spacer()
          Text("18h")
          Spacer()
          Text("23h")
        }
        .font(.system(size: 9, weight: .medium, design: .rounded))
        .foregroundColor(.appMutedForegroundAdaptive)
      }
    }
    .padding(16)
    .background(Color.appForegroundAdaptive.opacity(0.04))
    .clipShape(RoundedRectangle(cornerRadius: 16))
  }

  private static func peakDayOfWeek(from activity: [DailyActivityEntry]) -> String? {
    guard !activity.isEmpty else { return nil }

    var dayCounts = [Int: Double]()
    let fmt = DateFormatter()
    fmt.dateFormat = "yyyy-MM-dd"

    for entry in activity {
      guard let date = fmt.date(from: entry.day) else { continue }
      let weekday = Calendar.current.component(.weekday, from: date)
      dayCounts[weekday, default: 0] += entry.hours
    }

    guard let peakWeekday = dayCounts.max(by: { $0.value < $1.value })?.key else { return nil }

    let lang = Language.current.rawValue
    let locale = Locale(identifier: lang.replacingOccurrences(of: "-", with: "_"))
    let symbols = DateFormatter()
    symbols.locale = locale
    guard let weekdaySymbols = symbols.standaloneWeekdaySymbols else { return nil }
    let name = weekdaySymbols[peakWeekday - 1]
    return name.prefix(1).uppercased() + name.dropFirst()
  }

  private static func slotLabel(for hour: Int, strings: Strings) -> String {
    switch hour {
    case 6...11: return strings.peakTimeMorning
    case 12...17: return strings.peakTimeAfternoon
    case 18...23: return strings.peakTimeEvening
    default: return strings.peakTimeNight
    }
  }

  private static func slotIcon(for hour: Int) -> String {
    switch hour {
    case 6...11: return "sunrise.fill"
    case 12...17: return "sun.max.fill"
    case 18...23: return "sunset.fill"
    default: return "moon.stars.fill"
    }
  }

  // MARK: - Movie/Series Split Bar

  private static let movieColor = Color(hex: "60A5FA")
  private static let seriesColor = Color(hex: "A78BFA")

  var movieSeriesSplitBar: some View {
    let moviePct = totalHours > 0 ? movieHours / totalHours : 0
    let seriesPct = totalHours > 0 ? seriesHours / totalHours : 0

    return VStack(spacing: 16) {
      GeometryReader { geo in
        HStack(spacing: 2) {
          if moviePct > 0 {
            RoundedRectangle(cornerRadius: 4)
              .fill(Self.movieColor)
              .frame(width: geo.size.width * moviePct)
          }
          if seriesPct > 0 {
            RoundedRectangle(cornerRadius: 4)
              .fill(Self.seriesColor)
              .frame(width: geo.size.width * seriesPct)
          }
        }
      }
      .frame(height: 8)

      HStack(spacing: 0) {
        HStack(spacing: 6) {
          Circle()
            .fill(Self.movieColor)
            .frame(width: 8, height: 8)
          VStack(alignment: .leading, spacing: 1) {
            Text(strings.movies)
              .font(.system(size: 13, weight: .semibold))
              .foregroundColor(.appForegroundAdaptive)
            Text("\(formatHoursMinutes(movieHours)) · \(String(format: "%.0f%%", moviePct * 100))")
              .font(.system(size: 12))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }

        Spacer()

        HStack(spacing: 6) {
          Circle()
            .fill(Self.seriesColor)
            .frame(width: 8, height: 8)
          VStack(alignment: .leading, spacing: 1) {
            Text(strings.series)
              .font(.system(size: 13, weight: .semibold))
              .foregroundColor(.appForegroundAdaptive)
            Text("\(formatHoursMinutes(seriesHours)) · \(String(format: "%.0f%%", seriesPct * 100))")
              .font(.system(size: 12))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
      }
    }
  }

  // MARK: - Activity Heatmap (GitHub-style)

  private static let cellSize: CGFloat = 13
  private static let cellSpacing: CGFloat = 3

  private var isSingleMonthPeriod: Bool {
    guard let period else { return false }
    let pattern = /^\d{4}-\d{2}$/
    return period.wholeMatch(of: pattern) != nil
  }

  var activityHeatmap: some View {
    let maxHours = max(dailyActivity.map(\.hours).max() ?? 1, 1)
    let weeks = Self.buildWeekColumns(from: dailyActivity)
    let monthLabels = Self.extractMonthLabels(from: weeks)

    return VStack(alignment: .leading, spacing: 12) {
      Text(strings.activity)
        .font(.system(size: 13, weight: .medium))
        .foregroundColor(.appMutedForegroundAdaptive)

      if isSingleMonthPeriod {
        calendarHeatmap(weeks: weeks, maxHours: maxHours)
      } else {
        githubHeatmap(weeks: weeks, monthLabels: monthLabels, maxHours: maxHours)
          .padding(.horizontal, -24)
      }

      heatmapLegend
        .padding(.top, 4)
    }
  }

  // MARK: Calendar heatmap (single month)

  private func calendarHeatmap(weeks: [[HeatmapCell]], maxHours: Double) -> some View {
    let dayLabels = Self.weekdayLabels()
    let calSpacing: CGFloat = 6

    let columns = Array(repeating: GridItem(.flexible(), spacing: calSpacing), count: 7)

    return LazyVGrid(columns: columns, spacing: calSpacing) {
      ForEach(0..<7, id: \.self) { col in
        Text(dayLabels[col])
          .font(.system(size: 11, weight: .medium))
          .foregroundColor(.appMutedForegroundAdaptive)
          .frame(height: 16)
      }

      ForEach(Array(weeks.enumerated()), id: \.offset) { _, week in
        ForEach(week, id: \.id) { cell in
          if cell.isPadding {
            Color.clear
              .aspectRatio(1, contentMode: .fit)
          } else {
            RoundedRectangle(cornerRadius: 8)
              .fill(Self.heatmapColor(hours: cell.hours, max: maxHours))
              .aspectRatio(1, contentMode: .fit)
              .overlay(
                Text("\(cell.dayNumber)")
                  .font(.system(size: 13, weight: .medium, design: .rounded))
                  .foregroundColor(cell.hours > 0 ? .white : .appMutedForegroundAdaptive)
              )
          }
        }
      }
    }
  }

  // MARK: GitHub-style heatmap (multi-month)

  private func githubHeatmap(weeks: [[HeatmapCell]], monthLabels: [MonthLabel], maxHours: Double) -> some View {
    let dayLabels = Self.weekdayLabels()

    return ScrollView(.horizontal, showsIndicators: false) {
      VStack(alignment: .leading, spacing: 2) {
        HStack(spacing: 0) {
          Spacer().frame(width: 28)
          ForEach(monthLabels, id: \.offset) { label in
            Text(label.name)
              .font(.system(size: 9, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
              .frame(width: CGFloat(label.span) * (Self.cellSize + Self.cellSpacing), alignment: .leading)
          }
        }

        HStack(alignment: .top, spacing: 0) {
          VStack(alignment: .trailing, spacing: 0) {
            ForEach(0..<7, id: \.self) { row in
              if row == 1 || row == 3 || row == 5 {
                Text(dayLabels[row])
                  .font(.system(size: 9, weight: .medium))
                  .foregroundColor(.appMutedForegroundAdaptive)
                  .frame(width: 24, height: Self.cellSize)
              } else {
                Color.clear
                  .frame(width: 24, height: Self.cellSize)
              }
              if row < 6 {
                Spacer().frame(height: Self.cellSpacing)
              }
            }
          }
          .padding(.trailing, 4)

          HStack(alignment: .top, spacing: Self.cellSpacing) {
            ForEach(Array(weeks.enumerated()), id: \.offset) { _, week in
              VStack(spacing: Self.cellSpacing) {
                ForEach(week, id: \.id) { cell in
                  RoundedRectangle(cornerRadius: 2)
                    .fill(Self.heatmapColor(hours: cell.hours, max: maxHours))
                    .frame(width: Self.cellSize, height: Self.cellSize)
                }
              }
            }
          }
        }
      }
      .padding(.horizontal, 24)
    }
  }

  private var heatmapLegend: some View {
    HStack(spacing: 4) {
      Text(strings.less)
        .font(.system(size: 10))
        .foregroundColor(.appMutedForegroundAdaptive)

      ForEach([0.0, 0.25, 0.5, 0.75, 1.0], id: \.self) { level in
        RoundedRectangle(cornerRadius: 2)
          .fill(level > 0
            ? Self.heatmapColor(hours: level, max: 1.0)
            : Self.heatmapEmpty)
          .frame(width: 12, height: 12)
      }

      Text(strings.more)
        .font(.system(size: 10))
        .foregroundColor(.appMutedForegroundAdaptive)
    }
  }

  private static let heatmapLow = Color(hex: "9BE9A8")
  private static let heatmapHigh = Color(hex: "216E39")
  private static let heatmapEmpty = Color.appForegroundAdaptive.opacity(0.06)

  private static func heatmapColor(hours: Double, max: Double) -> Color {
    if hours <= 0 { return heatmapEmpty }
    let t = Swift.max(hours / max, 0.15)
    return Color(
      red: lerp(0.608, 0.129, t),
      green: lerp(0.914, 0.431, t),
      blue: lerp(0.659, 0.224, t)
    )
  }

  private static func lerp(_ a: Double, _ b: Double, _ t: Double) -> Double {
    a + (b - a) * t
  }

  private struct HeatmapCell: Identifiable {
    let id: String
    let hours: Double
    let weekday: Int
    let month: Int
    let dayNumber: Int
    var isPadding: Bool { month == 0 }
  }

  private struct MonthLabel {
    let name: String
    let span: Int
    let offset: Int
  }

  private static func buildWeekColumns(from entries: [DailyActivityEntry]) -> [[HeatmapCell]] {
    guard !entries.isEmpty else { return [] }
    let cal = Calendar.current
    let fmt = DateFormatter()
    fmt.dateFormat = "yyyy-MM-dd"

    var weeks: [[HeatmapCell]] = []
    var currentWeek: [HeatmapCell] = []

    guard let firstDate = fmt.date(from: entries.first!.day) else { return [] }
    let firstWeekday = cal.component(.weekday, from: firstDate)
    // Pad the first week with empty cells (Sunday = 1)
    if firstWeekday > 1 {
      for wd in 1..<firstWeekday {
        currentWeek.append(HeatmapCell(id: "pad-\(wd)", hours: 0, weekday: wd, month: 0, dayNumber: 0))
      }
    }

    for entry in entries {
      guard let date = fmt.date(from: entry.day) else { continue }
      let weekday = cal.component(.weekday, from: date)
      let month = cal.component(.month, from: date)
      let day = cal.component(.day, from: date)

      if weekday == 1 && !currentWeek.isEmpty {
        weeks.append(currentWeek)
        currentWeek = []
      }

      currentWeek.append(HeatmapCell(id: entry.day, hours: entry.hours, weekday: weekday, month: month, dayNumber: day))
    }
    if !currentWeek.isEmpty {
      while currentWeek.count < 7 {
        let wd = currentWeek.count + 1
        currentWeek.append(HeatmapCell(id: "pad-end-\(wd)", hours: 0, weekday: wd, month: 0, dayNumber: 0))
      }
      weeks.append(currentWeek)
    }
    return weeks
  }

  private static func extractMonthLabels(from weeks: [[HeatmapCell]]) -> [MonthLabel] {
    guard !weeks.isEmpty else { return [] }
    let locale = Locale(identifier: Language.current.rawValue.replacingOccurrences(of: "-", with: "_"))
    let fmt = DateFormatter()
    fmt.locale = locale
    let monthNames = fmt.shortMonthSymbols ?? []

    var result: [MonthLabel] = []
    var prevMonth = 0

    for (i, week) in weeks.enumerated() {
      let realCells = week.filter { $0.month > 0 }
      guard let first = realCells.first else { continue }
      let month = first.month

      if month != prevMonth {
        result.append(MonthLabel(
          name: month <= monthNames.count ? monthNames[month - 1].lowercased() : "",
          span: 1,
          offset: i
        ))
        prevMonth = month
      } else if !result.isEmpty {
        let idx = result.count - 1
        result[idx] = MonthLabel(name: result[idx].name, span: result[idx].span + 1, offset: result[idx].offset)
      }
    }
    return result
  }

  private static func weekdayLabels() -> [String] {
    let locale = Locale(identifier: Language.current.rawValue.replacingOccurrences(of: "-", with: "_"))
    let fmt = DateFormatter()
    fmt.locale = locale
    let symbols = fmt.veryShortWeekdaySymbols ?? ["S", "M", "T", "W", "T", "F", "S"]
    return symbols
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
          VStack(alignment: .leading, spacing: 0) {
            GeometryReader { geo in
              Color.clear.preference(key: ScrollOffsetPreferenceKey.self, value: geo.frame(in: .named("scroll")).minY)
            }
            .frame(height: 0)

          Text(periodLabel)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)

          Text(strings.favoriteGenres)
              .font(.system(size: 34, weight: .bold))
              .foregroundColor(.appForegroundAdaptive)
              .padding(.bottom, 20)

            LazyVStack(spacing: 0) {
              ForEach(Array(genres.enumerated()), id: \.element.id) { index, genre in
                genreRow(genre: genre, rank: index + 1)

                if index < genres.count - 1 {
                  Divider()
                    .padding(.leading, 40)
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

  private func genreRow(genre: WatchedGenre, rank: Int) -> some View {
    HStack(spacing: 14) {
      Text("\(rank)")
        .font(.system(size: 15, weight: .bold, design: .rounded))
        .foregroundColor(.appMutedForegroundAdaptive)
        .frame(width: 22, alignment: .leading)

      VStack(alignment: .leading, spacing: 4) {
        Text(genre.name)
          .font(.system(size: rank <= 3 ? 17 : 15, weight: .bold))
          .foregroundColor(.appForegroundAdaptive)
          .lineLimit(1)

        Text(genre.percentage < 1
          ? String(format: "%.1f%%", genre.percentage)
          : String(format: "%.0f%%", genre.percentage))
          .font(.system(size: 14, weight: .semibold, design: .rounded))
          .foregroundColor(.appMutedForegroundAdaptive)
      }

      Spacer()

      PosterDeckView(items: genre.genreItems, urls: genre.posterURLs, rank: rank, genreName: genre.name, itemCount: genre.count, strings: strings)
    }
    .padding(.vertical, 12)
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

// MARK: - Poster Deck View

private struct PosterDeckView: View {
  let items: [GenreItem]
  let urls: [URL]
  let rank: Int
  let genreName: String
  let itemCount: Int
  let strings: Strings

  @State private var showSheet = false
  @State private var selectedItem: GenreItem?

  var body: some View {
    let posterWidth: CGFloat = rank == 1 ? 115 : rank == 2 ? 100 : rank == 3 ? 90 : 78
    let posterHeight = posterWidth * 1.5
    let cr: CGFloat = rank <= 2 ? 10 : 8
    let positions: [(x: CGFloat, rotation: Double)] = [
      (0, 0),
      (14, 5),
      (28, 10),
    ]
    let displayURLs = Array(urls.prefix(3))
    let count = displayURLs.count
    let deckWidth: CGFloat = posterWidth + (count > 1 ? positions[count - 1].x : 0)

    Group {
      if items.count == 1, let item = items.first {
        NavigationLink {
          MediaDetailView(mediaId: item.tmdbId, mediaType: item.mediaType)
        } label: {
          deckContent(
            urls: displayURLs,
            posterWidth: posterWidth,
            posterHeight: posterHeight,
            cr: cr,
            positions: positions,
            deckWidth: deckWidth
          )
        }
        .buttonStyle(.plain)
      } else {
        deckContent(
          urls: displayURLs,
          posterWidth: posterWidth,
          posterHeight: posterHeight,
          cr: cr,
          positions: positions,
          deckWidth: deckWidth
        )
        .contentShape(Rectangle())
        .onTapGesture {
          if items.count > 1 { showSheet = true }
        }
        .sheet(isPresented: $showSheet) {
          GenreItemsSheet(items: items, genreName: genreName, itemCount: itemCount, strings: strings) { item in
            showSheet = false
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
              selectedItem = item
            }
          }
          .presentationDetents([.medium, .large])
          .presentationBackground {
            Color.appSheetBackgroundAdaptive.ignoresSafeArea()
          }
          .presentationDragIndicator(.visible)
        }
        .navigationDestination(item: $selectedItem) { item in
          MediaDetailView(mediaId: item.tmdbId, mediaType: item.mediaType)
        }
      }
    }
  }

  private func deckContent(
    urls: [URL],
    posterWidth: CGFloat,
    posterHeight: CGFloat,
    cr: CGFloat,
    positions: [(x: CGFloat, rotation: Double)],
    deckWidth: CGFloat
  ) -> some View {
    ZStack(alignment: .leading) {
      ForEach(Array(urls.enumerated().reversed()), id: \.element) { index, url in
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
        .shadow(color: .black.opacity(0.15), radius: 3, x: 1, y: 1)
        .offset(x: positions[index].x)
        .rotationEffect(.degrees(positions[index].rotation), anchor: .bottom)
      }
    }
    .frame(width: deckWidth + 20, height: posterHeight + 10, alignment: .leading)
  }
}

// MARK: - Genre Items Sheet

private struct GenreItemsSheet: View {
  let items: [GenreItem]
  let genreName: String
  let itemCount: Int
  let strings: Strings
  let onSelectItem: (GenreItem) -> Void

  private let columns = [
    GridItem(.flexible(), spacing: 10),
    GridItem(.flexible(), spacing: 10),
    GridItem(.flexible(), spacing: 10),
  ]

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 16) {
        VStack(spacing: 4) {
          Text(genreName)
            .font(.system(size: 22, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)

          Text(String(format: strings.nTitles, itemCount))
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .frame(maxWidth: .infinity)

        LazyVGrid(columns: columns, spacing: 10) {
          ForEach(items) { item in
            Button {
              onSelectItem(item)
            } label: {
              Group {
                if let url = item.posterURL {
                  CachedAsyncImage(url: url) { image in
                    image
                      .resizable()
                      .aspectRatio(2/3, contentMode: .fill)
                  } placeholder: {
                    RoundedRectangle(cornerRadius: 10)
                      .fill(Color.appBorderAdaptive.opacity(0.3))
                      .aspectRatio(2/3, contentMode: .fill)
                  }
                } else {
                  RoundedRectangle(cornerRadius: 10)
                    .fill(Color.appBorderAdaptive.opacity(0.3))
                    .aspectRatio(2/3, contentMode: .fill)
                    .overlay {
                      Image(systemName: item.mediaType == "movie" ? "film" : "tv")
                        .font(.system(size: 20))
                        .foregroundColor(.appMutedForegroundAdaptive)
                    }
                }
              }
              .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 16)
      }
      .padding(.top, 20)
      .padding(.bottom, 16)
    }
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

  private let accentBlue = Color(hex: "60A5FA")
  private let accentPurple = Color(hex: "A78BFA")

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
              Text(formatTotalHours(section.totalHours))
                .font(.system(size: 52, weight: .heavy, design: .rounded))
                .foregroundColor(.white)

              Text(strings.hours)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.white.opacity(0.5))
            }

            if section.movieHours > 0 || section.seriesHours > 0 {
              HStack(spacing: 14) {
                HStack(spacing: 5) {
                  Circle().fill(accentBlue).frame(width: 6, height: 6)
                  Text("\(strings.movies) \(formatHoursMinutes(section.movieHours))")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.white.opacity(0.5))
                }
                HStack(spacing: 5) {
                  Circle().fill(accentPurple).frame(width: 6, height: 6)
                  Text("\(strings.series) \(formatHoursMinutes(section.seriesHours))")
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
