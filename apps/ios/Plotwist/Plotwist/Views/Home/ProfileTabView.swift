//
//  ProfileTabView.swift
//  Plotwist
//

import SwiftUI

struct ProfileTabView: View {
  @State private var user: User?
  @State private var isLoading = true
  @State private var showSettings = false
  @State private var strings = L10n.current
  @ObservedObject private var themeManager = ThemeManager.shared

  // Avatar size and offset calculations
  private let avatarSize: CGFloat = 140
  private var avatarOffset: CGFloat { -avatarSize * 0.7 }

  var body: some View {
    NavigationView {
      GeometryReader { geometry in
        let bannerHeight = geometry.size.height * 0.35

        ZStack {
          Color.appBackgroundAdaptive.ignoresSafeArea()

          if isLoading {
            VStack {
              Spacer()
              ProgressView()
              Spacer()
            }
          } else if let user {
            ScrollView(showsIndicators: false) {
              VStack(alignment: .leading, spacing: 0) {
                // Banner Section
                ZStack(alignment: .topTrailing) {
                  // Banner Background
                  if let bannerURL = user.bannerImageURL {
                    AsyncImage(url: bannerURL) { phase in
                      switch phase {
                      case .success(let image):
                        image
                          .resizable()
                          .aspectRatio(contentMode: .fill)
                      default:
                        Rectangle()
                          .fill(Color.appInputFilled)
                      }
                    }
                    .frame(width: geometry.size.width, height: bannerHeight)
                    .clipped()
                  } else {
                    Rectangle()
                      .fill(Color.appInputFilled)
                      .frame(width: geometry.size.width, height: bannerHeight)
                  }

                  // Settings Button
                  Button {
                    showSettings = true
                  } label: {
                    Image(systemName: "gearshape")
                      .font(.system(size: 16, weight: .medium))
                      .foregroundColor(.white)
                      .frame(width: 40, height: 40)
                      .background(.ultraThinMaterial)
                      .clipShape(Circle())
                  }
                  .padding(.top, 60)
                  .padding(.trailing, 24)
                }
                .overlay(
                  Rectangle()
                    .fill(Color.appBorderAdaptive.opacity(0.5))
                    .frame(height: 1),
                  alignment: .bottom
                )

                // Profile Content - Centered
                VStack(spacing: 16) {
                  // Avatar with offset
                  ProfileAvatar(
                    avatarURL: user.avatarImageURL,
                    username: user.username,
                    size: avatarSize
                  )
                  .offset(y: avatarOffset)
                  .padding(.bottom, avatarOffset)

                  // Member Since
                  if let memberDate = user.memberSinceDate {
                    Text("\(strings.memberSince) \(formattedMemberDate(memberDate))")
                      .font(.caption)
                      .foregroundColor(.appMutedForegroundAdaptive)
                  }

                  // Username
                  HStack(spacing: 8) {
                    Text(user.username)
                      .font(.title.bold())
                      .foregroundColor(.appForegroundAdaptive)

                    if user.isPro {
                      ProBadge()
                    }
                  }

                  // Edit Profile Button
                  NavigationLink(destination: EditProfileView(user: user)) {
                    HStack(spacing: 8) {
                      Image(systemName: "pencil")
                        .font(.system(size: 14))
                        .foregroundColor(.appForegroundAdaptive)

                      Text(strings.editProfile)
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.appForegroundAdaptive)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color.appInputFilled)
                    .cornerRadius(12)
                  }

                  // Biography
                  if let biography = user.biography, !biography.isEmpty {
                    Text(biography)
                      .font(.subheadline)
                      .foregroundColor(.appMutedForegroundAdaptive)
                      .lineSpacing(4)
                      .multilineTextAlignment(.center)
                  }
                }
                .frame(maxWidth: .infinity)
                .padding(.horizontal, 24)
                .padding(.top, 16)

                Spacer()
                  .frame(height: 100)
              }
            }
            .ignoresSafeArea(edges: .top)
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
      }
      .task {
        await loadUser()
      }
      .sheet(isPresented: $showSettings) {
        SettingsSheet()
          .standardSheetStyle(detents: [.medium])
      }
      .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
        strings = L10n.current
      }
      .navigationBarHidden(true)
    }
  }

  private func loadUser() async {
    isLoading = true
    defer { isLoading = false }

    do {
      user = try await AuthService.shared.getCurrentUser()
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
}

// MARK: - Profile Avatar
struct ProfileAvatar: View {
  let avatarURL: URL?
  let username: String
  let size: CGFloat

  var body: some View {
    ZStack {
      if let avatarURL {
        AsyncImage(url: avatarURL) { phase in
          switch phase {
          case .success(let image):
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
          default:
            avatarPlaceholder
          }
        }
      } else {
        avatarPlaceholder
      }
    }
    .frame(width: size, height: size)
    .clipShape(Circle())
    .overlay(
      Circle()
        .stroke(Color.appBorderAdaptive.opacity(0.5), lineWidth: 1)
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
  var body: some View {
    Text("PRO")
      .font(.system(size: 10, weight: .bold))
      .foregroundColor(.white)
      .padding(.horizontal, 8)
      .padding(.vertical, 4)
      .background(
        LinearGradient(
          colors: [Color.purple, Color.blue],
          startPoint: .leading,
          endPoint: .trailing
        )
      )
      .clipShape(Capsule())
  }
}

// MARK: - Edit Profile View
struct EditProfileView: View {
  let user: User

  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current

  // Fixed label width for alignment
  private let labelWidth: CGFloat = 100

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

            Text(strings.editProfile)
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

              // Region Field
              NavigationLink(destination: EditFieldView(fieldName: strings.region)) {
                EditProfileRow(
                  label: strings.region,
                  value: strings.notSet,
                  labelWidth: labelWidth
                )
              }

              Rectangle()
                .fill(Color.appBorderAdaptive.opacity(0.3))
                .frame(height: 1)
                .padding(.leading, 24)

              // Streaming Services Field
              NavigationLink(destination: EditFieldView(fieldName: strings.streamingServices)) {
                EditProfileRow(
                  label: strings.streamingServices,
                  value: strings.notSet,
                  labelWidth: labelWidth
                )
              }
            }
          }
        }
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

  var body: some View {
    HStack(alignment: .top, spacing: 16) {
      Text(label)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
        .frame(width: labelWidth, alignment: .topLeading)
        .multilineTextAlignment(.leading)

      Text(value)
        .font(.subheadline)
        .foregroundColor(.appForegroundAdaptive)
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

          HStack(spacing: 12) {
            TextField(strings.usernamePlaceholder, text: $username)
              .textInputAutocapitalization(.never)
              .autocorrectionDisabled()
              .padding(12)
              .background(Color.appInputFilled)
              .cornerRadius(12)
              .onChange(of: username) { newValue in
                checkUsernameAvailability(newValue)
              }

            // Availability indicator
            if hasChanges {
              if isCheckingAvailability {
                ProgressView()
                  .frame(width: 24, height: 24)
              } else if let isAvailable {
                Image(systemName: isAvailable ? "checkmark.circle.fill" : "xmark.circle.fill")
                  .font(.system(size: 24))
                  .foregroundColor(isAvailable ? .green : .appDestructive)
              }
            }
          }

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
      dismiss()
    } catch AuthError.alreadyExists {
      error = strings.usernameAlreadyTaken
      isAvailable = false
    } catch {
      self.error = error.localizedDescription
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

// MARK: - Settings Sheet
struct SettingsSheet: View {
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 32) {
        Text(strings.settings)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)
          .padding(.top, 8)

        // Theme Picker
        VStack(alignment: .leading, spacing: 12) {
          Text(strings.theme)
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)

          HStack(spacing: 12) {
            ForEach(AppTheme.allCases, id: \.self) { theme in
              ThemeOptionButton(
                theme: theme,
                isSelected: themeManager.current == theme,
                label: themeDisplayName(theme)
              ) {
                themeManager.current = theme
              }
            }
          }
        }

        // Language Picker
        VStack(alignment: .leading, spacing: 12) {
          Text(strings.language)
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)

          Menu {
            ForEach(Language.allCases, id: \.self) { lang in
              Button {
                Language.current = lang
              } label: {
                HStack {
                  Text(lang.displayName)
                  if Language.current == lang {
                    Image(systemName: "checkmark")
                  }
                }
              }
            }
          } label: {
            HStack {
              Text(Language.current.displayName)
              Spacer()
              Image(systemName: "chevron.down")
            }
            .padding(12)
            .foregroundColor(.appForegroundAdaptive)
            .background(Color.appInputFilled)
            .clipShape(RoundedRectangle(cornerRadius: 12))
          }
        }

        Spacer()

        // Sign Out Button
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
          .padding(.vertical, 14)
          .background(Color.appDestructive.opacity(0.1))
          .cornerRadius(12)
        }
      }
      .padding(.horizontal, 24)
      .padding(.top, 16)
      .padding(.bottom, 24)
    }
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

// MARK: - Theme Option Button
struct ThemeOptionButton: View {
  let theme: AppTheme
  let isSelected: Bool
  let label: String
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      VStack(spacing: 8) {
        Image(systemName: theme.icon)
          .font(.system(size: 20))

        Text(label)
          .font(.caption)
      }
      .frame(maxWidth: .infinity)
      .padding(.vertical, 16)
      .foregroundColor(isSelected ? .appForegroundAdaptive : .appMutedForegroundAdaptive)
      .background(isSelected ? Color.appInputFilled : Color.clear)
      .clipShape(RoundedRectangle(cornerRadius: 12))
    }
  }
}

#Preview {
  ProfileTabView()
}
