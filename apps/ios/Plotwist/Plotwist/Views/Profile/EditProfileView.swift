//
//  EditProfileView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Edit Profile Tab
enum EditProfileTab: CaseIterable {
  case information
  case preferences
  case settings

  func displayName(strings: Strings) -> String {
    switch self {
    case .information: return strings.information
    case .preferences: return strings.preferences
    case .settings: return strings.settings
    }
  }

  var icon: String {
    switch self {
    case .information: return "person.fill"
    case .preferences: return "slider.horizontal.3"
    case .settings: return "gearshape.fill"
    }
  }

  var index: Int {
    switch self {
    case .information: return 0
    case .preferences: return 1
    case .settings: return 2
    }
  }
}

// MARK: - Edit Profile Tabs
struct EditProfileTabs: View {
  @Binding var selectedTab: EditProfileTab
  @Binding var slideFromTrailing: Bool
  let strings: Strings
  @Namespace private var tabNamespace

  var body: some View {
    HStack(spacing: 0) {
      ForEach(EditProfileTab.allCases, id: \.self) { tab in
        Button {
          guard selectedTab != tab else { return }
          slideFromTrailing = tab.index > selectedTab.index
          withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
            selectedTab = tab
          }
        } label: {
          VStack(spacing: 8) {
            Text(tab.displayName(strings: strings))
              .font(.subheadline.weight(.medium))
              .foregroundColor(selectedTab == tab ? .appForegroundAdaptive : .appMutedForegroundAdaptive)

            ZStack {
              Rectangle()
                .fill(Color.clear)
                .frame(height: 3)

              if selectedTab == tab {
                Rectangle()
                  .fill(Color.appForegroundAdaptive)
                  .frame(height: 3)
                  .matchedGeometryEffect(id: "editProfileTabIndicator", in: tabNamespace)
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

struct EditProfileView: View {
  let initialUser: User

  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var user: User
  @State private var userPreferences: UserPreferences?
  @State private var isLoadingPreferences = true
  @State private var streamingProviders: [StreamingProvider] = []
  @State private var selectedTab: EditProfileTab = .information
  @State private var slideFromTrailing: Bool = true
  @State private var showAvatarPicker = false

  init(user: User) {
    self.initialUser = user
    self._user = State(initialValue: user)
  }

  private let labelWidth: CGFloat = 100

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var currentRegionName: String {
    guard let region = userPreferences?.watchRegion else { return "-" }
    return regionName(for: region)
  }

  private var currentRegionFlag: String? {
    guard let region = userPreferences?.watchRegion else { return nil }
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
        headerView

        profilePictureSection

        EditProfileTabs(
          selectedTab: $selectedTab,
          slideFromTrailing: $slideFromTrailing,
          strings: strings
        )
        .padding(.top, 8)

        ScrollView(showsIndicators: false) {
          tabContentView
            .id(selectedTab)
            .padding(.bottom, 40)
        }
        .clipped()
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
    .task { await loadPreferences() }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
    .onReceive(NotificationCenter.default.publisher(for: .profileUpdated)) { _ in
      Task {
        await loadPreferences()
        await reloadUser()
      }
    }
  }

  // MARK: - Header
  private var headerView: some View {
    VStack(spacing: 0) {
      HStack {
        Button { dismiss() } label: {
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

        Color.clear.frame(width: 40, height: 40)
      }
      .padding(.horizontal, 24)
      .padding(.vertical, 16)

      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
    }
  }

  // MARK: - Profile Picture Section
  private var profilePictureSection: some View {
    VStack(spacing: 12) {
      Button {
        showAvatarPicker = true
      } label: {
        ZStack(alignment: .bottomTrailing) {
          ProfileAvatar(
            avatarURL: user.avatarImageURL,
            username: user.username,
            size: 100
          )

          Image(systemName: "pencil")
            .font(.system(size: 12, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
            .frame(width: 30, height: 30)
            .background(Color.appInputFilled)
            .clipShape(Circle())
            .overlay(
              Circle()
                .stroke(Color.appBackgroundAdaptive, lineWidth: 2)
            )
            .offset(x: 2, y: 2)
        }
      }
      .buttonStyle(.plain)
    }
    .frame(maxWidth: .infinity)
    .padding(.vertical, 24)
    .fullScreenCover(isPresented: $showAvatarPicker) {
      AvatarImagePickerView(user: user) { newAvatarURL in
        user.avatarUrl = newAvatarURL
      }
    }
  }

  // MARK: - Tab Content View
  private var tabContentView: some View {
    Group {
      switch selectedTab {
      case .information:
        informationSection
      case .preferences:
        preferencesSection
      case .settings:
        settingsSection
      }
    }
    .frame(maxWidth: .infinity, alignment: .top)
    .geometryGroup()
    .transition(.asymmetric(
      insertion: .move(edge: slideFromTrailing ? .trailing : .leading),
      removal: .move(edge: slideFromTrailing ? .leading : .trailing)
    ))
    .animation(.spring(response: 0.4, dampingFraction: 0.88), value: selectedTab)
  }

  // MARK: - Information Section
  private var informationSection: some View {
    VStack(spacing: 0) {
      // Name
      NavigationLink(destination: EditNameView(currentDisplayName: user.displayName)) {
        EditProfileRow(
          label: strings.name,
          value: user.displayName?.isEmpty == false ? user.displayName! : "-",
          labelWidth: labelWidth
        )
      }
      fieldDivider

      // Username
      NavigationLink(destination: EditUsernameView(currentUsername: user.username)) {
        EditProfileRow(label: strings.username, value: user.username, labelWidth: labelWidth)
      }
      fieldDivider

      // Biography
      NavigationLink(destination: EditBiographyView(currentBiography: user.biography)) {
        EditProfileRow(
          label: strings.biography,
          value: user.biography?.isEmpty == false ? user.biography! : "-",
          labelWidth: labelWidth
        )
      }
    }
  }

  // MARK: - Preferences Section
  private var preferencesSection: some View {
    VStack(spacing: 0) {
      // Media Types
      NavigationLink(destination: EditMediaTypesView(currentMediaTypes: userPreferences?.mediaTypes)) {
        EditProfileBadgeRow(label: strings.content) {
          if let types = userPreferences?.mediaTypes, !types.isEmpty {
            FlowLayout(spacing: 6) {
              ForEach(types, id: \.self) { type in
                if let pref = ContentTypePreference(rawValue: type) {
                  ProfileBadge(text: pref.displayName)
                }
              }
            }
          } else {
            Text("-")
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
      }
      fieldDivider

      // Genres
      NavigationLink(destination: EditGenresView(currentGenreIds: userPreferences?.genreIds)) {
        EditProfileBadgeRow(label: strings.genres) {
          if let ids = userPreferences?.genreIds, !ids.isEmpty {
            FlowLayout(spacing: 6) {
              ForEach(ids.prefix(5), id: \.self) { id in
                ProfileBadge(text: OnboardingGenre(id: id, name: "").name)
              }
              if ids.count > 5 {
                ProfileBadge(text: "+\(ids.count - 5)")
              }
            }
          } else {
            Text("-")
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
      }
      fieldDivider

      // Region
      NavigationLink(destination: EditRegionView(currentRegion: userPreferences?.watchRegion)) {
        EditProfileBadgeRow(label: strings.region) {
          if userPreferences?.watchRegion != nil {
            ProfileBadge(text: currentRegionName, prefix: currentRegionFlag)
          } else {
            Text("-")
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
      }
      fieldDivider

      // Streaming Services
      streamingServicesRow
    }
  }

  // MARK: - Settings Section
  private var settingsSection: some View {
    VStack(spacing: 0) {
      // Theme
      NavigationLink(destination: EditThemeView()) {
        EditProfileBadgeRow(label: strings.theme) {
          ProfileBadge(text: themeDisplayName(themeManager.current), icon: themeManager.current.icon)
        }
      }
      fieldDivider

      // Language
      NavigationLink(destination: EditLanguageView()) {
        EditProfileBadgeRow(label: strings.language) {
          ProfileBadge(text: Language.current.displayName, prefix: Language.current.flag)
        }
      }
      fieldDivider

      // Action buttons
      actionButtonsSection
    }
  }

  @ViewBuilder
  private var streamingServicesRow: some View {
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
                ProfileBadge(text: provider.providerName, logoURL: provider.logoURL)
                  .frame(maxWidth: 160)
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
  }

  private var fieldDivider: some View {
    Rectangle()
      .fill(Color.appBorderAdaptive.opacity(0.3))
      .frame(height: 1)
      .padding(.leading, 24)
  }

  // MARK: - Action Buttons
  private var actionButtonsSection: some View {
    VStack(spacing: 12) {
      // Feedback button (gray)
      NavigationLink(destination: FeedbackView()) {
        HStack(spacing: 8) {
          Image(systemName: "envelope.fill")
            .font(.system(size: 14))
          Text(strings.feedbackTitle)
        }
        .font(.subheadline.weight(.medium))
        .foregroundColor(.appForegroundAdaptive)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Color.appInputFilled)
        .clipShape(RoundedRectangle(cornerRadius: 12))
      }
      .buttonStyle(.plain)
      
      // Sign out button (light red)
      Button {
        AuthService.shared.signOut()
      } label: {
        HStack(spacing: 8) {
          Image(systemName: "rectangle.portrait.and.arrow.right")
            .font(.system(size: 14))
          Text(strings.signOut)
        }
        .font(.subheadline.weight(.medium))
        .foregroundColor(.appDestructive)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Color.appDestructive.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
      }
      .buttonStyle(.plain)
      
      #if DEBUG
      Button {
        OnboardingService.shared.reset()
        AuthService.shared.signOut()
      } label: {
        HStack(spacing: 8) {
          Image(systemName: "arrow.counterclockwise")
            .font(.system(size: 14))
          Text("Reset Onboarding (Debug)")
        }
        .font(.subheadline.weight(.medium))
        .foregroundColor(.orange)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Color.orange.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
      }
      .buttonStyle(.plain)
      #endif
    }
    .padding(.horizontal, 24)
    .padding(.top, 16)
  }

  // MARK: - Helpers
  private func loadPreferences() async {
    isLoadingPreferences = true
    defer { isLoadingPreferences = false }

    do {
      userPreferences = try await AuthService.shared.getUserPreferences()

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

  private func reloadUser() async {
    do {
      let freshUser = try await AuthService.shared.getCurrentUser()
      // Preserve local avatar if we have a pending upload (placeholder URL)
      let localAvatar = user.avatarUrl
      let isPending = localAvatar?.contains("avatar-pending") == true
      user = freshUser
      if isPending {
        user.avatarUrl = localAvatar
      }
    } catch {
      print("Error reloading user: \(error)")
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
