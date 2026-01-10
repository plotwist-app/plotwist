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
                    Text("Home")
                }
                .tag(0)
            
            SearchTabView()
                .tabItem {
                    Image(systemName: "magnifyingglass")
                    Text("Search")
                }
                .tag(1)
            
            ProfileTabView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Profile")
                }
                .tag(2)
        }
        .tint(.appForegroundAdaptive)
    }
}

// MARK: - Home Tab
struct HomeTabView: View {
    var body: some View {
        NavigationView {
            ZStack {
                Color.appBackgroundAdaptive.ignoresSafeArea()
                
                Text("Home")
                    .font(.title2)
                    .foregroundColor(.appMutedForegroundAdaptive)
            }
            .navigationBarHidden(true)
        }
    }
}

// MARK: - Search Tab
struct SearchTabView: View {
    var body: some View {
        NavigationView {
            ZStack {
                Color.appBackgroundAdaptive.ignoresSafeArea()
                
                Text("Search")
                    .font(.title2)
                    .foregroundColor(.appMutedForegroundAdaptive)
            }
            .navigationBarHidden(true)
        }
    }
}

// MARK: - Profile Tab
struct ProfileTabView: View {
    var body: some View {
        NavigationView {
            ZStack {
                Color.appBackgroundAdaptive.ignoresSafeArea()
                
                VStack(spacing: 24) {
                    Text("Profile")
                        .font(.title2)
                        .foregroundColor(.appMutedForegroundAdaptive)
                    
                    Button {
                        AuthService.shared.signOut()
                    } label: {
                        HStack {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                            Text("Sign Out")
                        }
                        .foregroundColor(.appDestructive)
                    }
                }
            }
            .navigationBarHidden(true)
        }
    }
}

#Preview {
    HomeView()
}
