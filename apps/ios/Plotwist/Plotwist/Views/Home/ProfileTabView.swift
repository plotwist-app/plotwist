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
  @State var selectedMainTab: ProfileMainTab = .collection
  @State var slideFromTrailing: Bool = true
  @State var selectedStatusTab: ProfileStatusTab = .watched
  @State var userItems: [UserItemSummary] = []
  @State var isLoadingItems = false
  @State var statusCounts: [String: Int] = [:]
  @State var totalReviewsCount: Int = 0
  @State var moviesCount: Int = 0
  @State var seriesCount: Int = 0
  @State var isLoadingQuickStats: Bool = true
  @State var scrollOffset: CGFloat = 0
  @State var initialScrollOffset: CGFloat? = nil
  @State var hasAppeared = false
  @State var removingItemIds: Set<String> = []
  @State var draggingItem: UserItemSummary?
  @State var selectedMediaItem: UserItemSummary?
  @State var isGuestMode = !AuthService.shared.isAuthenticated && UserDefaults.standard.bool(forKey: "isGuestMode")
  @ObservedObject private var themeManager = ThemeManager.shared

  let cache = CollectionCache.shared
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
          isLoadingQuickStats = true
          isInitialLoad = true
        }
      }
      .navigationBarHidden(true)
      .navigationDestination(item: $selectedMediaItem) { item in
        MediaDetailView(
          mediaId: item.tmdbId,
          mediaType: item.mediaType == "MOVIE" ? "movie" : "tv"
        )
      }
      .toolbar(draggingItem != nil ? .hidden : .visible, for: .tabBar)
      .animation(.easeInOut(duration: 0.2), value: draggingItem != nil)
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
        Task { await loadUser() }
      }
      .foregroundColor(.appForegroundAdaptive)
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
          reviewsCount: totalReviewsCount
        )
        .padding(.top, 20)
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

      ProfileCollectionGrid(
        userItems: $userItems,
        draggingItem: $draggingItem,
        isLoadingItems: isLoadingItems,
        removingItemIds: removingItemIds,
        selectedStatusTab: selectedStatusTab,
        strings: strings,
        onChangeStatus: changeItemStatus,
        onRemoveItem: removeItem,
        onReorder: saveCollectionOrder,
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

#Preview {
  ProfileTabView()
}
