//
//  TimeWatchedDetailView.swift
//  Plotwist

import SwiftUI

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
        isScrolled = value < -10
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

  // MARK: - Activity Heatmap

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

  // MARK: - Heatmap Helpers

  static let heatmapLow = Color(hex: "9BE9A8")
  static let heatmapHigh = Color(hex: "216E39")
  static let heatmapEmpty = Color.appForegroundAdaptive.opacity(0.06)

  static func heatmapColor(hours: Double, max: Double) -> Color {
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

  struct HeatmapCell: Identifiable {
    let id: String
    let hours: Double
    let weekday: Int
    let month: Int
    let dayNumber: Int
    var isPadding: Bool { month == 0 }
  }

  struct MonthLabel {
    let name: String
    let span: Int
    let offset: Int
  }

  static func buildWeekColumns(from entries: [DailyActivityEntry]) -> [[HeatmapCell]] {
    guard !entries.isEmpty else { return [] }
    let cal = Calendar.current
    let fmt = DateFormatter()
    fmt.dateFormat = "yyyy-MM-dd"

    var weeks: [[HeatmapCell]] = []
    var currentWeek: [HeatmapCell] = []

    guard let firstDate = fmt.date(from: entries.first!.day) else { return [] }
    let firstWeekday = cal.component(.weekday, from: firstDate)
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

  static func extractMonthLabels(from weeks: [[HeatmapCell]]) -> [MonthLabel] {
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

  static func weekdayLabels() -> [String] {
    let locale = Locale(identifier: Language.current.rawValue.replacingOccurrences(of: "-", with: "_"))
    let fmt = DateFormatter()
    fmt.locale = locale
    let symbols = fmt.veryShortWeekdaySymbols ?? ["S", "M", "T", "W", "T", "F", "S"]
    return symbols
  }
}
