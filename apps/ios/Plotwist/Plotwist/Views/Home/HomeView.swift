//
//  HomeView.swift
//  Plotwist
//

import SwiftUI

struct HomeView: View {
  @State private var selectedTab = 0

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

      SoundtracksTabView()
        .tabItem {
          Image(systemName: "map.fill")
        }
        .tag(2)

      ProfileTabView()
        .tabItem {
          Image(systemName: "person.fill")
        }
        .tag(3)
    }
    .tint(.appForegroundAdaptive)
    .onReceive(NotificationCenter.default.publisher(for: .navigateToSearch)) { _ in
      selectedTab = 1
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
