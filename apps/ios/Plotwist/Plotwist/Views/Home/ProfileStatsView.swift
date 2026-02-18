//
//  ProfileStatsView.swift
//  Plotwist
//

import SwiftUI

enum StatsPeriod: String, CaseIterable {
  case month
  case lastMonth = "last_month"
  case year
  case all

  var displayName: (Strings) -> String {
    switch self {
    case .month: return { $0.thisMonth }
    case .lastMonth: return { $0.lastMonth }
    case .year: return { $0.thisYear }
    case .all: return { $0.allTime }
    }
  }
}

struct ProfileStatsView: View {
  let userId: String
  let isPro: Bool
  let isOwnProfile: Bool

  @State var strings = L10n.current
  @State var selectedPeriod: StatsPeriod = .month

  @State var totalHours: Double = 0
  @State var movieHours: Double = 0
  @State var seriesHours: Double = 0
  @State var monthlyHours: [MonthlyHoursEntry] = []
  @State var watchedGenres: [WatchedGenre] = []
  @State var bestReviews: [BestReview] = []

  @State var comparisonHours: Double?

  @State var loadedHours = false
  @State var loadedGenres = false
  @State var loadedReviews = false
  @State var hasStartedLoading = false
  @State var error: String?

  @State var countStartTime: Date?
  @State var animationTrigger = false
  @State private var smartDefaultApplied = false

  let countDuration: Double = 1.8
  let cache = ProfileStatsCache.shared

  var hasMinimumData: Bool {
    totalHours > 0 || !watchedGenres.isEmpty
  }

  var allSectionsLoaded: Bool {
    loadedHours && loadedGenres && loadedReviews
  }

  var dailyAverage: Double {
    guard totalHours > 0 else { return 0 }
    switch selectedPeriod {
    case .month:
      let day = max(Calendar.current.component(.day, from: Date()), 1)
      return totalHours / Double(day)
    case .lastMonth:
      let lastMonth = Calendar.current.date(byAdding: .month, value: -1, to: Date()) ?? Date()
      let range = Calendar.current.range(of: .day, in: .month, for: lastMonth)
      return totalHours / Double(range?.count ?? 30)
    case .year:
      let dayOfYear = max(Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1, 1)
      return totalHours / Double(dayOfYear)
    case .all:
      if let firstMonth = monthlyHours.first?.month {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM"
        if let startDate = formatter.date(from: firstMonth) {
          let days = max(Calendar.current.dateComponents([.day], from: startDate, to: Date()).day ?? 30, 1)
          return totalHours / Double(days)
        }
      }
      return totalHours / 30
    }
  }

  var dailyAverageLabel: String {
    switch selectedPeriod {
    case .month, .lastMonth: return strings.perDayThisMonth
    case .year: return strings.perDayThisYear
    case .all: return strings.perDay
    }
  }

  init(userId: String, isPro: Bool = false, isOwnProfile: Bool = true) {
    self.userId = userId
    self.isPro = isPro
    self.isOwnProfile = isOwnProfile
  }

  var body: some View {
    ScrollView {
      VStack(spacing: 16) {
        periodSelector

        if allSectionsLoaded && !hasMinimumData {
          emptyStateView
        } else {
          // 1. Time Watched
          sectionWrapper(loaded: loadedHours) {
            timeWatchedCard
          }

          // 2. Top Genre | Top Review (side by side)
          highlightCards
        }
      }
      .padding(.horizontal, 24)
      .padding(.top, 16)
      .padding(.bottom, 24)
    }
    .refreshable {
      cache.invalidate(userId: userId, period: selectedPeriod.rawValue)
      await loadStats()
    }
    .task {
      await loadStats()
    }
    .onChange(of: selectedPeriod) { _, _ in
      resetAndReload()
    }
    .onAppear {
      AnalyticsService.shared.track(.statsView)
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  // MARK: - Highlight Cards (Side by Side)

  @ViewBuilder
  var highlightCards: some View {
    let bothLoaded = loadedGenres && loadedReviews
    let hasGenre = loadedGenres && !watchedGenres.isEmpty
    let hasReview = loadedReviews && !bestReviews.isEmpty
    let anyLoading = hasStartedLoading && !bothLoaded

    if anyLoading || hasGenre || hasReview {
      HStack(alignment: .top, spacing: 12) {
        Group {
          if hasGenre {
            topGenreCard
              .transition(.opacity.animation(.easeIn(duration: 0.25)))
          } else if !loadedGenres && hasStartedLoading {
            skeletonRect(height: 200)
          }
        }
        .frame(maxWidth: .infinity)

        Group {
          if hasReview {
            topReviewCard
              .transition(.opacity.animation(.easeIn(duration: 0.25)))
          } else if !loadedReviews && hasStartedLoading {
            skeletonRect(height: 200)
          }
        }
        .frame(maxWidth: .infinity)
      }
    }
  }

  // MARK: - Section Wrapper

  @ViewBuilder
  func sectionWrapper<Content: View>(
    loaded: Bool,
    hasData: Bool = true,
    @ViewBuilder content: () -> Content
  ) -> some View {
    if loaded {
      if hasData {
        content()
          .transition(.opacity.animation(.easeIn(duration: 0.25)))
      }
    } else if hasStartedLoading {
      skeletonRect(height: 80)
    }
  }

  func skeletonRect(height: CGFloat) -> some View {
    RoundedRectangle(cornerRadius: 22)
      .fill(Color.appBorderAdaptive.opacity(0.15))
      .frame(height: height)
      .modifier(ShimmerEffect())
  }

  // MARK: - Period Selector

  var periodSelector: some View {
    Picker("", selection: $selectedPeriod) {
      ForEach(StatsPeriod.allCases, id: \.self) { period in
        Text(period.displayName(strings))
          .tag(period)
      }
    }
    .pickerStyle(.segmented)
  }

  // MARK: - Empty State

  var emptyStateView: some View {
    VStack(spacing: 20) {
      Spacer().frame(height: 40)

      Image(systemName: "chart.bar.doc.horizontal")
        .font(.system(size: 48))
        .foregroundColor(.appMutedForegroundAdaptive)

      VStack(spacing: 8) {
        Text(strings.stats)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)

        Text(selectedPeriod == .all ? strings.startTrackingStats : strings.noActivityThisPeriod)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
          .multilineTextAlignment(.center)
          .padding(.horizontal, 32)
      }

      Spacer().frame(height: 40)
    }
    .frame(maxWidth: .infinity)
  }

  // MARK: - Reset & Reload

  func resetAndReload() {
    loadedHours = false
    loadedGenres = false
    loadedReviews = false
    countStartTime = nil
    comparisonHours = nil

    totalHours = 0
    movieHours = 0
    seriesHours = 0
    monthlyHours = []
    watchedGenres = []
    bestReviews = []

    Task { await loadStats() }
  }

  // MARK: - Load Stats

  func loadStats() async {
    let period = selectedPeriod.rawValue

    if let cached = cache.get(userId: userId, period: period) {
      totalHours = cached.totalHours
      movieHours = cached.movieHours
      seriesHours = cached.seriesHours
      monthlyHours = cached.monthlyHours
      watchedGenres = cached.watchedGenres
      bestReviews = cached.bestReviews
      loadedHours = true
      loadedGenres = true
      loadedReviews = true
      hasStartedLoading = true
      if totalHours > 0 {
        countStartTime = .now
        withAnimation(.linear(duration: countDuration)) {
          animationTrigger.toggle()
        }
      }
      return
    }

    hasStartedLoading = true
    error = nil
    let language = Language.current.rawValue

    await withTaskGroup(of: Void.self) { group in
      group.addTask { @MainActor in
        do {
          let response = try await UserStatsService.shared.getTotalHours(userId: userId, period: period)
          withAnimation(.easeIn(duration: 0.25)) {
            totalHours = response.totalHours
            movieHours = response.movieHours
            seriesHours = response.seriesHours
            monthlyHours = response.monthlyHours
            loadedHours = true
          }
          countStartTime = .now
          withAnimation(.linear(duration: countDuration)) {
            animationTrigger.toggle()
          }

          await loadComparisonHours(period: period)

          if !smartDefaultApplied {
            smartDefaultApplied = true
            applySmartDefault(currentTotalHours: response.totalHours)
          }
        } catch {
          withAnimation { loadedHours = true }
        }
      }

      group.addTask { @MainActor in
        do {
          let genres = try await UserStatsService.shared.getWatchedGenres(userId: userId, language: language, period: period)
          withAnimation(.easeIn(duration: 0.25)) {
            watchedGenres = genres
            loadedGenres = true
          }
        } catch {
          withAnimation { loadedGenres = true }
        }
      }

      group.addTask { @MainActor in
        do {
          let reviews = try await UserStatsService.shared.getBestReviews(userId: userId, language: language, period: period)
          withAnimation(.easeIn(duration: 0.25)) {
            bestReviews = reviews
            loadedReviews = true
          }
        } catch {
          withAnimation { loadedReviews = true }
        }
      }

    }

    cache.set(
      userId: userId,
      period: period,
      totalHours: totalHours,
      movieHours: movieHours,
      seriesHours: seriesHours,
      monthlyHours: monthlyHours,
      watchedGenres: watchedGenres,
      bestReviews: bestReviews
    )
  }

  // MARK: - Comparison Hours

  @MainActor
  func loadComparisonHours(period: String) async {
    let comparisonPeriod: String?
    switch period {
    case "month": comparisonPeriod = "last_month"
    default: comparisonPeriod = nil
    }

    guard let compPeriod = comparisonPeriod else {
      comparisonHours = nil
      return
    }

    do {
      let response = try await UserStatsService.shared.getTotalHours(userId: userId, period: compPeriod)
      comparisonHours = response.totalHours
    } catch {
      comparisonHours = nil
    }
  }

  // MARK: - Smart Default

  @MainActor
  func applySmartDefault(currentTotalHours: Double) {
    if selectedPeriod != .month { return }

    if currentTotalHours == 0 {
      Task {
        let allTimeResponse = try? await UserStatsService.shared.getTotalHours(userId: userId, period: "all")
        let allTimeHours = allTimeResponse?.totalHours ?? 0

        if allTimeHours == 0 {
          selectedPeriod = .all
        } else {
          let lastMonthResponse = try? await UserStatsService.shared.getTotalHours(userId: userId, period: "last_month")
          if (lastMonthResponse?.totalHours ?? 0) > 0 {
            selectedPeriod = .lastMonth
          } else {
            selectedPeriod = .all
          }
        }
      }
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
