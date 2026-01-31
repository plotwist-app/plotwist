//
//  EditLanguageView.swift
//  Plotwist
//

import SwiftUI

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
        headerView
        languageOptions
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

        Text(strings.language)
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

  private var languageOptions: some View {
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
  }
}
