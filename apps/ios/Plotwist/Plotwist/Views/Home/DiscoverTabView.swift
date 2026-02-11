//
//  DiscoverTabView.swift
//  Plotwist
//

import SwiftUI

struct DiscoverTabView: View {
  @State private var strings = L10n.current

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      Text(strings.discover)
        .font(.largeTitle.bold())
        .foregroundColor(.appForegroundAdaptive)
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }
}

#Preview {
  DiscoverTabView()
}
