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

  func displayName(strings: Strings) -> String {
    switch self {
    case .collection: return strings.collection
    case .reviews: return strings.reviews
    }
  }

  var index: Int {
    switch self {
    case .collection: return 0
    case .reviews: return 1
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
  @State private var totalCollectionCount: Int = 0
  @State private var totalReviewsCount: Int = 0
  @State private var scrollOffset: CGFloat = 0
  @State private var initialScrollOffset: CGFloat? = nil
  @State private var hasAppeared = false
  @ObservedObject private var themeManager = ThemeManager.shared

  private let cache = CollectionCache.shared
  private let avatarSize: CGFloat = 56
  private let scrollThreshold: CGFloat = 80
  
  private var isGuestMode: Bool {
    !AuthService.shared.isAuthenticated && UserDefaults.standard.bool(forKey: "isGuestMode")
  }

  private var isScrolled: Bool {
    guard let initial = initialScrollOffset else { return false }
    return scrollOffset < initial - scrollThreshold
  }

  private var showLoading: Bool {
    isInitialLoad && cache.shouldShowSkeleton && user == nil && !isGuestMode
  }

  var body: some View {
    NavigationView {
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
      .task {
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
          await loadTotalCollectionCount(forceRefresh: true)
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
            collectionCount: totalCollectionCount,
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

          if let memberDate = user.memberSinceDate {
            Text("\(strings.memberSince) \(formattedMemberDate(memberDate))")
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }

        Spacer()
      }
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
    let screenWidth = UIScreen.main.bounds.width
    
    return ZStack(alignment: .topLeading) {
      // Collection tab
      collectionTabContent
        .frame(width: screenWidth, alignment: .top)
        .frame(maxHeight: .infinity, alignment: .top)
        .background(Color.appBackgroundAdaptive)
        .offset(x: selectedMainTab == .collection ? 0 : -screenWidth)
      
      // Reviews tab
      ProfileReviewsListView(userId: userId)
        .padding(.bottom, 24)
        .frame(width: screenWidth, alignment: .top)
        .frame(maxHeight: .infinity, alignment: .top)
        .background(Color.appBackgroundAdaptive)
        .offset(x: selectedMainTab == .reviews ? 0 : screenWidth)
    }
    .frame(width: screenWidth, alignment: .topLeading)
    .frame(maxHeight: .infinity, alignment: .top)
    .clipShape(Rectangle())
    .animation(.spring(response: 0.4, dampingFraction: 0.88), value: selectedMainTab)
  }

  // MARK: - Collection Tab Content
  private var collectionTabContent: some View {
    VStack(spacing: 0) {
      ProfileStatusTabs(selectedTab: $selectedStatusTab, strings: strings)
        .padding(.top, 8)
        .onChange(of: selectedStatusTab) { _ in
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
    if let cachedCount = cache.getTotalCount() {
      totalCollectionCount = cachedCount
    }
    if let cachedReviewsCount = cache.getReviewsCount() {
      totalReviewsCount = cachedReviewsCount
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
    await loadUserItems()
    await loadTotalCollectionCount()
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
    } catch {
      print("Error loading user: \(error)")
      user = nil
    }
  }

  private func formattedMemberDate(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "MMM/yyyy"
    formatter.locale = Locale(identifier: Language.current.rawValue)
    return formatter.string(from: date)
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

  private func loadTotalCollectionCount(forceRefresh: Bool = false) async {
    guard let userId = user?.id else { return }

    if !forceRefresh, let cachedCount = cache.getTotalCount() {
      totalCollectionCount = cachedCount
      return
    }

    do {
      let count = try await UserItemService.shared.getUserItemsCount(userId: userId)
      totalCollectionCount = count
      cache.setTotalCount(count)
    } catch {
      print("Error loading collection count: \(error)")
      totalCollectionCount = 0
    }
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
  var collectionCount: Int = 0
  var reviewsCount: Int = 0
  @Namespace private var tabNamespace

  private func badgeCount(for tab: ProfileMainTab) -> Int {
    switch tab {
    case .collection: return collectionCount
    case .reviews: return reviewsCount
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
                  .transition(
                    .asymmetric(
                      insertion: .move(edge: .leading).combined(with: .opacity),
                      removal: .scale(scale: 0.8).combined(with: .opacity)
                    )
                  )
                  .animation(.easeOut(duration: 0.15), value: selectedTab)
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

  var body: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 8) {
        ForEach(ProfileStatusTab.allCases, id: \.self) { tab in
          Button {
            withAnimation(.easeInOut(duration: 0.2)) {
              selectedTab = tab
            }
          } label: {
            HStack(spacing: 6) {
              Image(systemName: tab.icon)
                .font(.system(size: 12))
                .foregroundColor(selectedTab == tab ? tab.color : .appMutedForegroundAdaptive)

              Text(tab.displayName(strings: strings))
                .font(.footnote.weight(.medium))
                .foregroundColor(selectedTab == tab ? .appForegroundAdaptive : .appMutedForegroundAdaptive)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
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

#Preview {
  ProfileTabView()
}
