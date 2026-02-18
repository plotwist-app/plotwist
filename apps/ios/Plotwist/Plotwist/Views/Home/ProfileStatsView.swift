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
  var comparisonHours: Double?
  var isLoaded: Bool = false

  var id: String { yearMonth }

  var displayName: String {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM"
    guard let date = formatter.date(from: yearMonth) else { return yearMonth }
    formatter.dateFormat = "MMMM yyyy"
    let result = formatter.string(from: date)
    return result.prefix(1).uppercased() + result.dropFirst()
  }

  var shortLabel: String {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM"
    guard let date = formatter.date(from: yearMonth) else { return yearMonth }
    formatter.dateFormat = "MMM"
    return formatter.string(from: date).prefix(3).uppercased()
  }

  var hasMinimumData: Bool {
    totalHours > 0 || !watchedGenres.isEmpty || !bestReviews.isEmpty
  }

  static func == (lhs: MonthSection, rhs: MonthSection) -> Bool {
    lhs.yearMonth == rhs.yearMonth
  }

  static func currentYearMonth() -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM"
    return formatter.string(from: Date())
  }

  static func previousYearMonth(from ym: String) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM"
    guard let date = formatter.date(from: ym),
          let prev = Calendar.current.date(byAdding: .month, value: -1, to: date) else {
      return ym
    }
    return formatter.string(from: prev)
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

// MARK: - Visible Section Preference

struct VisibleSectionPreferenceKey: PreferenceKey {
  static var defaultValue: String? = nil
  static func reduce(value: inout String?, nextValue: () -> String?) {
    value = value ?? nextValue()
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
  @State var visibleYearMonth: String?
  @State var isDraggingScrubber = false
  @State var scrubberDragMonth: String?

  // All-time state
  @State var allTimeSection = MonthSection(yearMonth: "all")

  @State var countStartTime: Date?
  @State var animationTrigger = false
  @State var hasStartedLoading = false
  @State var error: String?

  let countDuration: Double = 1.8
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
        await initTimeline()
      } else {
        await loadAllTime()
      }
    }
    .onChange(of: mode) { _, newMode in
      Task {
        if newMode == .timeline {
          if monthSections.isEmpty {
            await initTimeline()
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
    ScrollViewReader { proxy in
      ScrollView {
        LazyVStack(spacing: 0, pinnedViews: [.sectionHeaders]) {
          ForEach(Array(monthSections.enumerated()), id: \.element.id) { index, section in
            Section {
              monthContentView(section)
                .padding(.horizontal, 24)
                .padding(.bottom, 48)
            } header: {
              monthHeaderView(section)
            }
            .id(section.yearMonth)
            .onAppear {
              visibleYearMonth = section.yearMonth
              loadMoreIfNeeded(index: index)
            }
          }

          if isLoadingMore {
            VStack(spacing: 16) {
              skeletonRect(height: 120)
              HStack(spacing: 12) {
                skeletonRect(height: 200)
                skeletonRect(height: 200)
              }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 48)
          }
        }
        .padding(.top, 8)
      }
      .refreshable {
        for section in monthSections {
          cache.invalidate(userId: userId, period: section.yearMonth)
        }
        monthSections = []
        await initTimeline()
      }
      .overlay(alignment: .trailing) {
        if monthSections.count > 2 {
          monthScrubber(proxy: proxy)
        }
      }
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

  @ViewBuilder
  var allTimeSectionContent: some View {
    if allTimeSection.isLoaded {
      timeWatchedCard(for: allTimeSection, period: "all")
        .transition(.opacity.animation(.easeIn(duration: 0.25)))

      highlightCards(for: allTimeSection)
    } else if hasStartedLoading {
      skeletonRect(height: 120)
      HStack(spacing: 12) {
        skeletonRect(height: 200)
        skeletonRect(height: 200)
      }
    }
  }

  // MARK: - Month Content View

  @ViewBuilder
  func monthContentView(_ section: MonthSection) -> some View {
    if section.isLoaded && !section.hasMinimumData {
      emptyStateView(isAllTime: false)
    } else if section.isLoaded {
      VStack(spacing: 16) {
        timeWatchedCard(for: section, period: section.yearMonth)
          .transition(.opacity.animation(.easeIn(duration: 0.25)))

        highlightCards(for: section)
      }
    } else {
      VStack(spacing: 16) {
        skeletonRect(height: 120)
        HStack(spacing: 12) {
          skeletonRect(height: 200)
          skeletonRect(height: 200)
        }
      }
    }
  }

  // MARK: - Highlight Cards (Side by Side)

  @ViewBuilder
  func highlightCards(for section: MonthSection) -> some View {
    let hasGenre = !section.watchedGenres.isEmpty
    let hasReview = !section.bestReviews.isEmpty

    if hasGenre || hasReview {
      HStack(alignment: .top, spacing: 12) {
        if hasGenre {
          topGenreCard(for: section)
            .transition(.opacity.animation(.easeIn(duration: 0.25)))
        } else {
          Color.clear
        }

        if hasReview {
          topReviewCard(for: section)
            .transition(.opacity.animation(.easeIn(duration: 0.25)))
        } else {
          Color.clear
        }
      }
    }
  }

  // MARK: - Month Header

  func monthHeaderView(_ section: MonthSection) -> some View {
    HStack {
      Text(section.displayName)
        .font(.system(size: 20, weight: .bold))
        .foregroundColor(.appForegroundAdaptive)

      Spacer()

      Button {
        shareMonthStats(section)
      } label: {
        Image(systemName: "square.and.arrow.up")
          .font(.system(size: 14, weight: .medium))
          .foregroundColor(.appMutedForegroundAdaptive)
          .frame(width: 32, height: 32)
          .background(Color.appInputFilled)
          .clipShape(Circle())
      }
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 10)
    .background(Color.appBackgroundAdaptive)
  }

  // MARK: - Month Scrubber (floating handle)

  func monthScrubber(proxy: ScrollViewProxy) -> some View {
    let activeYM = scrubberDragMonth ?? visibleYearMonth ?? monthSections.first?.yearMonth ?? ""
    let activeIndex = monthSections.firstIndex(where: { $0.yearMonth == activeYM }) ?? 0

    return GeometryReader { geo in
      let trackHeight = geo.size.height
      let count = max(monthSections.count, 1)
      let segmentHeight = trackHeight / CGFloat(count)
      let handleY = CGFloat(activeIndex) * segmentHeight + segmentHeight / 2

      HStack(spacing: 0) {
        Spacer()

        ZStack(alignment: .topTrailing) {
          // Floating month label (appears while dragging)
          if isDraggingScrubber, let dragYM = scrubberDragMonth,
             let section = monthSections.first(where: { $0.yearMonth == dragYM }) {
            HStack(spacing: 6) {
              Text(section.displayName)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(Color.appForegroundAdaptive)
            .clipShape(Capsule())
            .offset(y: handleY - 18)
            .padding(.trailing, 48)
            .transition(.opacity.combined(with: .scale(scale: 0.8)))
            .animation(.easeOut(duration: 0.15), value: dragYM)
          }

          // Handle
          VStack(spacing: 1) {
            Image(systemName: "chevron.up")
              .font(.system(size: 8, weight: .bold))
            Image(systemName: "chevron.down")
              .font(.system(size: 8, weight: .bold))
          }
          .foregroundColor(isDraggingScrubber ? .white : .appMutedForegroundAdaptive)
          .frame(width: 28, height: 36)
          .background(isDraggingScrubber ? Color.appForegroundAdaptive : Color.statsCardBackground)
          .clipShape(Capsule())
          .shadow(color: Color.black.opacity(0.15), radius: 4, x: 0, y: 2)
          .offset(y: handleY - 18)
          .animation(.interactiveSpring(response: 0.25, dampingFraction: 0.8), value: activeIndex)
          .gesture(
            DragGesture(minimumDistance: 0)
              .onChanged { value in
                if !isDraggingScrubber {
                  isDraggingScrubber = true
                }
                let y = min(max(value.location.y + handleY - 18, 0), trackHeight)
                let idx = max(0, min(Int(y / segmentHeight), count - 1))
                let targetYM = monthSections[idx].yearMonth
                if scrubberDragMonth != targetYM {
                  scrubberDragMonth = targetYM
                  let generator = UIImpactFeedbackGenerator(style: .light)
                  generator.impactOccurred()
                  proxy.scrollTo(targetYM, anchor: .top)
                }
              }
              .onEnded { _ in
                withAnimation(.easeOut(duration: 0.25)) {
                  isDraggingScrubber = false
                }
                scrubberDragMonth = nil
              }
          )
        }
        .frame(width: 28)
      }
    }
    .padding(.vertical, 80)
    .padding(.trailing, 6)
    .allowsHitTesting(true)
  }

  // MARK: - Skeleton

  func skeletonRect(height: CGFloat) -> some View {
    RoundedRectangle(cornerRadius: 22)
      .fill(Color.appBorderAdaptive.opacity(0.15))
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
    guard section.isLoaded else { return }
    let image = renderShareCard(section: section)
    let activityVC = UIActivityViewController(activityItems: [image], applicationActivities: nil)
    if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
       let root = scene.windows.first?.rootViewController {
      root.present(activityVC, animated: true)
    }
  }

  @MainActor
  func renderShareCard(section: MonthSection) -> UIImage {
    let cardView = StatsShareCardView(section: section, strings: strings)
    let controller = UIHostingController(rootView: cardView)
    let size = CGSize(width: 390, height: 520)
    controller.view.bounds = CGRect(origin: .zero, size: size)
    controller.view.backgroundColor = .clear
    controller.view.layoutIfNeeded()

    let renderer = UIGraphicsImageRenderer(size: size)
    return renderer.image { _ in
      controller.view.drawHierarchy(in: controller.view.bounds, afterScreenUpdates: true)
    }
  }

  // MARK: - Load More

  func loadMoreIfNeeded(index: Int) {
    guard !isLoadingMore else { return }
    let threshold = monthSections.count - 2
    if index >= threshold {
      isLoadingMore = true
      Task {
        guard let last = monthSections.last else { return }
        let prevYM = MonthSection.previousYearMonth(from: last.yearMonth)
        if !monthSections.contains(where: { $0.yearMonth == prevYM }) {
          let newSection = MonthSection(yearMonth: prevYM)
          monthSections.append(newSection)
          await loadMonthData(yearMonth: prevYM)
        }
        isLoadingMore = false
      }
    }
  }

  // MARK: - Init Timeline

  func initTimeline() async {
    hasStartedLoading = true
    let current = MonthSection.currentYearMonth()
    let prev = MonthSection.previousYearMonth(from: current)

    monthSections = [
      MonthSection(yearMonth: current),
      MonthSection(yearMonth: prev),
    ]

    await withTaskGroup(of: Void.self) { group in
      group.addTask { await loadMonthData(yearMonth: current) }
      group.addTask { await loadMonthData(yearMonth: prev) }
    }
  }

  // MARK: - Load Month Data

  @MainActor
  func loadMonthData(yearMonth: String) async {
    if let cached = cache.get(userId: userId, period: yearMonth) {
      updateSection(yearMonth: yearMonth, cached: cached)
      return
    }

    let language = Language.current.rawValue

    await withTaskGroup(of: Void.self) { group in
      group.addTask { @MainActor in
        do {
          let response = try await UserStatsService.shared.getTotalHours(userId: userId, period: yearMonth)
          if let idx = monthSections.firstIndex(where: { $0.yearMonth == yearMonth }) {
            withAnimation(.easeIn(duration: 0.25)) {
              monthSections[idx].totalHours = response.totalHours
              monthSections[idx].movieHours = response.movieHours
              monthSections[idx].seriesHours = response.seriesHours
              monthSections[idx].monthlyHours = response.monthlyHours
            }
          }

          let prevYM = MonthSection.previousYearMonth(from: yearMonth)
          if let prevResponse = try? await UserStatsService.shared.getTotalHours(userId: userId, period: prevYM) {
            if let idx = monthSections.firstIndex(where: { $0.yearMonth == yearMonth }) {
              monthSections[idx].comparisonHours = prevResponse.totalHours
            }
          }
        } catch {}
      }

      group.addTask { @MainActor in
        do {
          let genres = try await UserStatsService.shared.getWatchedGenres(userId: userId, language: language, period: yearMonth)
          if let idx = monthSections.firstIndex(where: { $0.yearMonth == yearMonth }) {
            withAnimation(.easeIn(duration: 0.25)) {
              monthSections[idx].watchedGenres = genres
            }
          }
        } catch {}
      }

      group.addTask { @MainActor in
        do {
          let reviews = try await UserStatsService.shared.getBestReviews(userId: userId, language: language, period: yearMonth)
          if let idx = monthSections.firstIndex(where: { $0.yearMonth == yearMonth }) {
            withAnimation(.easeIn(duration: 0.25)) {
              monthSections[idx].bestReviews = reviews
            }
          }
        } catch {}
      }
    }

    if let idx = monthSections.firstIndex(where: { $0.yearMonth == yearMonth }) {
      withAnimation(.easeIn(duration: 0.25)) {
        monthSections[idx].isLoaded = true
      }

      let s = monthSections[idx]
      cache.set(
        userId: userId,
        period: yearMonth,
        totalHours: s.totalHours,
        movieHours: s.movieHours,
        seriesHours: s.seriesHours,
        monthlyHours: s.monthlyHours,
        watchedGenres: s.watchedGenres,
        bestReviews: s.bestReviews
      )
    }
  }

  // MARK: - Load All-Time

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

    await withTaskGroup(of: Void.self) { group in
      group.addTask { @MainActor in
        do {
          let response = try await UserStatsService.shared.getTotalHours(userId: userId, period: "all")
          withAnimation(.easeIn(duration: 0.25)) {
            allTimeSection.totalHours = response.totalHours
            allTimeSection.movieHours = response.movieHours
            allTimeSection.seriesHours = response.seriesHours
            allTimeSection.monthlyHours = response.monthlyHours
          }
        } catch {}
      }

      group.addTask { @MainActor in
        do {
          let genres = try await UserStatsService.shared.getWatchedGenres(userId: userId, language: language, period: "all")
          withAnimation(.easeIn(duration: 0.25)) {
            allTimeSection.watchedGenres = genres
          }
        } catch {}
      }

      group.addTask { @MainActor in
        do {
          let reviews = try await UserStatsService.shared.getBestReviews(userId: userId, language: language, period: "all")
          withAnimation(.easeIn(duration: 0.25)) {
            allTimeSection.bestReviews = reviews
          }
        } catch {}
      }
    }

    withAnimation(.easeIn(duration: 0.25)) {
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

  // MARK: - Update Section from Cache

  @MainActor
  func updateSection(
    yearMonth: String,
    cached: (totalHours: Double, movieHours: Double, seriesHours: Double, monthlyHours: [MonthlyHoursEntry], watchedGenres: [WatchedGenre], bestReviews: [BestReview])
  ) {
    if let idx = monthSections.firstIndex(where: { $0.yearMonth == yearMonth }) {
      monthSections[idx].totalHours = cached.totalHours
      monthSections[idx].movieHours = cached.movieHours
      monthSections[idx].seriesHours = cached.seriesHours
      monthSections[idx].monthlyHours = cached.monthlyHours
      monthSections[idx].watchedGenres = cached.watchedGenres
      monthSections[idx].bestReviews = cached.bestReviews
      monthSections[idx].isLoaded = true
    }
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
