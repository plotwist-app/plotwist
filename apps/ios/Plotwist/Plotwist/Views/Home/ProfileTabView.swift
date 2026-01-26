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
}

struct ProfileTabView: View {
  @State private var user: User?
  @State private var isInitialLoad = true
  @State private var strings = L10n.current
  @State private var selectedMainTab: ProfileMainTab = .collection
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

  // Avatar size
  private let avatarSize: CGFloat = 56
  // Scroll threshold to show header content (height of profile info section)
  private let scrollThreshold: CGFloat = 80

  private var isScrolled: Bool {
    guard let initial = initialScrollOffset else { return false }
    return scrollOffset < initial - scrollThreshold
  }

  // Only show loading on first load when no cached data
  private var showLoading: Bool {
    isInitialLoad && cache.shouldShowSkeleton && user == nil
  }

  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        if showLoading {
          VStack {
            Spacer()
            ProgressView()
            Spacer()
          }
        } else if let user {
          VStack(spacing: 0) {
            // Header with action buttons
            HStack(spacing: 12) {
              // Avatar + Username (appears when scrolled)
              if isScrolled {
                HStack(spacing: 10) {
                  ProfileAvatar(
                    avatarURL: user.avatarImageURL,
                    username: user.username,
                    size: 32
                  )
                  .transition(.opacity.combined(with: .move(edge: .bottom)))

                  Text(user.username)
                    .font(.headline)
                    .foregroundColor(.appForegroundAdaptive)
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
                }
              }

              Spacer()

              // Action Buttons
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

            ScrollView(showsIndicators: false) {
              VStack(alignment: .leading, spacing: 0) {
                // Profile Info - Avatar left, info right
                HStack(alignment: .center, spacing: 12) {
                  // Avatar
                  ProfileAvatar(
                    avatarURL: user.avatarImageURL,
                    username: user.username,
                    size: avatarSize
                  )

                  // User Info
                  VStack(alignment: .leading, spacing: 2) {
                    // Username + Pro Badge
                    HStack(spacing: 8) {
                      Text(user.username)
                        .font(.title3.bold())
                        .foregroundColor(.appForegroundAdaptive)

                      if user.isPro {
                        ProBadge()
                      }
                    }

                    // Member Since
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

                // Biography
                if let biography = user.biography, !biography.isEmpty {
                  Text(biography)
                    .font(.subheadline)
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .lineSpacing(4)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 24)
                }

                // Main Tabs (Collection / Reviews)
                ProfileMainTabs(
                  selectedTab: $selectedMainTab,
                  strings: strings,
                  collectionCount: totalCollectionCount,
                  reviewsCount: totalReviewsCount
                )
                .padding(.top, 20)
                .padding(.bottom, 8)

                // Tab Content
                switch selectedMainTab {
                case .collection:
                  // Status Tabs inside Collection
                  ProfileStatusTabs(selectedTab: $selectedStatusTab, strings: strings)
                    .padding(.top, 8)
                    .onChange(of: selectedStatusTab) { _ in
                      Task { await loadUserItems() }
                    }

                  // User Items Grid
                  if isLoadingItems {
                    LazyVGrid(
                      columns: [
                        GridItem(.flexible(), spacing: 12),
                        GridItem(.flexible(), spacing: 12),
                        GridItem(.flexible(), spacing: 12),
                      ],
                      spacing: 16
                    ) {
                      ForEach(0..<6, id: \.self) { _ in
                        RoundedRectangle(cornerRadius: 12)
                          .fill(Color.appSkeletonAdaptive)
                          .aspectRatio(2 / 3, contentMode: .fit)
                      }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 16)
                  } else if userItems.isEmpty {
                    // Empty state - Add first item
                    LazyVGrid(
                      columns: [
                        GridItem(.flexible(), spacing: 12),
                        GridItem(.flexible(), spacing: 12),
                        GridItem(.flexible(), spacing: 12),
                      ],
                      spacing: 16
                    ) {
                      Button {
                        NotificationCenter.default.post(name: .navigateToSearch, object: nil)
                      } label: {
                        RoundedRectangle(cornerRadius: 12)
                          .strokeBorder(
                            style: StrokeStyle(lineWidth: 2, dash: [8, 4])
                          )
                          .foregroundColor(.appBorderAdaptive)
                          .aspectRatio(2 / 3, contentMode: .fit)
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
                    LazyVGrid(
                      columns: [
                        GridItem(.flexible(), spacing: 12),
                        GridItem(.flexible(), spacing: 12),
                        GridItem(.flexible(), spacing: 12),
                      ],
                      spacing: 16
                    ) {
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

                case .reviews:
                  // Reviews tab content - placeholder for now
                  VStack(spacing: 16) {
                    Image(systemName: "text.bubble")
                      .font(.system(size: 48))
                      .foregroundColor(.appMutedForegroundAdaptive)
                    Text(strings.beFirstToReview)
                      .font(.subheadline)
                      .foregroundColor(.appMutedForegroundAdaptive)
                  }
                  .frame(maxWidth: .infinity)
                  .padding(.top, 60)
                }

                Spacer()
                  .frame(height: 100)
              }
              .background(
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
              )
            }
          }
        } else {
          // Error state - no user
          VStack(spacing: 16) {
            Spacer()
            Image(systemName: "person.crop.circle.badge.exclamationmark")
              .font(.system(size: 48))
              .foregroundColor(.appMutedForegroundAdaptive)
            Text("Could not load profile")
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
            Button("Try again") {
              Task {
                await loadUser()
              }
            }
            .foregroundColor(.appForegroundAdaptive)
            Spacer()
          }
        }
      }
      .onAppear {
        // Restore from cache immediately on appear
        if !hasAppeared {
          hasAppeared = true
          restoreFromCache()
        }
      }
      .task {
        await loadData()
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
    // If we have cached data, don't show loading state
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
    // Use cache if available and not forcing refresh
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

    // Check cache first
    if !forceRefresh,
      let cachedItems = cache.getItems(userId: userId, status: selectedStatusTab.rawValue)
    {
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
      // Save to cache
      cache.setItems(items, userId: userId, status: selectedStatusTab.rawValue)
    } catch {
      print("Error loading user items: \(error)")
      userItems = []
    }
  }

  private func loadTotalCollectionCount(forceRefresh: Bool = false) async {
    guard let userId = user?.id else { return }

    // Check cache first
    if !forceRefresh, let cachedCount = cache.getTotalCount() {
      totalCollectionCount = cachedCount
      return
    }

    do {
      let count = try await UserItemService.shared.getUserItemsCount(userId: userId)
      totalCollectionCount = count
      // Save to cache
      cache.setTotalCount(count)
    } catch {
      print("Error loading collection count: \(error)")
      totalCollectionCount = 0
    }
  }

  private func loadTotalReviewsCount(forceRefresh: Bool = false) async {
    guard let userId = user?.id else { return }

    // Check cache first
    if !forceRefresh, let cachedCount = cache.getReviewsCount() {
      totalReviewsCount = cachedCount
      return
    }

    do {
      let count = try await ReviewService.shared.getUserReviewsCount(userId: userId)
      totalReviewsCount = count
      // Save to cache
      cache.setReviewsCount(count)
    } catch {
      print("Error loading reviews count: \(error)")
      totalReviewsCount = 0
    }
  }
}

// MARK: - Profile Main Tabs (Collection / Reviews)
struct ProfileMainTabs: View {
  @Binding var selectedTab: ProfileMainTab
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
          withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
            selectedTab = tab
          }
        } label: {
          VStack(spacing: 8) {
            HStack(spacing: 6) {
              Text(tab.displayName(strings: strings))
                .font(.subheadline.weight(.medium))
                .foregroundColor(
                  selectedTab == tab
                    ? .appForegroundAdaptive
                    : .appMutedForegroundAdaptive
                )

              // Animated badge
              if badgeCount(for: tab) > 0 {
                if selectedTab == tab {
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
            }

            // Sliding indicator
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

// MARK: - Collection Count Badge
struct CollectionCountBadge: View {
  let count: Int
  @Environment(\.colorScheme) var colorScheme

  var body: some View {
    Text("\(count)")
      .font(.system(size: 10, weight: .semibold))
      .foregroundColor(colorScheme == .dark ? .white : .appForegroundAdaptive)
      .padding(.horizontal, 8)
      .padding(.vertical, 3)
      .background(
        colorScheme == .dark
          ? Color(hex: "0a0a0f")
          : Color(hex: "f5f5f5")
      )
      .clipShape(Capsule())
      .overlay(
        Capsule()
          .stroke(Color.appBorderAdaptive, lineWidth: 1)
      )
  }
}

// MARK: - Profile Status Tabs
struct ProfileStatusTabs: View {
  @Binding var selectedTab: ProfileStatusTab
  let strings: Strings

  var body: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 2) {
        ForEach(ProfileStatusTab.allCases, id: \.self) { tab in
          Button {
            withAnimation(.easeInOut(duration: 0.2)) {
              selectedTab = tab
            }
          } label: {
            Text(tab.displayName(strings: strings))
              .font(.footnote.weight(.medium))
              .foregroundColor(
                selectedTab == tab
                  ? .appForegroundAdaptive
                  : .appMutedForegroundAdaptive
              )
              .padding(.horizontal, 12)
              .padding(.vertical, 8)
              .background(
                selectedTab == tab
                  ? Color.appBackgroundAdaptive
                  : Color.clear
              )
              .clipShape(RoundedRectangle(cornerRadius: 8))
              .shadow(
                color: selectedTab == tab ? Color.black.opacity(0.08) : Color.clear,
                radius: 2,
                x: 0,
                y: 1
              )
          }
          .buttonStyle(.plain)
        }
      }
      .padding(3)
      .background(Color.appInputFilled)
      .clipShape(RoundedRectangle(cornerRadius: 10))
      .padding(.horizontal, 24)
    }
    .scrollClipDisabled()
  }
}

// MARK: - Profile Item Card
struct ProfileItemCard: View {
  let tmdbId: Int
  let mediaType: String
  @State private var posterURL: URL?
  @State private var isLoading = true

  var body: some View {
    CachedAsyncImage(url: posterURL) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: 12)
        .fill(Color.appSkeletonAdaptive)
    }
    .aspectRatio(2 / 3, contentMode: .fit)
    .clipShape(RoundedRectangle(cornerRadius: 12))
    .posterBorder(cornerRadius: 12)
    .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
    .task {
      await loadPoster()
    }
  }

  private func loadPoster() async {
    do {
      let type = mediaType == "MOVIE" ? "movie" : "tv"
      if type == "movie" {
        let details = try await TMDBService.shared.getMovieDetails(
          id: tmdbId,
          language: Language.current.rawValue
        )
        posterURL = details.posterURL
      } else {
        let details = try await TMDBService.shared.getTVSeriesDetails(
          id: tmdbId,
          language: Language.current.rawValue
        )
        posterURL = details.posterURL
      }
    } catch {
      print("Error loading poster: \(error)")
    }
    isLoading = false
  }
}

// MARK: - Profile Avatar
struct ProfileAvatar: View {
  let avatarURL: URL?
  let username: String
  let size: CGFloat

  @Environment(\.colorScheme) var colorScheme

  var body: some View {
    ZStack {
      if let avatarURL {
        CachedAsyncImage(url: avatarURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
        } placeholder: {
          avatarPlaceholder
        }
      } else {
        avatarPlaceholder
      }
    }
    .frame(width: size, height: size)
    .clipShape(Circle())
    .overlay(
      Circle()
        .stroke(
          colorScheme == .dark ? Color.appBorderAdaptive : Color.clear,
          lineWidth: 1
        )
    )
  }

  private var avatarPlaceholder: some View {
    Circle()
      .fill(Color.appInputFilled)
      .overlay(
        Text(String(username.prefix(1)).uppercased())
          .font(.system(size: size * 0.4, weight: .bold))
          .foregroundColor(.appForegroundAdaptive)
      )
  }
}

// MARK: - Pro Badge
struct ProBadge: View {
  @Environment(\.colorScheme) private var colorScheme

  var body: some View {
    Text("PRO")
      .font(.system(size: 10, weight: .semibold))
      .foregroundColor(colorScheme == .dark ? .white : .appForegroundAdaptive)
      .padding(.horizontal, 8)
      .padding(.vertical, 3)
      .background(
        colorScheme == .dark
          ? Color(hex: "0a0a0f")
          : Color(hex: "f5f5f5")
      )
      .clipShape(RoundedRectangle(cornerRadius: 6))
      .overlay(
        RoundedRectangle(cornerRadius: 6)
          .stroke(Color.appBorderAdaptive, lineWidth: 1)
      )
  }
}

// MARK: - Edit Profile View
struct EditProfileView: View {
  let user: User

  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var userPreferences: UserPreferences?
  @State private var isLoadingPreferences = true
  @State private var streamingProviders: [StreamingProvider] = []

  // Fixed label width for alignment
  private let labelWidth: CGFloat = 100

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var currentRegionName: String {
    guard let region = userPreferences?.watchRegion else {
      return "-"
    }
    return regionName(for: region)
  }

  private var currentRegionFlag: String? {
    guard let region = userPreferences?.watchRegion else {
      return nil
    }
    return flagEmoji(for: region)
  }

  private func regionName(for code: String) -> String {
    let locale = Locale(identifier: Language.current.rawValue)
    return locale.localizedString(forRegionCode: code) ?? code
  }

  private func flagEmoji(for code: String) -> String {
    let base: UInt32 = 127397
    var emoji = ""
    for scalar in code.uppercased().unicodeScalars {
      if let unicode = UnicodeScalar(base + scalar.value) {
        emoji.append(String(unicode))
      }
    }
    return emoji
  }

  private var selectedProviders: [StreamingProvider] {
    guard let ids = userPreferences?.watchProvidersIds else { return [] }
    return streamingProviders.filter { ids.contains($0.providerId) }
  }

  private var canEditStreamingServices: Bool {
    userPreferences?.watchRegion != nil
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header with back button and title
        VStack(spacing: 0) {
          HStack {
            Button {
              dismiss()
            } label: {
              Image(systemName: "chevron.left")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 40, height: 40)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }

            Spacer()

            Text(strings.profile)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)

            Spacer()

            // Invisible placeholder for balance
            Color.clear
              .frame(width: 40, height: 40)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 16)

          // Border bottom
          Rectangle()
            .fill(Color.appBorderAdaptive.opacity(0.5))
            .frame(height: 1)
        }

        ScrollView(showsIndicators: false) {
          VStack(spacing: 0) {
            // Profile Picture Section
            VStack(spacing: 16) {
              // Avatar
              ProfileAvatar(
                avatarURL: user.avatarImageURL,
                username: user.username,
                size: 100
              )

              // Edit Picture Button (disabled)
              Button {
                // Disabled for now
              } label: {
                Text(strings.editPicture)
                  .font(.subheadline.weight(.medium))
                  .foregroundColor(.appMutedForegroundAdaptive)
              }
              .disabled(true)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)

            // Border bottom
            Rectangle()
              .fill(Color.appBorderAdaptive.opacity(0.5))
              .frame(height: 1)

            // Fields Section
            VStack(spacing: 0) {
              // Username Field
              NavigationLink(destination: EditUsernameView(currentUsername: user.username)) {
                EditProfileRow(
                  label: strings.username,
                  value: user.username,
                  labelWidth: labelWidth
                )
              }

              Rectangle()
                .fill(Color.appBorderAdaptive.opacity(0.3))
                .frame(height: 1)
                .padding(.leading, 24)

              // Biography Field
              NavigationLink(destination: EditBiographyView(currentBiography: user.biography)) {
                EditProfileRow(
                  label: strings.biography,
                  value: user.biography?.isEmpty == false ? user.biography! : "-",
                  labelWidth: labelWidth
                )
              }

              Rectangle()
                .fill(Color.appBorderAdaptive.opacity(0.3))
                .frame(height: 1)
                .padding(.leading, 24)

              // Region Field
              NavigationLink(
                destination: EditRegionView(currentRegion: userPreferences?.watchRegion)
              ) {
                EditProfileBadgeRow(label: strings.region) {
                  if let region = userPreferences?.watchRegion {
                    ProfileBadge(
                      text: currentRegionName,
                      prefix: currentRegionFlag
                    )
                  } else {
                    Text("-")
                      .font(.subheadline)
                      .foregroundColor(.appMutedForegroundAdaptive)
                  }
                }
              }

              Rectangle()
                .fill(Color.appBorderAdaptive.opacity(0.3))
                .frame(height: 1)
                .padding(.leading, 24)

              // Streaming Services Field
              if canEditStreamingServices {
                NavigationLink(
                  destination: EditStreamingServicesView(
                    watchRegion: userPreferences?.watchRegion ?? "",
                    selectedIds: userPreferences?.watchProvidersIds ?? []
                  )
                ) {
                  EditProfileBadgeRow(label: strings.streamingServices) {
                    if selectedProviders.isEmpty {
                      Text("-")
                        .font(.subheadline)
                        .foregroundColor(.appMutedForegroundAdaptive)
                    } else {
                      FlowLayout(spacing: 6) {
                        ForEach(selectedProviders) { provider in
                          ProfileBadge(
                            text: provider.providerName,
                            logoURL: provider.logoURL
                          )
                        }
                      }
                    }
                  }
                }
              } else {
                EditProfileBadgeRow(label: strings.streamingServices) {
                  Text(strings.selectRegionFirst)
                    .font(.subheadline)
                    .foregroundColor(.appMutedForegroundAdaptive)
                }
                .opacity(0.5)
              }

              Rectangle()
                .fill(Color.appBorderAdaptive.opacity(0.3))
                .frame(height: 1)
                .padding(.leading, 24)

              // Theme Field
              NavigationLink(destination: EditThemeView()) {
                EditProfileBadgeRow(label: strings.theme) {
                  ProfileBadge(
                    text: themeDisplayName(themeManager.current), icon: themeManager.current.icon)
                }
              }

              Rectangle()
                .fill(Color.appBorderAdaptive.opacity(0.3))
                .frame(height: 1)
                .padding(.leading, 24)

              // Language Field
              NavigationLink(destination: EditLanguageView()) {
                EditProfileBadgeRow(label: strings.language) {
                  ProfileBadge(text: Language.current.displayName, prefix: Language.current.flag)
                }
              }
            }

            // Sign Out Section
            VStack(spacing: 0) {
              Rectangle()
                .fill(Color.appBorderAdaptive.opacity(0.5))
                .frame(height: 1)
                .padding(.top, 24)

              Button {
                AuthService.shared.signOut()
              } label: {
                HStack(spacing: 8) {
                  Image(systemName: "rectangle.portrait.and.arrow.right")
                  Text(strings.signOut)
                }
                .font(.subheadline.weight(.medium))
                .foregroundColor(.appDestructive)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
              }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
          }
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
    .task {
      await loadPreferences()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
    .onReceive(NotificationCenter.default.publisher(for: .profileUpdated)) { _ in
      Task { await loadPreferences() }
    }
  }

  private func loadPreferences() async {
    isLoadingPreferences = true
    defer { isLoadingPreferences = false }

    do {
      userPreferences = try await AuthService.shared.getUserPreferences()

      // Load providers if region is set
      if let region = userPreferences?.watchRegion {
        streamingProviders = try await TMDBService.shared.getStreamingProviders(
          watchRegion: region,
          language: Language.current.rawValue
        )
      }
    } catch {
      print("Error loading preferences: \(error)")
    }
  }

  private func themeDisplayName(_ theme: AppTheme) -> String {
    switch theme {
    case .system: return strings.themeSystem
    case .light: return strings.themeLight
    case .dark: return strings.themeDark
    }
  }
}

// MARK: - Edit Theme View
struct EditThemeView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(spacing: 0) {
          HStack {
            Button {
              dismiss()
            } label: {
              Image(systemName: "chevron.left")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 40, height: 40)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }

            Spacer()

            Text(strings.theme)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)

            Spacer()

            Color.clear
              .frame(width: 40, height: 40)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 16)

          Rectangle()
            .fill(Color.appBorderAdaptive.opacity(0.5))
            .frame(height: 1)
        }

        // Theme Options
        VStack(spacing: 0) {
          ForEach(AppTheme.allCases, id: \.self) { theme in
            Button {
              themeManager.current = theme
            } label: {
              HStack {
                Image(systemName: theme.icon)
                  .font(.system(size: 18))
                  .foregroundColor(.appForegroundAdaptive)
                  .frame(width: 32)

                Text(themeDisplayName(theme))
                  .font(.subheadline)
                  .foregroundColor(.appForegroundAdaptive)

                Spacer()

                if themeManager.current == theme {
                  Image(systemName: "checkmark")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.appForegroundAdaptive)
                }
              }
              .padding(.horizontal, 24)
              .padding(.vertical, 16)
              .contentShape(Rectangle())
            }

            if theme != AppTheme.allCases.last {
              Rectangle()
                .fill(Color.appBorderAdaptive.opacity(0.3))
                .frame(height: 1)
                .padding(.leading, 24)
            }
          }
        }
        .padding(.top, 8)

        Spacer()
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private func themeDisplayName(_ theme: AppTheme) -> String {
    switch theme {
    case .system: return strings.themeSystem
    case .light: return strings.themeLight
    case .dark: return strings.themeDark
    }
  }
}

// MARK: - Edit Language View
struct EditLanguageView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(spacing: 0) {
          HStack {
            Button {
              dismiss()
            } label: {
              Image(systemName: "chevron.left")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 40, height: 40)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }

            Spacer()

            Text(strings.language)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)

            Spacer()

            Color.clear
              .frame(width: 40, height: 40)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 16)

          Rectangle()
            .fill(Color.appBorderAdaptive.opacity(0.5))
            .frame(height: 1)
        }

        // Language Options
        VStack(spacing: 0) {
          ForEach(Language.allCases, id: \.self) { lang in
            Button {
              Language.current = lang
            } label: {
              HStack(spacing: 12) {
                Text(lang.flag)
                  .font(.title2)

                Text(lang.displayName)
                  .font(.subheadline)
                  .foregroundColor(.appForegroundAdaptive)

                Spacer()

                if Language.current == lang {
                  Image(systemName: "checkmark")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.appForegroundAdaptive)
                }
              }
              .padding(.horizontal, 24)
              .padding(.vertical, 16)
              .contentShape(Rectangle())
            }

            if lang != Language.allCases.last {
              Rectangle()
                .fill(Color.appBorderAdaptive.opacity(0.3))
                .frame(height: 1)
                .padding(.leading, 24)
            }
          }
        }
        .padding(.top, 8)

        Spacer()
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }
}

// MARK: - Edit Profile Row
struct EditProfileRow: View {
  let label: String
  let value: String
  let labelWidth: CGFloat
  var prefix: String? = nil

  var body: some View {
    HStack(alignment: .top, spacing: 16) {
      Text(label)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
        .frame(width: labelWidth, alignment: .topLeading)
        .multilineTextAlignment(.leading)

      HStack(spacing: 8) {
        if let prefix {
          Text(prefix)
            .font(.title3)
        }
        Text(value)
          .font(.subheadline)
          .foregroundColor(.appForegroundAdaptive)
          .multilineTextAlignment(.leading)
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      Image(systemName: "chevron.right")
        .font(.system(size: 14, weight: .medium))
        .foregroundColor(.appMutedForegroundAdaptive)
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 16)
    .contentShape(Rectangle())
  }
}

// MARK: - Edit Profile Badge Row
struct EditProfileBadgeRow<Content: View>: View {
  let label: String
  @ViewBuilder let content: Content

  var body: some View {
    HStack(alignment: .top, spacing: 16) {
      Text(label)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
        .frame(width: 100, alignment: .topLeading)
        .multilineTextAlignment(.leading)

      content
        .frame(maxWidth: .infinity, alignment: .leading)

      Image(systemName: "chevron.right")
        .font(.system(size: 14, weight: .medium))
        .foregroundColor(.appMutedForegroundAdaptive)
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 16)
    .contentShape(Rectangle())
  }
}

// MARK: - Profile Badge
struct ProfileBadge: View {
  let text: String
  var prefix: String? = nil
  var icon: String? = nil
  var logoURL: URL? = nil

  var body: some View {
    HStack(spacing: 6) {
      if let prefix {
        Text(prefix)
          .font(.caption)
      }

      if let icon {
        Image(systemName: icon)
          .font(.system(size: 12))
          .foregroundColor(.appForegroundAdaptive)
      }

      if let logoURL {
        CachedAsyncImage(url: logoURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
        } placeholder: {
          Rectangle()
            .fill(Color.appInputFilled)
        }
        .frame(width: 18, height: 18)
        .cornerRadius(4)
      }

      Text(text)
        .font(.caption)
        .foregroundColor(.appForegroundAdaptive)
    }
    .padding(.horizontal, 10)
    .padding(.vertical, 6)
    .background(Color.appInputFilled)
    .clipShape(RoundedRectangle(cornerRadius: 8))
  }
}

// MARK: - Flow Layout
struct FlowLayout: Layout {
  var spacing: CGFloat = 8

  func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
    let result = FlowResult(in: proposal.width ?? 0, subviews: subviews, spacing: spacing)
    return result.size
  }

  func placeSubviews(
    in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()
  ) {
    let result = FlowResult(in: bounds.width, subviews: subviews, spacing: spacing)
    for (index, subview) in subviews.enumerated() {
      subview.place(
        at: CGPoint(
          x: bounds.minX + result.positions[index].x,
          y: bounds.minY + result.positions[index].y),
        proposal: .unspecified)
    }
  }

  struct FlowResult {
    var size: CGSize = .zero
    var positions: [CGPoint] = []

    init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
      var x: CGFloat = 0
      var y: CGFloat = 0
      var rowHeight: CGFloat = 0

      for subview in subviews {
        let size = subview.sizeThatFits(.unspecified)

        if x + size.width > maxWidth && x > 0 {
          x = 0
          y += rowHeight + spacing
          rowHeight = 0
        }

        positions.append(CGPoint(x: x, y: y))
        rowHeight = max(rowHeight, size.height)
        x += size.width + spacing
        self.size.width = max(self.size.width, x - spacing)
      }

      self.size.height = y + rowHeight
    }
  }
}

// MARK: - Edit Username View
struct EditUsernameView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var username: String
  @State private var isLoading = false
  @State private var isCheckingAvailability = false
  @State private var isAvailable: Bool?
  @State private var error: String?
  @State private var checkTask: Task<Void, Never>?

  let currentUsername: String

  init(currentUsername: String) {
    self.currentUsername = currentUsername
    _username = State(initialValue: currentUsername)
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var hasChanges: Bool {
    username != currentUsername && !username.isEmpty
  }

  private var canSave: Bool {
    hasChanges && isAvailable == true && !isCheckingAvailability
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header with back button, title, and Done button
        VStack(spacing: 0) {
          HStack {
            Button {
              dismiss()
            } label: {
              Image(systemName: "chevron.left")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 40, height: 40)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }

            Spacer()

            Text(strings.username)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)

            Spacer()

            // Check Button (Primary)
            Button {
              Task { await saveUsername() }
            } label: {
              if isLoading {
                ProgressView()
                  .tint(.appBackgroundAdaptive)
                  .frame(width: 40, height: 40)
                  .background(Color.appForegroundAdaptive)
                  .clipShape(Circle())
              } else {
                Image(systemName: "checkmark")
                  .font(.system(size: 18, weight: .semibold))
                  .foregroundColor(
                    canSave ? .appBackgroundAdaptive : .appMutedForegroundAdaptive
                  )
                  .frame(width: 40, height: 40)
                  .background(canSave ? Color.appForegroundAdaptive : Color.clear)
                  .clipShape(Circle())
              }
            }
            .disabled(!canSave || isLoading)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 16)

          // Border bottom
          Rectangle()
            .fill(Color.appBorderAdaptive.opacity(0.5))
            .frame(height: 1)
        }

        // Content
        VStack(alignment: .leading, spacing: 8) {
          Text(strings.username)
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appMutedForegroundAdaptive)

          HStack(spacing: 0) {
            TextField(strings.usernamePlaceholder, text: $username)
              .textInputAutocapitalization(.never)
              .autocorrectionDisabled()
              .onChange(of: username) { newValue in
                checkUsernameAvailability(newValue)
              }

            // Availability indicator inside field (only show loading or error)
            if hasChanges {
              if isCheckingAvailability {
                ProgressView()
                  .frame(width: 20, height: 20)
              } else if isAvailable == false {
                Image(systemName: "xmark.circle.fill")
                  .font(.system(size: 20))
                  .foregroundColor(.appDestructive)
              }
            }
          }
          .padding(12)
          .background(Color.appInputFilled)
          .cornerRadius(12)

          if let error {
            Text(error)
              .font(.caption)
              .foregroundColor(.appDestructive)
          } else if hasChanges && isAvailable == false && !isCheckingAvailability {
            Text(strings.usernameAlreadyTaken)
              .font(.caption)
              .foregroundColor(.appDestructive)
          }

          Spacer()
        }
        .padding(.horizontal, 24)
        .padding(.top, 24)
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private func checkUsernameAvailability(_ newUsername: String) {
    // Cancel previous check
    checkTask?.cancel()
    error = nil
    isAvailable = nil

    // Don't check if same as current or empty
    guard newUsername != currentUsername, !newUsername.isEmpty else {
      isCheckingAvailability = false
      return
    }

    isCheckingAvailability = true

    // Debounce: wait 500ms before checking
    checkTask = Task {
      try? await Task.sleep(nanoseconds: 500_000_000)

      guard !Task.isCancelled else { return }

      do {
        let available = try await AuthService.shared.isUsernameAvailable(newUsername)
        await MainActor.run {
          guard !Task.isCancelled else { return }
          isAvailable = available
          isCheckingAvailability = false
        }
      } catch {
        await MainActor.run {
          guard !Task.isCancelled else { return }
          isCheckingAvailability = false
        }
      }
    }
  }

  private func saveUsername() async {
    error = nil
    isLoading = true
    defer { isLoading = false }

    do {
      _ = try await AuthService.shared.updateUser(username: username)
      NotificationCenter.default.post(name: .profileUpdated, object: nil)
      dismiss()
    } catch AuthError.alreadyExists {
      error = strings.usernameAlreadyTaken
      isAvailable = false
    } catch {
      self.error = error.localizedDescription
    }
  }
}

// MARK: - Edit Biography View
struct EditBiographyView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var biography: String
  @State private var isLoading = false
  @State private var error: String?

  let currentBiography: String?

  init(currentBiography: String?) {
    self.currentBiography = currentBiography
    _biography = State(initialValue: currentBiography ?? "")
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var hasChanges: Bool {
    biography != (currentBiography ?? "")
  }

  private var canSave: Bool {
    hasChanges
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header with back button, title, and Done button
        VStack(spacing: 0) {
          HStack {
            Button {
              dismiss()
            } label: {
              Image(systemName: "chevron.left")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 40, height: 40)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }

            Spacer()

            Text(strings.biography)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)

            Spacer()

            // Save Button (Primary)
            Button {
              Task { await saveBiography() }
            } label: {
              if isLoading {
                ProgressView()
                  .tint(.appBackgroundAdaptive)
                  .frame(width: 40, height: 40)
                  .background(Color.appForegroundAdaptive)
                  .clipShape(Circle())
              } else {
                Image(systemName: "checkmark")
                  .font(.system(size: 18, weight: .semibold))
                  .foregroundColor(
                    canSave ? .appBackgroundAdaptive : .appMutedForegroundAdaptive
                  )
                  .frame(width: 40, height: 40)
                  .background(canSave ? Color.appForegroundAdaptive : Color.clear)
                  .clipShape(Circle())
              }
            }
            .disabled(!canSave || isLoading)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 16)

          // Border bottom
          Rectangle()
            .fill(Color.appBorderAdaptive.opacity(0.5))
            .frame(height: 1)
        }

        // Content
        VStack(alignment: .leading, spacing: 8) {
          Text(strings.biography)
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appMutedForegroundAdaptive)

          TextEditor(text: $biography)
            .frame(minHeight: 120, maxHeight: 200)
            .padding(12)
            .multilineTextAlignment(.leading)
            .scrollContentBackground(.hidden)
            .background(Color.appInputFilled)
            .cornerRadius(12)
            .overlay(
              Group {
                if biography.isEmpty {
                  Text(strings.biographyPlaceholder)
                    .font(.body)
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 20)
                    .allowsHitTesting(false)
                }
              },
              alignment: .topLeading
            )

          if let error {
            Text(error)
              .font(.caption)
              .foregroundColor(.appDestructive)
          }

          Spacer()
        }
        .padding(.horizontal, 24)
        .padding(.top, 24)
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private func saveBiography() async {
    error = nil
    isLoading = true
    defer { isLoading = false }

    do {
      _ = try await AuthService.shared.updateUser(biography: biography)
      NotificationCenter.default.post(name: .profileUpdated, object: nil)
      dismiss()
    } catch {
      self.error = error.localizedDescription
    }
  }
}

// MARK: - Edit Region View
struct EditRegionView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var regions: [WatchRegion] = []
  @State private var filteredRegions: [WatchRegion] = []
  @State private var selectedRegion: String?
  @State private var searchText = ""
  @State private var isLoading = true
  @State private var isSaving = false

  let currentRegion: String?

  init(currentRegion: String?) {
    self.currentRegion = currentRegion
    _selectedRegion = State(initialValue: currentRegion)
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var hasChanges: Bool {
    selectedRegion != currentRegion && selectedRegion != nil
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(spacing: 0) {
          HStack {
            Button {
              dismiss()
            } label: {
              Image(systemName: "chevron.left")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 40, height: 40)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }

            Spacer()

            Text(strings.region)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)

            Spacer()

            // Save Button (Primary)
            Button {
              Task { await saveRegion() }
            } label: {
              if isSaving {
                ProgressView()
                  .tint(.appBackgroundAdaptive)
                  .frame(width: 40, height: 40)
                  .background(Color.appForegroundAdaptive)
                  .clipShape(Circle())
              } else {
                Image(systemName: "checkmark")
                  .font(.system(size: 18, weight: .semibold))
                  .foregroundColor(
                    hasChanges ? .appBackgroundAdaptive : .appMutedForegroundAdaptive
                  )
                  .frame(width: 40, height: 40)
                  .background(hasChanges ? Color.appForegroundAdaptive : Color.clear)
                  .clipShape(Circle())
              }
            }
            .disabled(!hasChanges || isSaving)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 16)

          // Search Field
          HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
              .foregroundColor(.appMutedForegroundAdaptive)
            TextField(strings.searchRegion, text: $searchText)
              .textInputAutocapitalization(.never)
              .autocorrectionDisabled()
              .onChange(of: searchText) { _ in
                filterRegions()
              }
          }
          .padding(12)
          .background(Color.appInputFilled)
          .cornerRadius(12)
          .padding(.horizontal, 24)
          .padding(.bottom, 16)

          Rectangle()
            .fill(Color.appBorderAdaptive.opacity(0.5))
            .frame(height: 1)
        }

        // Content
        if isLoading {
          VStack {
            Spacer()
            ProgressView()
            Spacer()
          }
        } else {
          ScrollView(showsIndicators: false) {
            LazyVStack(spacing: 0) {
              ForEach(filteredRegions) { region in
                Button {
                  selectedRegion = region.iso31661
                } label: {
                  HStack(spacing: 12) {
                    Text(region.flagEmoji)
                      .font(.title2)

                    Text(region.englishName)
                      .font(.subheadline)
                      .foregroundColor(.appForegroundAdaptive)

                    Spacer()

                    if selectedRegion == region.iso31661 {
                      Image(systemName: "checkmark")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.appForegroundAdaptive)
                    }
                  }
                  .padding(.horizontal, 24)
                  .padding(.vertical, 14)
                  .background(
                    selectedRegion == region.iso31661
                      ? Color.appInputFilled : Color.clear
                  )
                }

                Rectangle()
                  .fill(Color.appBorderAdaptive.opacity(0.3))
                  .frame(height: 1)
                  .padding(.leading, 60)
              }
            }
          }
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
    .task {
      await loadRegions()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private func loadRegions() async {
    isLoading = true
    defer { isLoading = false }

    do {
      regions = try await TMDBService.shared.getAvailableRegions(
        language: Language.current.rawValue)
      filterRegions()
    } catch {
      print("Error loading regions: \(error)")
    }
  }

  private func filterRegions() {
    if searchText.isEmpty {
      filteredRegions = regions
    } else {
      filteredRegions = regions.filter {
        $0.englishName.localizedCaseInsensitiveContains(searchText)
          || $0.nativeName.localizedCaseInsensitiveContains(searchText)
          || $0.iso31661.localizedCaseInsensitiveContains(searchText)
      }
    }
  }

  private func saveRegion() async {
    guard let selectedRegion else { return }

    isSaving = true
    defer { isSaving = false }

    do {
      try await AuthService.shared.updateUserPreferences(watchRegion: selectedRegion)
      NotificationCenter.default.post(name: .profileUpdated, object: nil)
      dismiss()
    } catch {
      print("Error saving region: \(error)")
    }
  }
}

// MARK: - Edit Streaming Services View
struct EditStreamingServicesView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var providers: [StreamingProvider] = []
  @State private var filteredProviders: [StreamingProvider] = []
  @State private var selectedIds: Set<Int>
  @State private var searchText = ""
  @State private var isLoading = true
  @State private var isSaving = false

  let watchRegion: String
  let initialSelectedIds: [Int]

  init(watchRegion: String, selectedIds: [Int]) {
    self.watchRegion = watchRegion
    self.initialSelectedIds = selectedIds
    _selectedIds = State(initialValue: Set(selectedIds))
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var hasChanges: Bool {
    Set(initialSelectedIds) != selectedIds
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(spacing: 0) {
          HStack {
            Button {
              dismiss()
            } label: {
              Image(systemName: "chevron.left")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 40, height: 40)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }

            Spacer()

            Text(strings.streamingServices)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)

            Spacer()

            // Save Button (Primary)
            Button {
              Task { await saveServices() }
            } label: {
              if isSaving {
                ProgressView()
                  .tint(.appBackgroundAdaptive)
                  .frame(width: 40, height: 40)
                  .background(Color.appForegroundAdaptive)
                  .clipShape(Circle())
              } else {
                Image(systemName: "checkmark")
                  .font(.system(size: 18, weight: .semibold))
                  .foregroundColor(
                    hasChanges ? .appBackgroundAdaptive : .appMutedForegroundAdaptive
                  )
                  .frame(width: 40, height: 40)
                  .background(hasChanges ? Color.appForegroundAdaptive : Color.clear)
                  .clipShape(Circle())
              }
            }
            .disabled(!hasChanges || isSaving)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 16)

          // Search Field
          HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
              .foregroundColor(.appMutedForegroundAdaptive)
            TextField(strings.searchStreamingServices, text: $searchText)
              .textInputAutocapitalization(.never)
              .autocorrectionDisabled()
              .onChange(of: searchText) { _ in
                filterProviders()
              }
          }
          .padding(12)
          .background(Color.appInputFilled)
          .cornerRadius(12)
          .padding(.horizontal, 24)
          .padding(.bottom, 16)

          // Hint message
          HStack(spacing: 8) {
            Image(systemName: "info.circle")
              .font(.caption)
            Text(strings.streamingServicesHint)
              .font(.caption)
          }
          .foregroundColor(.appMutedForegroundAdaptive)
          .frame(maxWidth: .infinity, alignment: .leading)
          .padding(.horizontal, 24)
          .padding(.bottom, 16)

          Rectangle()
            .fill(Color.appBorderAdaptive.opacity(0.5))
            .frame(height: 1)
        }

        // Content
        if isLoading {
          VStack {
            Spacer()
            ProgressView()
            Spacer()
          }
        } else {
          ScrollView(showsIndicators: false) {
            LazyVStack(spacing: 0) {
              ForEach(filteredProviders) { provider in
                Button {
                  toggleProvider(provider.providerId)
                } label: {
                  HStack(spacing: 12) {
                    // Provider Logo
                    CachedAsyncImage(url: provider.logoURL) { image in
                      image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                    } placeholder: {
                      Rectangle()
                        .fill(Color.appInputFilled)
                    }
                    .frame(width: 40, height: 40)
                    .cornerRadius(8)

                    Text(provider.providerName)
                      .font(.subheadline)
                      .foregroundColor(.appForegroundAdaptive)

                    Spacer()

                    if selectedIds.contains(provider.providerId) {
                      Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 22))
                        .foregroundColor(.appForegroundAdaptive)
                    } else {
                      Image(systemName: "circle")
                        .font(.system(size: 22))
                        .foregroundColor(.appMutedForegroundAdaptive)
                    }
                  }
                  .padding(.horizontal, 24)
                  .padding(.vertical, 12)
                  .background(
                    selectedIds.contains(provider.providerId)
                      ? Color.appInputFilled : Color.clear
                  )
                }

                Rectangle()
                  .fill(Color.appBorderAdaptive.opacity(0.3))
                  .frame(height: 1)
                  .padding(.leading, 76)
              }
            }
          }
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
    .task {
      await loadProviders()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private func toggleProvider(_ id: Int) {
    if selectedIds.contains(id) {
      selectedIds.remove(id)
    } else {
      selectedIds.insert(id)
    }
  }

  private func loadProviders() async {
    isLoading = true
    defer { isLoading = false }

    do {
      providers = try await TMDBService.shared.getStreamingProviders(
        watchRegion: watchRegion,
        language: Language.current.rawValue
      )
      filterProviders()
    } catch {
      print("Error loading providers: \(error)")
    }
  }

  private func filterProviders() {
    if searchText.isEmpty {
      filteredProviders = providers
    } else {
      filteredProviders = providers.filter {
        $0.providerName.localizedCaseInsensitiveContains(searchText)
      }
    }
  }

  private func saveServices() async {
    isSaving = true
    defer { isSaving = false }

    do {
      try await AuthService.shared.updateUserPreferences(
        watchRegion: watchRegion,
        watchProvidersIds: Array(selectedIds)
      )
      NotificationCenter.default.post(name: .profileUpdated, object: nil)
      dismiss()
    } catch {
      print("Error saving services: \(error)")
    }
  }
}

// MARK: - Edit Field View
struct EditFieldView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared

  let fieldName: String

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header with back button and title
        VStack(spacing: 0) {
          HStack {
            Button {
              dismiss()
            } label: {
              Image(systemName: "chevron.left")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 40, height: 40)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }

            Spacer()

            Text(fieldName)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)

            Spacer()

            // Invisible placeholder for balance
            Color.clear
              .frame(width: 40, height: 40)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 16)

          // Border bottom
          Rectangle()
            .fill(Color.appBorderAdaptive.opacity(0.5))
            .frame(height: 1)
        }

        // Content placeholder
        VStack {
          Spacer()
          Text("Edit \(fieldName) coming soon...")
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
          Spacer()
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
  }
}

#Preview {
  ProfileTabView()
}
