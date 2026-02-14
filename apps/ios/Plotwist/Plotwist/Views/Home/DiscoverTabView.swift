//
//  DiscoverTabView.swift
//  Plotwist
//

import SwiftUI

struct DiscoverTabView: View {
  @State private var strings = L10n.current
  @ObservedObject private var themeManager = ThemeManager.shared

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 12) {
        Image(systemName: "sparkles")
          .font(.system(size: 40))
          .foregroundColor(.appMutedForegroundAdaptive)

        Text(strings.discover)
          .font(.title2.bold())
          .foregroundColor(.appForegroundAdaptive)

        Text(strings.comingSoon)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
      }
    }
    .preferredColorScheme(themeManager.current.colorScheme)
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }
}

#Preview {
  DiscoverTabView()
}
