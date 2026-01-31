//
//  RootView.swift
//  Plotwist
//

import SwiftUI

struct RootView: View {
  @State private var isAuthenticated = AuthService.shared.isAuthenticated
  @ObservedObject private var themeManager = ThemeManager.shared

  var body: some View {
    Group {
      if isAuthenticated {
        HomeView()
      } else {
        LoginView()
      }
    }
    .preferredColorScheme(themeManager.current.colorScheme)
    .onReceive(NotificationCenter.default.publisher(for: .authChanged)) { _ in
      isAuthenticated = AuthService.shared.isAuthenticated
    }
  }
}

#Preview {
  RootView()
}
