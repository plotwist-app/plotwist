//
//  SoundtracksTabView.swift
//  Plotwist
//

import SwiftUI

struct SoundtracksTabView: View {
  @State private var strings = L10n.current
  @ObservedObject private var themeManager = ThemeManager.shared

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        HStack {
          Text(strings.soundtracks)
            .font(.title2.bold())
            .foregroundColor(.appForegroundAdaptive)

          Spacer()
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 16)

        // Content - Coming soon placeholder
        Spacer()

        VStack(spacing: 16) {
          Image(systemName: "music.note.list")
            .font(.system(size: 56))
            .foregroundColor(.appMutedForegroundAdaptive)

          Text("Coming soon")
            .font(.title3.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)

          Text("Discover soundtracks from your favorite movies and series.")
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 48)
        }

        Spacer()
      }
    }
    .preferredColorScheme(themeManager.current.colorScheme)
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }
}

#Preview {
  SoundtracksTabView()
}
