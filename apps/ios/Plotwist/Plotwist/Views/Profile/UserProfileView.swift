//
//  UserProfileView.swift
//  Plotwist
//

import SwiftUI

// MARK: - User Profile View (Public)
struct UserProfileView: View {
  let userId: String
  let initialUsername: String
  let initialAvatarUrl: String?

  @Environment(\.dismiss) private var dismiss
  @State private var user: User?
  @State private var isLoading = true
  @State private var strings = L10n.current
  @State private var selectedMainTab: ProfileMainTab = .collection
  @State private var slideFromTrailing: Bool = true
  @State private var selectedStatusTab: ProfileStatusTab = .watched
  @State private var userItems: [UserItemSummary] = []
  @State private var isLoadingItems = false
  @State private var statusCounts: [String: Int] = [:]
  @State private var totalReviewsCount: Int = 0
  @ObservedObject private var themeManager = ThemeManager.shared

  private let avatarSize: CGFloat = 72

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      if isLoading && user == nil {
        VStack {
          Spacer()
          ProgressView()
          Spacer()
        }
      } else if let user {
        profileContentView(user: user)
      } else {
        errorView
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .task {
      await loadData()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
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
      }
    }
  }

  // MARK: - Header View (with back button)
  private func headerView(user: User) -> some View {
    HStack(spacing: 12) {
      Button {
        dismiss()
      } label: {
        Image(systemName: "chevron.left")
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(.appForegroundAdaptive)
          .frame(width: 36, height: 36)
          .background(Color.appInputFilled)
          .clipShape(Circle())
      }

      Spacer()
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 12)
    .background(Color.appBackgroundAdaptive)
    .overlay(
      Rectangle()
        .fill(Color.appBorderAdaptive)
        .frame(height: 1),
      alignment: .bottom
    )
  }

  // MARK: - Profile Info Section (centered avatar + username)
  private func profileInfoSection(user: User) -> some View {
    VStack(spacing: 0) {
      VStack(spacing: 12) {
        ProfileAvatar(avatarURL: user.avatarImageURL, username: user.username, size: avatarSize)

        VStack(spacing: 4) {
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
      }
      .frame(maxWidth: .infinity)
      .padding(.top, 16)
      .padding(.bottom, 12)

      // Quick stats
      ProfileQuickStats(userId: user.id, strings: strings)
        .padding(.horizontal, 24)
        .padding(.bottom, 12)

      if let biography = user.biography, !biography.isEmpty {
        Text(biography)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
          .lineSpacing(4)
          .multilineTextAlignment(.center)
          .frame(maxWidth: .infinity)
          .padding(.horizontal, 24)
      }
    }
  }

  // MARK: - Tab Content View
  private func tabContentView(userId: String) -> some View {
    Group {
      switch selectedMainTab {
      case .collection:
        collectionTabContent(userId: userId)
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
  private func collectionTabContent(userId: String) -> some View {
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
      VStack(spacing: 12) {
        Image(systemName: "film.stack")
          .font(.system(size: 32))
          .foregroundColor(.appMutedForegroundAdaptive.opacity(0.5))
      }
      .frame(maxWidth: .infinity)
      .padding(.top, 40)
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

  // MARK: - Data Loading
  private func loadData() async {
    await loadUser()
    await loadUserItems()
    await loadStatusCounts()
    await loadTotalReviewsCount()
    isLoading = false
  }

  private func loadUser() async {
    do {
      let fetchedUser = try await AuthService.shared.getUserById(userId)
      user = fetchedUser
    } catch {
      print("Error loading user profile: \(error)")
      user = nil
    }
  }

  private func formattedMemberDate(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "MMM/yyyy"
    formatter.locale = Locale(identifier: Language.current.rawValue)
    return formatter.string(from: date)
  }

  private func loadUserItems() async {
    isLoadingItems = true
    defer { isLoadingItems = false }

    do {
      let items = try await UserItemService.shared.getAllUserItems(
        userId: userId,
        status: selectedStatusTab.rawValue
      )
      userItems = items
    } catch {
      print("Error loading user items: \(error)")
      userItems = []
    }
  }

  private func loadStatusCounts() async {
    do {
      let stats = try await UserStatsService.shared.getItemsStatus(userId: userId)
      var counts: [String: Int] = [:]
      for stat in stats {
        counts[stat.status] = stat.count
      }
      statusCounts = counts
    } catch {
      print("Error loading status counts: \(error)")
      statusCounts = [:]
    }
  }

  private func loadTotalReviewsCount() async {
    do {
      let count = try await ReviewService.shared.getUserReviewsCount(userId: userId)
      totalReviewsCount = count
    } catch {
      print("Error loading reviews count: \(error)")
      totalReviewsCount = 0
    }
  }
}
