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

// MARK: - Stats Mode

enum StatsMode: String, CaseIterable {
  case timeline
  case allTime

  var displayName: (Strings) -> String {
    switch self {
    case .timeline: return { $0.timeline }
    case .allTime: return { $0.allTime }
    }
  }
}

// MARK: - ProfileStatsView

struct ProfileStatsView: View {
  let userId: String
  let isPro: Bool
  let isOwnProfile: Bool

  @State var strings = L10n.current
  @State var mode: StatsMode = .timeline

  // Timeline state
  @State var monthSections: [MonthSection] = []
  @State var isLoadingMore = false
  @State var nextCursor: String? = nil
  @State var hasMore = true
  @State private var timelineLoadId = UUID()

  // All-time state
  @State var allTimeSection = MonthSection(yearMonth: "all")
  @State var hasStartedLoading = false

  let cache = ProfileStatsCache.shared

  init(userId: String, isPro: Bool = false, isOwnProfile: Bool = true) {
    self.userId = userId
    self.isPro = isPro
    self.isOwnProfile = isOwnProfile
  }

  var body: some View {
    VStack(spacing: 0) {
      modeSelector
        .padding(.horizontal, 24)
        .padding(.top, 8)
        .padding(.bottom, 8)

      if mode == .timeline {
        timelineBody
      } else {
        allTimeBody
      }
    }
    .task {
      if mode == .timeline {
        await loadTimeline()
      } else {
        await loadAllTime()
      }
    }
    .onChange(of: mode) { _, newMode in
      Task {
        if newMode == .timeline {
          if monthSections.isEmpty {
            await loadTimeline()
          }
        } else {
          if !allTimeSection.isLoaded {
            await loadAllTime()
          }
        }
      }
    }
    .onAppear {
      AnalyticsService.shared.track(.statsView)
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  // MARK: - Mode Selector

  var modeSelector: some View {
    Picker("", selection: $mode) {
      ForEach(StatsMode.allCases, id: \.self) { m in
        Text(m.displayName(strings))
          .tag(m)
      }
    }
    .pickerStyle(.segmented)
  }

  // MARK: - Timeline Body

  var timelineBody: some View {
    ScrollView {
      LazyVStack(spacing: 0, pinnedViews: [.sectionHeaders]) {
        ForEach(monthSections) { section in
          Section {
            MonthSectionContentView(
              section: section,
              userId: userId,
              strings: strings,
              period: section.yearMonth
            )
            .equatable()
            .padding(.horizontal, 24)
            .padding(.bottom, 48)
          } header: {
            MonthSectionHeaderView(
              section: section,
              isOwnProfile: isOwnProfile,
              onShare: { shareMonthStats(section) }
            )
            .equatable()
          }
        }

        if hasMore {
          ProgressView()
            .frame(maxWidth: .infinity)
            .padding(.vertical, 48)
            .task { await loadTimeline() }
            .id("load-more-\(monthSections.count)")
        }
      }
      .padding(.top, 8)
    }
    .coordinateSpace(name: "statsTimeline")
    .refreshable {
      monthSections = []
      nextCursor = nil
      hasMore = true
      isLoadingMore = false
      timelineLoadId = UUID()
      await loadTimeline()
    }
  }

  // MARK: - All-Time Body

  var allTimeBody: some View {
    ScrollView {
      VStack(spacing: 16) {
        if allTimeSection.isLoaded && !allTimeSection.hasMinimumData {
          emptyStateView(isAllTime: true)
        } else {
          allTimeSectionContent
        }
      }
      .padding(.horizontal, 24)
      .padding(.top, 16)
      .padding(.bottom, 24)
    }
    .refreshable {
      cache.invalidate(userId: userId, period: "all")
      allTimeSection = MonthSection(yearMonth: "all")
      await loadAllTime()
    }
  }

  private var allTimeDateRange: String? {
    guard let first = allTimeSection.monthlyHours.first?.month else { return nil }
    let fmt = DateFormatter()
    fmt.dateFormat = "yyyy-MM"
    let locale = Locale(identifier: Language.current.rawValue.replacingOccurrences(of: "-", with: "_"))
    fmt.locale = locale
    guard let startDate = fmt.date(from: first) else { return nil }
    let display = DateFormatter()
    display.dateFormat = "MMM yyyy"
    display.locale = locale
    let start = display.string(from: startDate)
    let end = display.string(from: Date())
    return "\(start.prefix(1).uppercased())\(start.dropFirst()) – \(end.prefix(1).uppercased())\(end.dropFirst())"
  }

  @ViewBuilder
  var allTimeSectionContent: some View {
    if allTimeSection.isLoaded {
      HStack {
        if let range = allTimeDateRange {
          Text(range)
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
        }

        Spacer()

        if isOwnProfile {
          Button { shareMonthStats(allTimeSection) } label: {
            Image(systemName: "square.and.arrow.up")
              .font(.system(size: 16, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
      }

      MonthSectionContentView(
        section: allTimeSection,
        userId: userId,
        strings: strings,
        period: "all"
      )
      .equatable()
      .transition(.opacity.animation(.easeIn(duration: 0.25)))
    } else if hasStartedLoading {
      ProgressView()
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }
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

  // MARK: - Load Timeline (Paginated)

  @MainActor
  func loadTimeline() async {
    guard !isLoadingMore, hasMore else { return }
    let currentLoadId = timelineLoadId
    isLoadingMore = true
    defer { isLoadingMore = false }

    do {
      let language = Language.current.rawValue

      let response = try await UserStatsService.shared.getStatsTimeline(
        userId: userId,
        language: language,
        cursor: nextCursor,
        pageSize: 3
      )

      guard currentLoadId == timelineLoadId else { return }

      var newSections: [MonthSection] = response.sections.map { section in
        MonthSection(
          yearMonth: section.yearMonth,
          totalHours: section.totalHours,
          movieHours: section.movieHours,
          seriesHours: section.seriesHours,
          topGenre: section.topGenre,
          topReview: section.topReview,
          isLoaded: true
        )
      }

      for i in 0..<newSections.count {
        guard i + 1 < newSections.count else { continue }
        let next = newSections[i + 1]
        if MonthSection.previousYearMonth(from: newSections[i].yearMonth) == next.yearMonth {
          newSections[i].comparisonHours = next.totalHours
        }
      }

      if !monthSections.isEmpty, let firstNew = newSections.first {
        let lastIdx = monthSections.count - 1
        if MonthSection.previousYearMonth(from: monthSections[lastIdx].yearMonth) == firstNew.yearMonth,
           monthSections[lastIdx].comparisonHours != firstNew.totalHours {
          monthSections[lastIdx].comparisonHours = firstNew.totalHours
        }
      }

      monthSections.append(contentsOf: newSections)

      nextCursor = response.nextCursor
      hasMore = response.hasMore
    } catch {
      print("[Stats] Timeline error: \(error)")
    }
  }

  // MARK: - Load All-Time

  @MainActor
  func loadAllTime() async {
    hasStartedLoading = true

    if let cached = cache.get(userId: userId, period: "all") {
      allTimeSection = MonthSection(
        yearMonth: "all",
        totalHours: cached.totalHours,
        movieHours: cached.movieHours,
        seriesHours: cached.seriesHours,
        monthlyHours: cached.monthlyHours,
        watchedGenres: cached.watchedGenres,
        bestReviews: cached.bestReviews,
        isLoaded: true
      )
      return
    }

    let language = Language.current.rawValue

    async let hoursResult = try? UserStatsService.shared.getTotalHours(userId: userId, period: "all")
    async let genresResult = try? UserStatsService.shared.getWatchedGenres(userId: userId, language: language, period: "all")
    async let reviewsResult = try? UserStatsService.shared.getBestReviews(userId: userId, language: language, period: "all")

    let (hours, genres, reviews) = await (hoursResult, genresResult, reviewsResult)

    withAnimation(.easeIn(duration: 0.25)) {
      if let hours {
        allTimeSection.totalHours = hours.totalHours
        allTimeSection.movieHours = hours.movieHours
        allTimeSection.seriesHours = hours.seriesHours
        allTimeSection.monthlyHours = hours.monthlyHours
        allTimeSection.peakTimeSlot = hours.peakTimeSlot
        allTimeSection.hourlyDistribution = hours.hourlyDistribution ?? []
        allTimeSection.dailyActivity = hours.dailyActivity ?? []
        allTimeSection.percentileRank = hours.percentileRank
      }
      if let genres {
        allTimeSection.watchedGenres = genres
      }
      if let reviews {
        allTimeSection.bestReviews = reviews
      }
      allTimeSection.isLoaded = true
    }

    cache.set(
      userId: userId,
      period: "all",
      totalHours: allTimeSection.totalHours,
      movieHours: allTimeSection.movieHours,
      seriesHours: allTimeSection.seriesHours,
      monthlyHours: allTimeSection.monthlyHours,
      watchedGenres: allTimeSection.watchedGenres,
      bestReviews: allTimeSection.bestReviews
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
