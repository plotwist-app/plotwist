//
//  ProfileStatsView.swift
//  Plotwist
//

import SwiftUI

struct ProfileStatsView: View {
  let userId: String
  @State var strings = L10n.current
  @State var totalHours: Double
  @State var movieHours: Double
  @State var seriesHours: Double
  @State var monthlyHours: [MonthlyHoursEntry]
  @State var watchedGenres: [WatchedGenre]
  @State var itemsStatus: [ItemStatusStat]
  @State var bestReviews: [BestReview]
  @State var watchedCast: [WatchedCastMember]
  @State var watchedCountries: [WatchedCountry]
  @State var mostWatchedSeries: [MostWatchedSeries]
  
  @State var loadedHours = false
  @State var loadedGenres = false
  @State var loadedStatus = false
  @State var loadedReviews = false
  @State var loadedCast = false
  @State var loadedCountries = false
  @State var loadedSeries = false
  @State var hasStartedLoading = false
  @State var error: String?
  
  @State var showAllGenres = false
  @State var showAllCountries = false
  @State var showAllReviews = false
  @State var countStartTime: Date?
  @State var animationTrigger = false
  
  let countDuration: Double = 1.8
  let cache = ProfileStatsCache.shared
  
  init(userId: String) {
    self.userId = userId
    let cache = ProfileStatsCache.shared
    if let cached = cache.get(userId: userId) {
      _totalHours = State(initialValue: cached.totalHours)
      _movieHours = State(initialValue: cached.movieHours)
      _seriesHours = State(initialValue: cached.seriesHours)
      _monthlyHours = State(initialValue: cached.monthlyHours)
      _watchedGenres = State(initialValue: cached.watchedGenres)
      _itemsStatus = State(initialValue: cached.itemsStatus)
      _bestReviews = State(initialValue: cached.bestReviews)
      _watchedCast = State(initialValue: cached.watchedCast)
      _watchedCountries = State(initialValue: cached.watchedCountries)
      _mostWatchedSeries = State(initialValue: cached.mostWatchedSeries)
      _loadedHours = State(initialValue: true)
      _loadedGenres = State(initialValue: true)
      _loadedStatus = State(initialValue: true)
      _loadedReviews = State(initialValue: true)
      _loadedCast = State(initialValue: true)
      _loadedCountries = State(initialValue: true)
      _loadedSeries = State(initialValue: true)
      _hasStartedLoading = State(initialValue: true)
    } else {
      _totalHours = State(initialValue: 0)
      _movieHours = State(initialValue: 0)
      _seriesHours = State(initialValue: 0)
      _monthlyHours = State(initialValue: [])
      _watchedGenres = State(initialValue: [])
      _itemsStatus = State(initialValue: [])
      _bestReviews = State(initialValue: [])
      _watchedCast = State(initialValue: [])
      _watchedCountries = State(initialValue: [])
      _mostWatchedSeries = State(initialValue: [])
    }
  }

  var body: some View {
    ScrollView {
      VStack(spacing: 24) {
        statsSection(loaded: loadedHours) {
          statsCard(label: strings.timeWatched) { heroStatsSection }
        } skeleton: {
          statsCard {
            VStack(spacing: 8) {
              RoundedRectangle(cornerRadius: 8)
                .fill(Color.appBorderAdaptive.opacity(0.5))
                .frame(width: 180, height: 48)
              RoundedRectangle(cornerRadius: 4)
                .fill(Color.appBorderAdaptive.opacity(0.5))
                .frame(width: 100, height: 14)
              RoundedRectangle(cornerRadius: 4)
                .fill(Color.appBorderAdaptive.opacity(0.5))
                .frame(maxWidth: .infinity)
                .frame(height: 100)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
          }
        }
        
        statsSection(loaded: loadedGenres, hasData: !watchedGenres.isEmpty) {
          statsCard(label: strings.favoriteGenres) { genresListSection }
        } skeleton: {
          sectionSkeleton(lines: 4)
        }
        
        statsSection(loaded: loadedStatus, hasData: !itemsStatus.isEmpty) {
          statsCard(label: strings.collectionStatus) { statusBarSection }
        } skeleton: {
          sectionSkeleton(lines: 3)
        }
        
        statsSection(loaded: loadedCast, hasData: !watchedCast.isEmpty) {
          statsCard(label: strings.mostWatchedCast) { watchedCastSection }
        } skeleton: {
          sectionSkeleton(lines: 4)
        }
        
        statsSection(loaded: loadedSeries, hasData: !mostWatchedSeries.isEmpty) {
          statsCard(label: strings.mostWatchedSeries) { mostWatchedSeriesSection }
        } skeleton: {
          sectionSkeleton(lines: 2)
        }
        
        statsSection(loaded: loadedCountries, hasData: !watchedCountries.isEmpty) {
          statsCard(label: strings.watchedCountries) { watchedCountriesSection }
        } skeleton: {
          sectionSkeleton(lines: 4)
        }
        
        statsSection(loaded: loadedReviews, hasData: !bestReviews.isEmpty) {
          statsCard(label: strings.bestReviews) { bestReviewsSection }
        } skeleton: {
          sectionSkeleton(lines: 3)
        }
      }
      .padding(.horizontal, 24)
      .padding(.top, 16)
      .padding(.bottom, 24)
    }
    .task {
      await loadStats()
    }
    .onAppear {
      AnalyticsService.shared.track(.statsView)
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }
  
  // MARK: - Section Wrapper
  @ViewBuilder
  func statsSection<Content: View, Skeleton: View>(
    loaded: Bool,
    hasData: Bool = true,
    @ViewBuilder content: () -> Content,
    @ViewBuilder skeleton: () -> Skeleton
  ) -> some View {
    if loaded {
      if hasData {
        content()
          .transition(.opacity.animation(.easeIn(duration: 0.25)))
      }
    } else if hasStartedLoading {
      skeleton()
        .modifier(ShimmerEffect())
    }
  }
  
  func sectionSkeleton(lines: Int) -> some View {
    statsCard {
      VStack(alignment: .leading, spacing: 14) {
        ForEach(0..<lines, id: \.self) { i in
          HStack(spacing: 10) {
            Circle()
              .fill(Color.appBorderAdaptive.opacity(0.5))
              .frame(width: 28, height: 28)
            VStack(alignment: .leading, spacing: 6) {
              RoundedRectangle(cornerRadius: 3)
                .fill(Color.appBorderAdaptive.opacity(0.5))
                .frame(width: CGFloat.random(in: 80...140), height: 10)
              RoundedRectangle(cornerRadius: 2)
                .fill(Color.appBorderAdaptive.opacity(0.3))
                .frame(maxWidth: .infinity)
                .frame(height: 4)
            }
          }
        }
      }
    }
  }
  
  // MARK: - Stats Card Container
  func statsCard<Content: View>(label: String? = nil, @ViewBuilder content: () -> Content) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      if let label {
        Text(label.uppercased())
          .font(.system(size: 11, weight: .medium))
          .tracking(1.5)
          .foregroundColor(.appMutedForegroundAdaptive)
          .padding(.horizontal, 16)
      }
      
      content()
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.appInputFilled.opacity(0.4))
        .clipShape(RoundedRectangle(cornerRadius: 22))
    }
  }
  
  // MARK: - Load Stats
  func loadStats() async {
    if loadedHours && totalHours > 0 {
      if countStartTime == nil {
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
          let response = try await UserStatsService.shared.getTotalHours(userId: userId)
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
        } catch {
          withAnimation { loadedHours = true }
        }
      }
      
      group.addTask { @MainActor in
        do {
          let genres = try await UserStatsService.shared.getWatchedGenres(userId: userId, language: language)
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
          let status = try await UserStatsService.shared.getItemsStatus(userId: userId)
          withAnimation(.easeIn(duration: 0.25)) {
            itemsStatus = status
            loadedStatus = true
          }
        } catch {
          withAnimation { loadedStatus = true }
        }
      }
      
      group.addTask { @MainActor in
        do {
          let reviews = try await UserStatsService.shared.getBestReviews(userId: userId, language: language)
          withAnimation(.easeIn(duration: 0.25)) {
            bestReviews = reviews
            loadedReviews = true
          }
        } catch {
          withAnimation { loadedReviews = true }
        }
      }
      
      group.addTask { @MainActor in
        let cast = (try? await UserStatsService.shared.getWatchedCast(userId: userId)) ?? []
        withAnimation(.easeIn(duration: 0.25)) {
          watchedCast = cast
          loadedCast = true
        }
      }
      
      group.addTask { @MainActor in
        let countries = (try? await UserStatsService.shared.getWatchedCountries(userId: userId, language: language)) ?? []
        withAnimation(.easeIn(duration: 0.25)) {
          watchedCountries = countries
          loadedCountries = true
        }
      }
      
      group.addTask { @MainActor in
        let series = (try? await UserStatsService.shared.getMostWatchedSeries(userId: userId, language: language)) ?? []
        withAnimation(.easeIn(duration: 0.25)) {
          mostWatchedSeries = series
          loadedSeries = true
        }
      }
    }
    
    cache.set(
      userId: userId,
      totalHours: totalHours,
      movieHours: movieHours,
      seriesHours: seriesHours,
      monthlyHours: monthlyHours,
      watchedGenres: watchedGenres,
      itemsStatus: itemsStatus,
      bestReviews: bestReviews,
      watchedCast: watchedCast,
      watchedCountries: watchedCountries,
      mostWatchedSeries: mostWatchedSeries
    )
  }
}

#Preview {
  ProfileStatsView(userId: "preview-user-id")
}
