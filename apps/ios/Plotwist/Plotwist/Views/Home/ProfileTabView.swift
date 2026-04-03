//
//  ProfileTabView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Profile Tab View
struct ProfileTabView: View {
  @State var user: User?
  @State var isInitialLoad = true
  @State var strings = L10n.current
  @State var selectedMainTab: ProfileMainTab = .activity
  @State var slideFromTrailing: Bool = true
  @State var selectedStatusTab: ProfileStatusTab = .watched
  @State var userItems: [UserItemSummary] = []
  @State var isLoadingItems = false
  @State var statusCounts: [String: Int] = [:]
  @State var totalReviewsCount: Int = 0
  @State var moviesCount: Int = 0
  @State var seriesCount: Int = 0
  @State var followersCount: Int = 0
  @State var followingCount: Int = 0
  @State var isLoadingQuickStats: Bool = true
  @State var scrollOffset: CGFloat = 0
  @State var initialScrollOffset: CGFloat? = nil
  @State var hasAppeared = false
  @State var removingItemIds: Set<String> = []
  @State var selectedMediaItem: UserItemSummary?
  @State var selectedFollowerUser: FollowerUser?
  @State var showReorderCollection = false
  @State var claimedAchievement: Achievement?
  @State var achievements: [Achievement] = initialMockAchievements

  var equippedBadges: [Achievement] {
    achievements.filter { $0.isClaimed && $0.isEquipped }
  }
  @State var isGuestMode = !AuthService.shared.isAuthenticated && UserDefaults.standard.bool(forKey: "isGuestMode")
  @ObservedObject private var themeManager = ThemeManager.shared
  @ObservedObject private var subscriptionService = SubscriptionService.shared

  let cache = CollectionCache.shared
  private let avatarSize: CGFloat = 56

  var visibleMainTabs: [ProfileMainTab] {
    ProfileMainTab.allCases
  }
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
        mainContentView
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
      .modifier(ProfileNotificationModifier(
        onLanguageChanged: {
          strings = L10n.current
          AchievementService.shared.invalidateCache()
          Task { await loadAchievements(forceRefresh: true) }
        },
        onProfileUpdated: { notification in
          if let avatarUrl = notification.userInfo?["avatarUrl"] as? String {
            user?.avatarUrl = avatarUrl
          }
          Task { await loadUser(forceRefresh: true) }
        },
        onCollectionCacheInvalidated: {
          Task {
            await loadUserItems(forceRefresh: true)
            await loadStatusCounts(forceRefresh: true)
            await loadQuickStats(forceRefresh: true)
            await loadAchievements(forceRefresh: true)
          }
        },
        onAuthChanged: {
          isGuestMode = !AuthService.shared.isAuthenticated && UserDefaults.standard.bool(forKey: "isGuestMode")
          if AuthService.shared.isAuthenticated {
            Task { await loadData() }
          } else {
            user = nil
            userItems = []
            statusCounts = [:]
            totalReviewsCount = 0
            moviesCount = 0
            seriesCount = 0
            followersCount = 0
            followingCount = 0
            achievements = []
            isLoadingQuickStats = true
            isInitialLoad = true
            AchievementService.shared.invalidateCache()
          }
        },
        onSubscriptionChanged: {
          Task { await loadUser(forceRefresh: true) }
        }
      ))
      .modifier(ProfileNavigationModifier(
        selectedMediaItem: $selectedMediaItem,
        selectedFollowerUser: $selectedFollowerUser,
        showReorderCollection: $showReorderCollection,
        user: user,
        selectedStatusTab: selectedStatusTab,
        strings: strings,
        statusCounts: statusCounts,
        cache: cache
      ))
    }
    .overlay {
      if let achievement = claimedAchievement {
        ClaimCelebrationOverlay(
          achievement: achievement,
          onDismiss: { claimedAchievement = nil }
        )
      }
    }
  }

  // Type-erased conditional content to reduce generic type nesting depth.
  // Without AnyView, the body produces deeply nested _ConditionalContent types
  // that cause a stack overflow in Swift runtime type metadata resolution on device.
  private var mainContentView: AnyView {
    if isGuestMode {
      AnyView(guestModeView)
    } else if showLoading {
      AnyView(loadingView)
    } else if let user {
      AnyView(profileContentView(user: user))
    } else {
      AnyView(errorView)
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
        Task { await loadData() }
      }
      .foregroundColor(.appForegroundAdaptive)

      #if DEBUG
      Button {
        AuthService.shared.signOut()
      } label: {
        Text("Logout")
          .font(.subheadline.weight(.semibold))
          .foregroundColor(.appDestructive)
      }
      .padding(.top, 8)
      #endif

      Spacer()
    }
  }

  // MARK: - Profile Content View
  private func profileContentView(user: User) -> some View {
    ScrollView(showsIndicators: false) {
      VStack(alignment: .leading, spacing: 0) {
        profileInfoSection(user: user)

        ProfileMainTabs(
          selectedTab: $selectedMainTab,
          slideFromTrailing: $slideFromTrailing,
          strings: strings,
          visibleTabs: visibleMainTabs
        )
        .padding(.top, 28)
        .padding(.bottom, 8)

        tabContentView(userId: user.id)
      }
      .padding(.bottom, 100)
      .background(scrollOffsetReader)
    }
    .safeAreaInset(edge: .top, spacing: 0) {
      headerView(user: user)
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

      NavigationLink(destination: EditProfileView(user: user, achievements: $achievements)) {
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

            if user.isPro || subscriptionService.isPro {
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

      ProfileQuickStats(
        moviesCount: moviesCount,
        seriesCount: seriesCount,
        followersCount: $followersCount,
        followingCount: followingCount,
        userId: user.id,
        isLoading: isLoadingQuickStats,
        strings: strings,
        isOwnProfile: true,
        onUserSelected: { follower in
          selectedFollowerUser = follower
        }
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
      case .activity:
        ActivityFeedView(userId: userId)
          .padding(.bottom, 24)
      case .collection:
        collectionTabContent
      case .favorites:
        FavoritesSection(isOwnProfile: true, userId: userId)
          .padding(.bottom, 24)
      case .reviews:
        ProfileReviewsListView(userId: userId)
          .padding(.bottom, 24)
      case .stats:
        ProfileStatsView(userId: userId, isPro: user?.isPro ?? false, isOwnProfile: true)
          .padding(.bottom, 24)
      case .achievements:
        AchievementsSection(
          achievements: $achievements,
          claimedAchievement: $claimedAchievement
        )
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
        statusCounts: statusCounts,
        onReorder: { showReorderCollection = true }
      )
      .padding(.top, 8)
      .onChange(of: selectedStatusTab) { _, _ in
        Task { await loadUserItems() }
      }

      ProfileCollectionGrid(
        userItems: $userItems,
        isLoadingItems: isLoadingItems,
        removingItemIds: removingItemIds,
        selectedStatusTab: selectedStatusTab,
        strings: strings,
        onChangeStatus: changeItemStatus,
        onRemoveItem: removeItem,
        onTapItem: { item in
          selectedMediaItem = item
        }
      )
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
}

// MARK: - Notification Handler Modifier
private struct ProfileNotificationModifier: ViewModifier {
  let onLanguageChanged: () -> Void
  let onProfileUpdated: (Notification) -> Void
  let onCollectionCacheInvalidated: () -> Void
  let onAuthChanged: () -> Void
  let onSubscriptionChanged: () -> Void

  func body(content: Content) -> some View {
    content
      .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in onLanguageChanged() }
      .onReceive(NotificationCenter.default.publisher(for: .profileUpdated)) { onProfileUpdated($0) }
      .onReceive(NotificationCenter.default.publisher(for: .collectionCacheInvalidated)) { _ in onCollectionCacheInvalidated() }
      .onReceive(NotificationCenter.default.publisher(for: .authChanged)) { _ in onAuthChanged() }
      .onReceive(NotificationCenter.default.publisher(for: .subscriptionChanged)) { _ in onSubscriptionChanged() }
  }
}

// MARK: - Navigation Modifier
private struct ProfileNavigationModifier: ViewModifier {
  @Binding var selectedMediaItem: UserItemSummary?
  @Binding var selectedFollowerUser: FollowerUser?
  @Binding var showReorderCollection: Bool
  let user: User?
  let selectedStatusTab: ProfileStatusTab
  let strings: Strings
  let statusCounts: [String: Int]
  let cache: CollectionCache

  func body(content: Content) -> some View {
    content
      .navigationBarHidden(true)
      .navigationDestination(item: $selectedMediaItem) { item in
        MediaDetailView(
          mediaId: item.tmdbId,
          mediaType: item.mediaType == "MOVIE" ? "movie" : "tv"
        )
      }
      .navigationDestination(item: $selectedFollowerUser) { follower in
        UserProfileView(
          userId: follower.id,
          initialUsername: follower.username,
          initialAvatarUrl: follower.avatarUrl
        )
      }
      .fullScreenCover(isPresented: $showReorderCollection) {
        if let user {
          ReorderCollectionView(
            userId: user.id,
            selectedStatusTab: selectedStatusTab,
            strings: strings,
            statusCounts: statusCounts,
            cache: cache
          )
        }
      }
      .toolbar(.visible, for: .tabBar)
  }
}

#Preview {
  ProfileTabView()
}
