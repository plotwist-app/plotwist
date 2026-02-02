//
//  EditProfileView.swift
//  Plotwist
//

import SwiftUI

struct EditProfileView: View {
  let user: User

  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var userPreferences: UserPreferences?
  @State private var isLoadingPreferences = true
  @State private var streamingProviders: [StreamingProvider] = []

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
        
        ScrollView(showsIndicators: false) {
          VStack(spacing: 0) {
            profilePictureSection
            Divider().background(Color.appBorderAdaptive.opacity(0.5))
            fieldsSection
            signOutSection
          }
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
    .task { await loadPreferences() }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
    .onReceive(NotificationCenter.default.publisher(for: .profileUpdated)) { _ in
      Task { await loadPreferences() }
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
    VStack(spacing: 16) {
      ProfileAvatar(
        avatarURL: user.avatarImageURL,
        username: user.username,
        size: 100
      )

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
  }

  // MARK: - Fields Section
  private var fieldsSection: some View {
    VStack(spacing: 0) {
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
      fieldDivider

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

  // MARK: - Sign Out Section
  private var signOutSection: some View {
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
      
      #if DEBUG
      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
      
      Button {
        OnboardingService.shared.reset()
        AuthService.shared.signOut()
      } label: {
        HStack(spacing: 8) {
          Image(systemName: "arrow.counterclockwise")
          Text("Reset Onboarding (Debug)")
        }
        .font(.subheadline.weight(.medium))
        .foregroundColor(.orange)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
      }
      #endif
    }
    .padding(.horizontal, 24)
    .padding(.bottom, 40)
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

  private func themeDisplayName(_ theme: AppTheme) -> String {
    switch theme {
    case .system: return strings.themeSystem
    case .light: return strings.themeLight
    case .dark: return strings.themeDark
    }
  }
}
