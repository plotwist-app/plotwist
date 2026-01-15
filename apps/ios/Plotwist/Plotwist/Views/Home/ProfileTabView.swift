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

  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        VStack(spacing: 0) {
          // Header with settings button
          HStack {
            Spacer()
            Button {
              showSettings = true
            } label: {
              Image(systemName: "gearshape")
                .font(.system(size: 18))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 44, height: 44)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }
          }
          .padding(.horizontal, 24)
          .padding(.top, 8)

          Spacer()

          if isLoading {
            ProgressView()
          } else if let user {
            VStack(spacing: 16) {
              Circle()
                .fill(Color.appInputFilled)
                .frame(width: 80, height: 80)
                .overlay(
                  Text(String(user.username.prefix(1)).uppercased())
                    .font(.title.bold())
                    .foregroundColor(.appForegroundAdaptive)
                )

              Text("@\(user.username)")
                .font(.title2.bold())
                .foregroundColor(.appForegroundAdaptive)
            }
          }

          Spacer()

          Button {
            AuthService.shared.signOut()
          } label: {
            HStack {
              Image(systemName: "rectangle.portrait.and.arrow.right")
              Text(strings.signOut)
            }
            .foregroundColor(.appDestructive)
          }
          .padding(.bottom, 32)
        }
      }
      .navigationBarHidden(true)
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
  }

  private func loadUser() async {
    isLoading = true
    defer { isLoading = false }

    do {
      user = try await AuthService.shared.getCurrentUser()
    } catch {
      user = nil
    }
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
      }
      .padding(.horizontal, 24)
      .padding(.top, 16)
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
