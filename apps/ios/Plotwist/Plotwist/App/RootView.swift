//
//  RootView.swift
//  Plotwist
//

import SwiftUI

struct RootView: View {
  @State private var isAuthenticated = AuthService.shared.isAuthenticated
  @State private var isGuestMode = UserDefaults.standard.bool(forKey: "isGuestMode")
  @StateObject private var onboardingService = OnboardingService.shared
  @ObservedObject private var themeManager = ThemeManager.shared

  var body: some View {
    Group {
      if !onboardingService.hasCompletedOnboarding && !isAuthenticated {
        // Show onboarding for new users
        OnboardingView()
      } else if isAuthenticated || isGuestMode {
        HomeView()
      } else {
        LoginView()
      }
    }
    .preferredColorScheme(themeManager.current.colorScheme)
    .onReceive(NotificationCenter.default.publisher(for: .authChanged)) { _ in
      isAuthenticated = AuthService.shared.isAuthenticated
      // Always sync guest mode state from UserDefaults
      isGuestMode = UserDefaults.standard.bool(forKey: "isGuestMode")
      // Exit guest mode when user logs in
      if isAuthenticated && isGuestMode {
        UserDefaults.standard.set(false, forKey: "isGuestMode")
        isGuestMode = false
      }
      
      // Sync local onboarding data to server after login
      if isAuthenticated {
        Task {
          await onboardingService.syncLocalDataToServer()
        }
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: .continueAsGuest)) { _ in
      UserDefaults.standard.set(true, forKey: "isGuestMode")
      isGuestMode = true
    }
  }
}

#Preview {
  RootView()
}
