//
//  HomeView.swift
//  Plotwist
//

import SwiftUI

struct HomeView: View {
  @State private var selectedTab = 0
  @State private var previousTab = 0
  
  private var isGuestMode: Bool {
    !AuthService.shared.isAuthenticated && UserDefaults.standard.bool(forKey: "isGuestMode")
  }
  
  private func exitGuestMode() {
    UserDefaults.standard.set(false, forKey: "isGuestMode")
    NotificationCenter.default.post(name: .authChanged, object: nil)
  }

  var body: some View {
    TabView(selection: $selectedTab) {
      HomeTabView()
        .tabItem {
          Image(systemName: "house.fill")
        }
        .tag(0)

      SearchTabView()
        .tabItem {
          Image(systemName: "magnifyingglass")
        }
        .tag(1)

      // TODO: Re-enable when Soundtracks feature is ready
      // SoundtracksTabView()
      //   .tabItem {
      //     Image(systemName: "flame.fill")
      //   }
      //   .tag(2)

      ProfileTabView()
        .tabItem {
          Image(systemName: "person.fill")
        }
        .tag(2)
    }
    .tint(.appForegroundAdaptive)
    .onChange(of: selectedTab) { newTab in
      // Intercept profile tab when in guest mode - redirect to login
      if newTab == 2 && isGuestMode {
        selectedTab = previousTab
        exitGuestMode()
      } else {
        previousTab = newTab
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: .navigateToSearch)) { _ in
      selectedTab = 1
    }
    .onReceive(NotificationCenter.default.publisher(for: .navigateToProfile)) { _ in
      if isGuestMode {
        exitGuestMode()
      } else {
        selectedTab = 2
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
    }
    .safeAreaInset(edge: .bottom) {
      Color.clear.frame(height: 24)
    }
  }
}

#Preview {
  HomeView()
}
