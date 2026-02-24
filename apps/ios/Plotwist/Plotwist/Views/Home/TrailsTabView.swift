//
//  TrailsTabView.swift
//  Plotwist
//

import SwiftUI

struct TrailsTabView: View {
  @State private var strings = L10n.current
  @ObservedObject private var themeManager = ThemeManager.shared

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 12) {
        Image(systemName: "map")
          .font(.system(size: 40))
          .foregroundColor(.appMutedForegroundAdaptive)

        Text("Trails")
          .font(.title2.bold())
          .foregroundColor(.appForegroundAdaptive)

        Text("Coming soon")
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
  TrailsTabView()
}
