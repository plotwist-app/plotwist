//
//  HomeView.swift
//  Plotwist
//

import SwiftUI

struct HomeView: View {
  @State private var selectedTab = 0
  @State private var previousTab = 0
  @State private var showLoginPrompt = false
  @State private var showNotificationPrompt = false
  @StateObject private var onboardingService = OnboardingService.shared
  
  private var isGuestMode: Bool {
    !AuthService.shared.isAuthenticated && UserDefaults.standard.bool(forKey: "isGuestMode")
  }
  
  private func exitGuestMode() {
    UserDefaults.standard.set(false, forKey: "isGuestMode")
    NotificationCenter.default.post(name: .authChanged, object: nil)
  }
  
  // Check if user has added a series to their watchlist
  private var hasAddedSeries: Bool {
    onboardingService.localSavedTitles.contains { $0.mediaType == "tv" }
  }

  var body: some View {
    TabView(selection: $selectedTab) {
      Tab(value: 0) {
        HomeTabView()
      } label: {
        Image(systemName: "house.fill")
      }

      #if DEBUG
      Tab(value: 1) {
        DiscoverTabView()
      } label: {
        Image(systemName: "sparkles")
      }

      Tab(value: 2) {
        TrailsTabView()
      } label: {
        Image(systemName: "map")
      }
      #endif

      Tab(value: 3) {
        ProfileTabView()
      } label: {
        Image(systemName: "person.fill")
      }

      Tab(value: 4, role: .search) {
        SearchTabView()
      }
    }
    .tint(.appForegroundAdaptive)
    .onChange(of: selectedTab) { newTab in
      // Intercept profile tab when in guest mode - show login prompt instead
      if newTab == 3 && isGuestMode {
        selectedTab = previousTab
        if !onboardingService.hasSeenLoginPrompt {
          showLoginPrompt = true
        } else {
          exitGuestMode()
        }
      } else {
        previousTab = newTab
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: .navigateToSearch)) { _ in
      selectedTab = 4
    }
    .onReceive(NotificationCenter.default.publisher(for: .navigateToProfile)) { _ in
      if isGuestMode {
        if !onboardingService.hasSeenLoginPrompt {
          showLoginPrompt = true
        } else {
          exitGuestMode()
        }
      } else {
        selectedTab = 3
      }
    }
    .onAppear {
      let appearance = UITabBarAppearance()
      appearance.configureWithOpaqueBackground()
      appearance.shadowColor = UIColor(Color.appBorderAdaptive)
      appearance.stackedLayoutAppearance.normal.iconColor = UIColor(
        Color.appMutedForegroundAdaptive)
      appearance.stackedLayoutAppearance.selected.iconColor = UIColor(Color.appForegroundAdaptive)

      // Add vertical padding to icons - move them down from top border
      let iconOffset = UIOffset(horizontal: 0, vertical: 4)
      appearance.stackedLayoutAppearance.normal.titlePositionAdjustment = iconOffset
      appearance.stackedLayoutAppearance.selected.titlePositionAdjustment = iconOffset

      UITabBar.appearance().standardAppearance = appearance
      UITabBar.appearance().scrollEdgeAppearance = appearance
      
      // Show login prompt after a delay if in guest mode with local data
      if isGuestMode && !onboardingService.hasSeenLoginPrompt && !onboardingService.localSavedTitles.isEmpty {
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
          showLoginPrompt = true
        }
      }
    }
    .safeAreaInset(edge: .bottom) {
      Color.clear.frame(height: 24)
    }
    .sheet(isPresented: $showLoginPrompt) {
      LoginPromptSheet(
        onLogin: {
          showLoginPrompt = false
          // Show notification prompt after login
          if !onboardingService.hasSeenNotificationPrompt {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
              showNotificationPrompt = true
            }
          }
        },
        onSkip: {
          showLoginPrompt = false
          // Show notification prompt if hasn't seen it
          if !onboardingService.hasSeenNotificationPrompt {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
              showNotificationPrompt = true
            }
          }
        }
      )
    }
    .sheet(isPresented: $showNotificationPrompt) {
      NotificationPromptSheet(
        hasSeries: hasAddedSeries,
        onAllow: {
          showNotificationPrompt = false
        },
        onSkip: {
          showNotificationPrompt = false
        }
      )
    }
  }
}

#Preview {
  HomeView()
}
