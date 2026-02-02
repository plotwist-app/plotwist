//
//  PlotwistApp.swift
//  Plotwist
//
//  Created by Luiz Henrique Delfino on 10/01/26.
//

import SwiftUI

@main
struct PlotwistApp: App {
    @Environment(\.scenePhase) private var scenePhase
    
    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .onChange(of: scenePhase) { newPhase in
            if newPhase == .active {
                AnalyticsService.shared.track(.appOpened)
            }
        }
    }
}
