//
//  HomeView.swift
//  Plotwist
//

import SwiftUI

struct HomeView: View {
    var body: some View {
        NavigationView {
            VStack(spacing: 16) {
                Text("Welcome to Plotwist!")
                    .font(.title.bold())
                
                Button("Sign Out") {
                    AuthService.shared.signOut()
                }
                .foregroundColor(.appDestructive)
            }
            .navigationTitle("Home")
        }
    }
}

#Preview {
    HomeView()
}
