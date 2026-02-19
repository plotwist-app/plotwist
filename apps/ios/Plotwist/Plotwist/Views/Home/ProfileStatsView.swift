//
//  ProfileStatsView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Month Section Model

struct MonthSection: Identifiable, Equatable {
  let yearMonth: String
  var totalHours: Double = 0
  var movieHours: Double = 0
  var seriesHours: Double = 0
  var monthlyHours: [MonthlyHoursEntry] = []
  var watchedGenres: [WatchedGenre] = []
  var bestReviews: [BestReview] = []
  var topGenre: TimelineGenreSummary?
  var topReview: TimelineReviewSummary?
  var comparisonHours: Double?
  var peakTimeSlot: PeakTimeSlot?
  var hourlyDistribution: [HourlyEntry] = []
  var dailyActivity: [DailyActivityEntry] = []
  var percentileRank: Int?
  var isLoaded: Bool = false

  var id: String { yearMonth }

  // Resolved accessors: prefer summary fields, fall back to full arrays (all-time mode)
  var topGenreName: String? { topGenre?.name ?? watchedGenres.first?.name }
  var topGenrePosterURL: URL? { topGenre?.posterURL ?? watchedGenres.first?.posterURL }
  var hasGenreData: Bool { topGenre != nil || !watchedGenres.isEmpty }

  var topReviewTitle: String? { topReview?.title ?? bestReviews.first?.title }
  var topReviewPosterURL: URL? { topReview?.posterURL ?? bestReviews.first?.posterURL }
  var topReviewRating: Double? { topReview?.rating ?? bestReviews.first?.rating }
  var hasReviewData: Bool { topReview != nil || !bestReviews.isEmpty }

  private static let parseFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "yyyy-MM"
    return f
  }()

  private static var appLocale: Locale {
    let langId = Language.current.rawValue.replacingOccurrences(of: "-", with: "_")
    return Locale(identifier: langId)
  }

  private static let displayFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "MMMM yyyy"
    return f
  }()

  private static let shortFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "MMM"
    return f
  }()

  var displayName: String {
    let locale = Self.appLocale
    Self.parseFormatter.locale = locale
    guard let date = Self.parseFormatter.date(from: yearMonth) else { return yearMonth }
    Self.displayFormatter.locale = locale
    let result = Self.displayFormatter.string(from: date)
    return result.prefix(1).uppercased() + result.dropFirst()
  }

  var shortLabel: String {
    let locale = Self.appLocale
    Self.parseFormatter.locale = locale
    guard let date = Self.parseFormatter.date(from: yearMonth) else { return yearMonth }
    Self.shortFormatter.locale = locale
    return Self.shortFormatter.string(from: date).prefix(3).uppercased()
  }

  var hasMinimumData: Bool {
    totalHours > 0 || hasGenreData || hasReviewData
  }

  static func == (lhs: MonthSection, rhs: MonthSection) -> Bool {
    lhs.yearMonth == rhs.yearMonth &&
    lhs.isLoaded == rhs.isLoaded &&
    lhs.totalHours == rhs.totalHours &&
    lhs.topGenre?.name == rhs.topGenre?.name &&
    lhs.topReview?.title == rhs.topReview?.title &&
    lhs.watchedGenres.count == rhs.watchedGenres.count &&
    lhs.bestReviews.count == rhs.bestReviews.count &&
    lhs.comparisonHours == rhs.comparisonHours &&
    lhs.peakTimeSlot?.slot == rhs.peakTimeSlot?.slot &&
    lhs.hourlyDistribution.count == rhs.hourlyDistribution.count
  }

  static func currentYearMonth() -> String {
    parseFormatter.string(from: Date())
  }

  static func previousYearMonth(from ym: String) -> String {
    guard let date = parseFormatter.date(from: ym),
          let prev = Calendar.current.date(byAdding: .month, value: -1, to: date) else {
      return ym
    }
    return parseFormatter.string(from: prev)
  }
}

// MARK: - ProfileStatsView

struct ProfileStatsView: View {
  let userId: String
  let isPro: Bool
  let isOwnProfile: Bool

  @State var strings = L10n.current
  @State var selectedPeriod: String = MonthSection.currentYearMonth()
  @State private var availableMonths: [String] = []

  @State private var loadedSections: [String: MonthSection] = [:]
  @State private var loadingPeriods: Set<String> = []

  let cache = ProfileStatsCache.shared

  init(userId: String, isPro: Bool = false, isOwnProfile: Bool = true) {
    self.userId = userId
    self.isPro = isPro
    self.isOwnProfile = isOwnProfile
  }

  private var currentSection: MonthSection? {
    loadedSections[selectedPeriod]
  }

  private var isAllTime: Bool {
    selectedPeriod == "all"
  }

  var body: some View {
    VStack(spacing: 0) {
      periodHeader
        .padding(.horizontal, 24)
        .padding(.vertical, 12)

      ScrollView {
        VStack(spacing: 16) {
          if let section = currentSection {
            if section.isLoaded && !section.hasMinimumData {
              emptyStateView(isAllTime: isAllTime)
            } else if section.isLoaded {
              MonthSectionContentView(
                section: section,
                userId: userId,
                strings: strings,
                period: selectedPeriod
              )
              .equatable()
              .transition(.opacity.animation(.easeIn(duration: 0.25)))
            } else {
              ProgressView()
                .frame(maxWidth: .infinity)
                .padding(.vertical, 48)
            }
          } else if loadingPeriods.contains(selectedPeriod) {
            ProgressView()
              .frame(maxWidth: .infinity)
              .padding(.vertical, 48)
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 8)
        .padding(.bottom, 24)
      }
    }
    .task {
      buildAvailableMonths()
      await loadPeriod(selectedPeriod)
    }
    .onChange(of: selectedPeriod) { _, newPeriod in
      Task { await loadPeriod(newPeriod) }
    }
    .onAppear {
      AnalyticsService.shared.track(.statsView)
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
    .refreshable {
      cache.invalidate(userId: userId, period: selectedPeriod)
      loadedSections.removeValue(forKey: selectedPeriod)
      await loadPeriod(selectedPeriod)
    }
  }

  // MARK: - Period Header

  private var periodHeader: some View {
    HStack {
      Menu {
        Button {
          withAnimation(.easeInOut(duration: 0.2)) { selectedPeriod = "all" }
        } label: {
          HStack {
            Text(strings.allTime)
            if selectedPeriod == "all" { Image(systemName: "checkmark") }
          }
        }

        Divider()

        ForEach(availableMonths.filter { $0 != "all" }, id: \.self) { period in
          Button {
            withAnimation(.easeInOut(duration: 0.2)) { selectedPeriod = period }
          } label: {
            HStack {
              Text(periodDisplayLabel(for: period))
              if period == selectedPeriod { Image(systemName: "checkmark") }
            }
          }
        }
      } label: {
        HStack(spacing: 4) {
          Text(periodDisplayLabel(for: selectedPeriod))
            .font(.system(size: 15, weight: .semibold))
            .foregroundColor(.appForegroundAdaptive)

          Image(systemName: "chevron.down")
            .font(.system(size: 11, weight: .semibold))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }

      Spacer()

      if isOwnProfile, let section = currentSection, section.isLoaded {
        Button { shareMonthStats(section) } label: {
          Image(systemName: "square.and.arrow.up")
            .font(.system(size: 16, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
    }
  }

  // MARK: - Helpers

  private func periodDisplayLabel(for period: String) -> String {
    if period == "all" { return strings.allTime }
    let fmt = DateFormatter()
    fmt.dateFormat = "yyyy-MM"
    let locale = Locale(identifier: Language.current.rawValue.replacingOccurrences(of: "-", with: "_"))
    fmt.locale = locale
    guard let date = fmt.date(from: period) else { return period }
    let display = DateFormatter()
    display.dateFormat = "MMMM yyyy"
    display.locale = locale
    let result = display.string(from: date)
    return result.prefix(1).uppercased() + result.dropFirst()
  }

  private func buildAvailableMonths() {
    let fmt = DateFormatter()
    fmt.dateFormat = "yyyy-MM"
    var months: [String] = []
    let now = Date()
    for i in 0..<12 {
      if let date = Calendar.current.date(byAdding: .month, value: -i, to: now) {
        months.append(fmt.string(from: date))
      }
    }
    months.append("all")
    availableMonths = months
  }

  // MARK: - Skeleton

  func skeletonRect(height: CGFloat) -> some View {
    RoundedRectangle(cornerRadius: 22)
      .fill(Color.appBorderAdaptive.opacity(0.5))
      .frame(height: height)
      .modifier(ShimmerEffect())
  }

  // MARK: - Empty State

  func emptyStateView(isAllTime: Bool) -> some View {
    VStack(spacing: 20) {
      Spacer().frame(height: 40)

      Image(systemName: "chart.bar.doc.horizontal")
        .font(.system(size: 48))
        .foregroundColor(.appMutedForegroundAdaptive)

      VStack(spacing: 8) {
        Text(strings.stats)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)

        Text(isAllTime ? strings.startTrackingStats : strings.noActivityThisPeriod)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
          .multilineTextAlignment(.center)
          .padding(.horizontal, 32)
      }

      Spacer().frame(height: 40)
    }
    .frame(maxWidth: .infinity)
  }

  // MARK: - Share

  func shareMonthStats(_ section: MonthSection) {
    Task {
      let genreImage = await downloadImage(url: section.topGenrePosterURL)
      let reviewImage = await downloadImage(url: section.topReviewPosterURL)

      let cardImage = renderShareCard(
        section: section,
        genrePoster: genreImage,
        reviewPoster: reviewImage
      )

      let activityVC = UIActivityViewController(activityItems: [cardImage], applicationActivities: nil)
      if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
         let root = scene.windows.first?.rootViewController {
        root.present(activityVC, animated: true)
      }
    }
  }

  func downloadImage(url: URL?) async -> UIImage? {
    guard let url else { return nil }
    do {
      let (data, _) = try await URLSession.shared.data(from: url)
      return UIImage(data: data)
    } catch {
      return nil
    }
  }

  @MainActor
  func renderShareCard(section: MonthSection, genrePoster: UIImage?, reviewPoster: UIImage?) -> UIImage {
    let cardView = StatsShareCardView(
      section: section,
      strings: strings,
      genrePosterImage: genrePoster,
      reviewPosterImage: reviewPoster
    )
    let controller = UIHostingController(rootView: cardView)
    let size = CGSize(width: 1080 / 3, height: 1920 / 3)
    controller.view.bounds = CGRect(origin: .zero, size: size)
    controller.view.backgroundColor = .clear

    let window = UIWindow(frame: CGRect(origin: .zero, size: size))
    window.rootViewController = controller
    window.makeKeyAndVisible()
    controller.view.setNeedsLayout()
    controller.view.layoutIfNeeded()

    let scale: CGFloat = 3.0
    let renderer = UIGraphicsImageRenderer(
      size: size,
      format: {
        let f = UIGraphicsImageRendererFormat()
        f.scale = scale
        return f
      }()
    )
    let image = renderer.image { _ in
      controller.view.drawHierarchy(in: controller.view.bounds, afterScreenUpdates: true)
    }

    window.isHidden = true
    return image
  }

  // MARK: - Load Period Data

  @MainActor
  func loadPeriod(_ period: String) async {
    guard loadedSections[period] == nil, !loadingPeriods.contains(period) else { return }
    loadingPeriods.insert(period)
    defer { loadingPeriods.remove(period) }

    if let cached = cache.get(userId: userId, period: period) {
      var section = MonthSection(
        yearMonth: period,
        totalHours: cached.totalHours,
        movieHours: cached.movieHours,
        seriesHours: cached.seriesHours,
        monthlyHours: cached.monthlyHours,
        watchedGenres: cached.watchedGenres,
        bestReviews: cached.bestReviews,
        isLoaded: true
      )
      if period != "all" {
        let prev = MonthSection.previousYearMonth(from: period)
        let prevHours = try? await UserStatsService.shared.getTotalHours(userId: userId, period: prev)
        section.comparisonHours = prevHours?.totalHours
      }
      withAnimation(.easeIn(duration: 0.25)) {
        loadedSections[period] = section
      }
      return
    }

    let language = Language.current.rawValue

    async let hoursResult = try? UserStatsService.shared.getTotalHours(userId: userId, period: period)
    async let genresResult = try? UserStatsService.shared.getWatchedGenres(userId: userId, language: language, period: period)
    async let reviewsResult = try? UserStatsService.shared.getBestReviews(userId: userId, language: language, period: period)

    let (hours, genres, reviews) = await (hoursResult, genresResult, reviewsResult)

    var section = MonthSection(yearMonth: period)

    if let hours {
      section.totalHours = hours.totalHours
      section.movieHours = hours.movieHours
      section.seriesHours = hours.seriesHours
      section.monthlyHours = hours.monthlyHours
      section.peakTimeSlot = hours.peakTimeSlot
      section.hourlyDistribution = hours.hourlyDistribution ?? []
      section.dailyActivity = hours.dailyActivity ?? []
      section.percentileRank = hours.percentileRank
    }
    if let genres { section.watchedGenres = genres }
    if let reviews { section.bestReviews = reviews }
    section.isLoaded = true

    if period != "all" {
      let prev = MonthSection.previousYearMonth(from: period)
      let prevHours = try? await UserStatsService.shared.getTotalHours(userId: userId, period: prev)
      section.comparisonHours = prevHours?.totalHours
    }

    withAnimation(.easeIn(duration: 0.25)) {
      loadedSections[period] = section
    }

    cache.set(
      userId: userId,
      period: period,
      totalHours: section.totalHours,
      movieHours: section.movieHours,
      seriesHours: section.seriesHours,
      monthlyHours: section.monthlyHours,
      watchedGenres: section.watchedGenres,
      bestReviews: section.bestReviews
    )
  }
}

// MARK: - Share Sheet

struct ActivityViewController: UIViewControllerRepresentable {
  let activityItems: [Any]

  func makeUIViewController(context: Context) -> UIActivityViewController {
    UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
  }

  func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

#Preview {
  ProfileStatsView(userId: "preview-user-id")
}
