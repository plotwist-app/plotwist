//
//  ProfileTabView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Scroll Offset Preference Key
struct ScrollOffsetPreferenceKey: PreferenceKey {
  static var defaultValue: CGFloat = 0
  static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
    value = nextValue()
  }
}

// MARK: - Profile Status Tab
enum ProfileStatusTab: String, CaseIterable {
  case watched = "WATCHED"
  case watching = "WATCHING"
  case watchlist = "WATCHLIST"
  case dropped = "DROPPED"

  func displayName(strings: Strings) -> String {
    switch self {
    case .watched: return strings.watched
    case .watching: return strings.watching
    case .watchlist: return strings.watchlist
    case .dropped: return strings.dropped
    }
  }

  var icon: String {
    switch self {
    case .watched: return "eye.fill"
    case .watching: return "play.circle.fill"
    case .watchlist: return "clock.fill"
    case .dropped: return "xmark.circle.fill"
    }
  }

  var color: Color {
    switch self {
    case .watched: return .green
    case .watching: return .blue
    case .watchlist: return .orange
    case .dropped: return .red
    }
  }
}

// MARK: - Profile Main Tab
enum ProfileMainTab: CaseIterable {
  case collection
  case reviews
  case stats

  func displayName(strings: Strings) -> String {
    switch self {
    case .collection: return strings.collection
    case .reviews: return strings.reviews
    case .stats: return strings.stats
    }
  }

  var index: Int {
    switch self {
    case .collection: return 0
    case .reviews: return 1
    case .stats: return 2
    }
  }
}

// MARK: - Profile Tab View
struct ProfileTabView: View {
  @State private var user: User?
  @State private var isInitialLoad = true
  @State private var strings = L10n.current
  @State private var selectedMainTab: ProfileMainTab = .collection
  @State private var slideFromTrailing: Bool = true
  @State private var selectedStatusTab: ProfileStatusTab = .watched
  @State private var userItems: [UserItemSummary] = []
  @State private var isLoadingItems = false
  @State private var statusCounts: [String: Int] = [:]
  @State private var totalReviewsCount: Int = 0
  @State private var moviesCount: Int = 0
  @State private var seriesCount: Int = 0
  @State private var isLoadingQuickStats: Bool = true
  @State private var scrollOffset: CGFloat = 0
  @State private var initialScrollOffset: CGFloat? = nil
  @State private var hasAppeared = false
  @State private var removingItemIds: Set<String> = []
  @State private var isGuestMode = !AuthService.shared.isAuthenticated && UserDefaults.standard.bool(forKey: "isGuestMode")
  @ObservedObject private var themeManager = ThemeManager.shared

  private let cache = CollectionCache.shared
  private let avatarSize: CGFloat = 56
  private let scrollThreshold: CGFloat = 80

  private var isScrolled: Bool {
    guard let initial = initialScrollOffset else { return false }
    return scrollOffset < initial - scrollThreshold
  }

  private var showLoading: Bool {
    isInitialLoad && cache.shouldShowSkeleton && user == nil && !isGuestMode
  }

  var body: some View {
    NavigationStack {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        if isGuestMode {
          guestModeView
        } else if showLoading {
          loadingView
        } else if let user {
          profileContentView(user: user)
        } else {
          errorView
        }
      }
      .onAppear {
        if !hasAppeared {
          hasAppeared = true
          if !isGuestMode {
            restoreFromCache()
          }
        }
      }
      .task(id: isGuestMode) {
        if !isGuestMode {
          await loadData()
        }
      }
      .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
        strings = L10n.current
      }
      .onReceive(NotificationCenter.default.publisher(for: .profileUpdated)) { _ in
        Task { await loadUser(forceRefresh: true) }
      }
      .onReceive(NotificationCenter.default.publisher(for: .collectionCacheInvalidated)) { _ in
        Task {
          await loadUserItems(forceRefresh: true)
          await loadStatusCounts(forceRefresh: true)
          await loadQuickStats(forceRefresh: true)
        }
      }
      .onReceive(NotificationCenter.default.publisher(for: .authChanged)) { _ in
        // Update guest mode state reactively
        isGuestMode = !AuthService.shared.isAuthenticated && UserDefaults.standard.bool(forKey: "isGuestMode")
        
        if AuthService.shared.isAuthenticated {
          // User just logged in — reload profile data
          Task { await loadData() }
        } else {
          // User logged out — clear profile state
          user = nil
          userItems = []
          statusCounts = [:]
          totalReviewsCount = 0
          moviesCount = 0
          seriesCount = 0
          isLoadingQuickStats = true
          isInitialLoad = true
        }
      }
      .navigationBarHidden(true)
    }
  }

  // MARK: - Loading View
  private var loadingView: some View {
    VStack {
      Spacer()
      ProgressView()
      Spacer()
    }
  }
  
  // MARK: - Guest Mode View
  private var guestModeView: some View {
    VStack(spacing: 24) {
      Spacer()
      
      Image(systemName: "person.crop.circle")
        .font(.system(size: 64))
        .foregroundColor(.appMutedForegroundAdaptive)
      
      VStack(spacing: 8) {
        Text(strings.signInToAccessProfile)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)
          .multilineTextAlignment(.center)
        
        Text(strings.signInToAccessProfileDescription)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
          .multilineTextAlignment(.center)
          .padding(.horizontal, 32)
      }
      
      Button {
        // Exit guest mode and go back to login screen
        UserDefaults.standard.set(false, forKey: "isGuestMode")
        NotificationCenter.default.post(name: .authChanged, object: nil)
      } label: {
        Text(strings.accessButton)
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(.appBackgroundAdaptive)
          .frame(maxWidth: .infinity)
          .frame(height: 52)
          .background(Color.appForegroundAdaptive)
          .cornerRadius(12)
      }
      .padding(.horizontal, 24)
      .frame(maxWidth: 400)
      
      Spacer()
    }
  }

  // MARK: - Error View
  private var errorView: some View {
    VStack(spacing: 16) {
      Spacer()
      Image(systemName: "person.crop.circle.badge.exclamationmark")
        .font(.system(size: 48))
        .foregroundColor(.appMutedForegroundAdaptive)
      Text("Could not load profile")
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
      Button("Try again") {
        Task { await loadUser() }
      }
      .foregroundColor(.appForegroundAdaptive)
      Spacer()
    }
  }

  // MARK: - Profile Content View
  private func profileContentView(user: User) -> some View {
    VStack(spacing: 0) {
      headerView(user: user)

      ScrollView(showsIndicators: false) {
        VStack(alignment: .leading, spacing: 0) {
          profileInfoSection(user: user)
          
          ProfileMainTabs(
            selectedTab: $selectedMainTab,
            slideFromTrailing: $slideFromTrailing,
            strings: strings,
            reviewsCount: totalReviewsCount
          )
          .padding(.top, 20)
          .padding(.bottom, 8)

          tabContentView(userId: user.id)
        }
        .padding(.bottom, 100)
        .background(scrollOffsetReader)
      }
    }
  }

  // MARK: - Header View
  private func headerView(user: User) -> some View {
    HStack(spacing: 12) {
      if isScrolled {
        HStack(spacing: 10) {
          ProfileAvatar(avatarURL: user.avatarImageURL, username: user.username, size: 32)
            .transition(.opacity.combined(with: .move(edge: .bottom)))

          Text(user.username)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)
            .transition(.opacity.combined(with: .move(edge: .bottom)))
        }
      }

      Spacer()

      NavigationLink(destination: EditProfileView(user: user)) {
        Image(systemName: "ellipsis")
          .font(.system(size: 14))
          .foregroundColor(.appForegroundAdaptive)
          .frame(width: 36, height: 36)
          .background(Color.appInputFilled)
          .clipShape(Circle())
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

  // MARK: - Profile Info Section
  private func profileInfoSection(user: User) -> some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .center, spacing: 12) {
        ProfileAvatar(avatarURL: user.avatarImageURL, username: user.username, size: avatarSize)

        VStack(alignment: .leading, spacing: 2) {
          HStack(spacing: 8) {
            Text(user.username)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)

            if user.isPro {
              ProBadge()
            }
          }

          if let displayName = user.displayName, !displayName.isEmpty {
            Text(displayName)
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }

        Spacer()
      }
      .padding(.horizontal, 24)
      .padding(.bottom, 12)

      // Quick stats (Movies & Series counts)
      ProfileQuickStats(
        moviesCount: moviesCount,
        seriesCount: seriesCount,
        isLoading: isLoadingQuickStats,
        strings: strings
      )
        .padding(.horizontal, 24)
        .padding(.bottom, 12)

      if let biography = user.biography, !biography.isEmpty {
        Text(biography)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
          .lineSpacing(4)
          .multilineTextAlignment(.leading)
          .frame(maxWidth: .infinity, alignment: .leading)
          .padding(.horizontal, 24)
      }
    }
  }

  // MARK: - Tab Content View
  private func tabContentView(userId: String) -> some View {
    Group {
      switch selectedMainTab {
      case .collection:
        collectionTabContent
      case .reviews:
        ProfileReviewsListView(userId: userId)
          .padding(.bottom, 24)
      case .stats:
        ProfileStatsView(userId: userId)
          .padding(.bottom, 24)
      }
    }
    .frame(maxWidth: .infinity, alignment: .top)
    .id(selectedMainTab)
    .geometryGroup()
    .transition(.asymmetric(
      insertion: .move(edge: slideFromTrailing ? .trailing : .leading),
      removal: .move(edge: slideFromTrailing ? .leading : .trailing)
    ))
  }

  // MARK: - Collection Tab Content
  private var collectionTabContent: some View {
    VStack(spacing: 0) {
      ProfileStatusTabs(
        selectedTab: $selectedStatusTab,
        strings: strings,
        statusCounts: statusCounts
      )
        .padding(.top, 8)
        .onChange(of: selectedStatusTab) {
          Task { await loadUserItems() }
        }

      collectionGrid
    }
  }

  @ViewBuilder
  private var collectionGrid: some View {
    let columns = [
      GridItem(.flexible(), spacing: 12),
      GridItem(.flexible(), spacing: 12),
      GridItem(.flexible(), spacing: 12),
    ]

    if isLoadingItems {
      LazyVGrid(columns: columns, spacing: 16) {
        ForEach(0..<6, id: \.self) { _ in
          RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
            .fill(Color.appBorderAdaptive)
            .aspectRatio(2 / 3, contentMode: .fit)
        }
      }
      .padding(.horizontal, 24)
      .padding(.top, 16)
    } else if userItems.isEmpty {
      LazyVGrid(columns: columns, spacing: 16) {
        Button {
          NotificationCenter.default.post(name: .navigateToSearch, object: nil)
        } label: {
          RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
            .strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [8, 4]))
            .foregroundColor(.appBorderAdaptive)
            .aspectRatio(2 / 3, contentMode: .fit)
            .background(
              RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
                .fill(Color.clear)
            )
            .contentShape(Rectangle())
            .overlay(
              Image(systemName: "plus")
                .font(.system(size: 24, weight: .medium))
                .foregroundColor(.appMutedForegroundAdaptive)
            )
        }
        .buttonStyle(.plain)
      }
      .padding(.horizontal, 24)
      .padding(.top, 16)
    } else {
      LazyVGrid(columns: columns, spacing: 16) {
        ForEach(userItems) { item in
          NavigationLink {
            MediaDetailView(
              mediaId: item.tmdbId,
              mediaType: item.mediaType == "MOVIE" ? "movie" : "tv"
            )
          } label: {
            ProfileItemCard(tmdbId: item.tmdbId, mediaType: item.mediaType)
          }
          .buttonStyle(.plain)
          .opacity(removingItemIds.contains(item.id) ? 0 : 1)
          .scaleEffect(removingItemIds.contains(item.id) ? 0.75 : 1)
          .contextMenu {
            let currentStatus = UserItemStatus(rawValue: selectedStatusTab.rawValue)

            ForEach(UserItemStatus.allCases, id: \.rawValue) { status in
              Button {
                if status != currentStatus {
                  Task { await changeItemStatus(item: item, to: status) }
                }
              } label: {
                Label {
                  Text(status.displayName(strings: strings))
                } icon: {
                  Image(systemName: status == currentStatus ? "checkmark" : status.icon)
                }
              }
              .disabled(status == currentStatus)
            }

            Divider()

            Button(role: .destructive) {
              Task { await removeItem(item: item) }
            } label: {
              Label(strings.delete, systemImage: "trash")
            }
          } preview: {
            ProfileItemCard(tmdbId: item.tmdbId, mediaType: item.mediaType)
              .frame(width: 200, height: 300)
          }
        }
      }
      .padding(.horizontal, 24)
      .padding(.top, 16)
    }
  }

  // MARK: - Scroll Offset Reader
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

  // MARK: - Data Loading
  private func restoreFromCache() {
    if let cachedUser = cache.user {
      user = cachedUser
    }
    if let cachedCounts = cache.getStatusCounts() {
      statusCounts = cachedCounts
    }
    if let cachedReviewsCount = cache.getReviewsCount() {
      totalReviewsCount = cachedReviewsCount
    }
    if let cached = cache.getQuickStats() {
      moviesCount = cached.moviesCount
      seriesCount = cached.seriesCount
      isLoadingQuickStats = false
    }
    if let userId = user?.id ?? cache.user?.id,
       let cachedItems = cache.getItems(userId: userId, status: selectedStatusTab.rawValue) {
      userItems = cachedItems
    }
  }

  private func loadData() async {
    if cache.isDataAvailable {
      isInitialLoad = false
    }

    await loadUser()

    // Prefetch reviews and stats in the background while collection loads
    if let userId = user?.id {
      ProfilePrefetchService.shared.prefetchReviewsAndStats(userId: userId)
    }

    await loadUserItems()
    await loadStatusCounts()
    await loadQuickStats()
    await loadTotalReviewsCount()

    isInitialLoad = false
  }

  private func loadUser(forceRefresh: Bool = false) async {
    if !forceRefresh, let cachedUser = cache.user {
      user = cachedUser
      return
    }

    do {
      let fetchedUser = try await AuthService.shared.getCurrentUser()
      user = fetchedUser
      cache.setUser(fetchedUser)
      
      // Track profile viewed (own profile)
      AnalyticsService.shared.track(.profileViewed(userId: fetchedUser.id, isOwnProfile: true))
    } catch {
      print("Error loading user: \(error)")
      user = nil
    }
  }

  private func loadUserItems(forceRefresh: Bool = false) async {
    guard let userId = user?.id else { return }

    if !forceRefresh,
       let cachedItems = cache.getItems(userId: userId, status: selectedStatusTab.rawValue) {
      userItems = cachedItems
      return
    }

    isLoadingItems = true
    defer { isLoadingItems = false }

    do {
      let items = try await UserItemService.shared.getAllUserItems(
        userId: userId,
        status: selectedStatusTab.rawValue
      )
      userItems = items
      cache.setItems(items, userId: userId, status: selectedStatusTab.rawValue)
    } catch {
      print("Error loading user items: \(error)")
      userItems = []
    }
  }

  private func loadStatusCounts(forceRefresh: Bool = false) async {
    guard let userId = user?.id else { return }

    if !forceRefresh, let cachedCounts = cache.getStatusCounts() {
      statusCounts = cachedCounts
      return
    }

    do {
      let stats = try await UserStatsService.shared.getItemsStatus(userId: userId)
      var counts: [String: Int] = [:]
      for stat in stats {
        counts[stat.status] = stat.count
      }
      statusCounts = counts
      cache.setStatusCounts(counts)
    } catch {
      print("Error loading status counts: \(error)")
      statusCounts = [:]
    }
  }

  // MARK: - Status Change Actions
  private func changeItemStatus(item: UserItemSummary, to newStatus: UserItemStatus) async {
    guard newStatus.rawValue != selectedStatusTab.rawValue else { return }

    do {
      _ = try await UserItemService.shared.upsertUserItem(
        tmdbId: item.tmdbId,
        mediaType: item.mediaType,
        status: newStatus
      )

      AnalyticsService.shared.track(.mediaStatusChanged(
        tmdbId: item.tmdbId,
        mediaType: item.mediaType == "MOVIE" ? "movie" : "tv",
        status: newStatus.rawValue,
        source: "collection_context_menu"
      ))

      // Optimistic quick stats update
      let isMovie = item.mediaType == "MOVIE"
      let wasWatched = selectedStatusTab == .watched
      let willBeWatched = newStatus == .watched

      if wasWatched || willBeWatched {
        withAnimation(.snappy) {
          if wasWatched && !willBeWatched {
            if isMovie { moviesCount = max(0, moviesCount - 1) }
            else { seriesCount = max(0, seriesCount - 1) }
          } else if !wasWatched && willBeWatched {
            if isMovie { moviesCount += 1 }
            else { seriesCount += 1 }
          }
        }
        cache.setQuickStats(moviesCount: moviesCount, seriesCount: seriesCount)
      }

      await animateItemRemoval(item: item)

      cache.clearCache()
      if let userId = user?.id {
        cache.setItems(userItems, userId: userId, status: selectedStatusTab.rawValue)
      }
      await loadStatusCounts(forceRefresh: true)
    } catch {
      print("Error changing item status: \(error)")
    }
  }

  private func removeItem(item: UserItemSummary) async {
    do {
      try await UserItemService.shared.deleteUserItem(
        id: item.id,
        tmdbId: item.tmdbId,
        mediaType: item.mediaType == "MOVIE" ? "movie" : "tv"
      )

      AnalyticsService.shared.track(.mediaStatusRemoved(
        tmdbId: item.tmdbId,
        mediaType: item.mediaType == "MOVIE" ? "movie" : "tv"
      ))

      // Optimistic quick stats update
      if selectedStatusTab == .watched {
        withAnimation(.snappy) {
          if item.mediaType == "MOVIE" { moviesCount = max(0, moviesCount - 1) }
          else { seriesCount = max(0, seriesCount - 1) }
        }
        cache.setQuickStats(moviesCount: moviesCount, seriesCount: seriesCount)
      }

      await animateItemRemoval(item: item)

      cache.clearCache()
      if let userId = user?.id {
        cache.setItems(userItems, userId: userId, status: selectedStatusTab.rawValue)
      }
      await loadStatusCounts(forceRefresh: true)
    } catch {
      print("Error removing item: \(error)")
    }
  }

  /// Two-phase removal animation (Apple-style):
  /// Phase 1 — item fades out and shrinks (fast easeOut)
  /// Phase 2 — remaining items spring into new positions
  private func animateItemRemoval(item: UserItemSummary) async {
    // Phase 1: fade out + shrink
    withAnimation(.easeOut(duration: 0.2)) {
      removingItemIds.insert(item.id)
    }

    // Wait for fade-out to finish before reflowing
    try? await Task.sleep(nanoseconds: 250_000_000)

    // Phase 2: remove from data source, spring remaining items into place
    withAnimation(.spring(response: 0.45, dampingFraction: 0.86)) {
      userItems.removeAll { $0.id == item.id }
      removingItemIds.remove(item.id)
    }
  }

  private func loadQuickStats(forceRefresh: Bool = false) async {
    guard let userId = user?.id else { return }

    if !forceRefresh, let cached = cache.getQuickStats() {
      if moviesCount != cached.moviesCount || seriesCount != cached.seriesCount {
        withAnimation(.snappy) {
          moviesCount = cached.moviesCount
          seriesCount = cached.seriesCount
        }
      }
      isLoadingQuickStats = false
      return
    }

    do {
      let stats = try await UserStatsService.shared.getUserStats(userId: userId)
      withAnimation(.snappy) {
        moviesCount = stats.watchedMoviesCount
        seriesCount = stats.watchedSeriesCount
      }
      cache.setQuickStats(moviesCount: stats.watchedMoviesCount, seriesCount: stats.watchedSeriesCount)
    } catch {
      print("Error loading quick stats: \(error)")
    }
    isLoadingQuickStats = false
  }

  private func loadTotalReviewsCount(forceRefresh: Bool = false) async {
    guard let userId = user?.id else { return }

    if !forceRefresh, let cachedCount = cache.getReviewsCount() {
      totalReviewsCount = cachedCount
      return
    }

    do {
      let count = try await ReviewService.shared.getUserReviewsCount(userId: userId)
      totalReviewsCount = count
      cache.setReviewsCount(count)
    } catch {
      print("Error loading reviews count: \(error)")
      totalReviewsCount = 0
    }
  }
}

// MARK: - Profile Main Tabs
struct ProfileMainTabs: View {
  @Binding var selectedTab: ProfileMainTab
  @Binding var slideFromTrailing: Bool
  let strings: Strings
  var reviewsCount: Int = 0
  @Namespace private var tabNamespace

  private func badgeCount(for tab: ProfileMainTab) -> Int {
    switch tab {
    case .collection: return 0
    case .reviews: return reviewsCount
    case .stats: return 0
    }
  }

  var body: some View {
    HStack(spacing: 0) {
      ForEach(ProfileMainTab.allCases, id: \.self) { tab in
        Button {
          guard selectedTab != tab else { return }
          slideFromTrailing = tab.index > selectedTab.index
          withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
            selectedTab = tab
          }
        } label: {
          VStack(spacing: 8) {
            HStack(spacing: 6) {
              Text(tab.displayName(strings: strings))
                .font(.subheadline.weight(.medium))
                .foregroundColor(selectedTab == tab ? .appForegroundAdaptive : .appMutedForegroundAdaptive)

              if badgeCount(for: tab) > 0 && selectedTab == tab {
                CollectionCountBadge(count: badgeCount(for: tab))
                  .transition(.scale.combined(with: .opacity))
              }
            }

            ZStack {
              Rectangle()
                .fill(Color.clear)
                .frame(height: 3)

              if selectedTab == tab {
                Rectangle()
                  .fill(Color.appForegroundAdaptive)
                  .frame(height: 3)
                  .matchedGeometryEffect(id: "tabIndicator", in: tabNamespace)
              }
            }
          }
        }
        .buttonStyle(.plain)
        .frame(maxWidth: .infinity)
      }
    }
    .padding(.horizontal, 24)
    .overlay(
      Rectangle()
        .fill(Color.appBorderAdaptive)
        .frame(height: 1),
      alignment: .bottom
    )
  }
}

// MARK: - Profile Status Tabs
struct ProfileStatusTabs: View {
  @Binding var selectedTab: ProfileStatusTab
  let strings: Strings
  var statusCounts: [String: Int] = [:]

  private func count(for tab: ProfileStatusTab) -> Int {
    statusCounts[tab.rawValue] ?? 0
  }

  var body: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 8) {
        ForEach(ProfileStatusTab.allCases, id: \.self) { tab in
          let isSelected = selectedTab == tab

          Button {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
              selectedTab = tab
            }
          } label: {
            HStack(spacing: 6) {
              Image(systemName: tab.icon)
                .font(.system(size: 12))
                .foregroundColor(isSelected ? tab.color : .appMutedForegroundAdaptive)
                .contentTransition(.interpolate)

              Text(tab.displayName(strings: strings))
                .font(.footnote.weight(.medium))
                .foregroundColor(isSelected ? .appForegroundAdaptive : .appMutedForegroundAdaptive)
                .contentTransition(.interpolate)

              if count(for: tab) > 0 && isSelected {
                CollectionCountBadge(count: count(for: tab))
                  .transition(.scale.combined(with: .opacity))
              }
            }
            .padding(.horizontal, 12)
            .frame(height: 34)
            .background(Color.appInputFilled)
            .clipShape(Capsule())
          }
          .buttonStyle(.plain)
        }
      }
      .padding(.horizontal, 24)
    }
  }
}

// MARK: - Profile Quick Stats
struct ProfileQuickStats: View {
  let moviesCount: Int
  let seriesCount: Int
  let isLoading: Bool
  let strings: Strings

  var body: some View {
    HStack(spacing: 0) {
      // Movies
      HStack(spacing: 6) {
        Text("\(moviesCount)")
          .font(.subheadline.weight(.semibold))
          .foregroundColor(.appForegroundAdaptive)
          .contentTransition(.numericText())

        Text(strings.movies)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
      }
      .redacted(reason: isLoading ? .placeholder : [])

      // Divider
      Rectangle()
        .fill(Color.appBorderAdaptive)
        .frame(width: 1, height: 14)
        .padding(.horizontal, 12)

      // Series
      HStack(spacing: 6) {
        Text("\(seriesCount)")
          .font(.subheadline.weight(.semibold))
          .foregroundColor(.appForegroundAdaptive)
          .contentTransition(.numericText())

        Text(strings.series)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
      }
      .redacted(reason: isLoading ? .placeholder : [])

      Spacer()
    }
  }
}

#Preview {
  ProfileTabView()
}
