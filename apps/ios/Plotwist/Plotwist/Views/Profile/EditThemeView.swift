//
//  EditThemeView.swift
//  Plotwist
//

import SwiftUI

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
        headerView
        themeOptions
        Spacer()
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

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

        Text(strings.theme)
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

  private var themeOptions: some View {
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
  }

  private func themeDisplayName(_ theme: AppTheme) -> String {
    switch theme {
    case .system: return strings.themeSystem
    case .light: return strings.themeLight
    case .dark: return strings.themeDark
    }
  }
}
