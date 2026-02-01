//
//  NotificationPromptSheet.swift
//  Plotwist
//
//  Contextual notification opt-in prompt

import SwiftUI
import UserNotifications

struct NotificationPromptSheet: View {
  let hasSeries: Bool
  let onAllow: () -> Void
  let onSkip: () -> Void
  @State private var strings = L10n.current
  @ObservedObject private var themeManager = ThemeManager.shared
  
  private var promptMessage: String {
    if hasSeries {
      return strings.notificationPromptSeries
    } else {
      return strings.notificationPromptWatchlist
    }
  }
  
  var body: some View {
    FloatingSheetContainer {
      VStack(spacing: 24) {
        // Drag Indicator
        RoundedRectangle(cornerRadius: 2.5)
          .fill(Color.gray.opacity(0.4))
          .frame(width: 36, height: 5)
          .padding(.top, 12)
        
        // Icon
        Image(systemName: "bell.badge")
          .font(.system(size: 48))
          .foregroundColor(.appForegroundAdaptive)
          .padding(.top, 8)
        
        // Content
        VStack(spacing: 8) {
          Text(strings.notificationPromptTitle)
            .font(.title2.bold())
            .foregroundColor(.appForegroundAdaptive)
            .multilineTextAlignment(.center)
          
          Text(promptMessage)
            .font(.body)
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 16)
        
        // Buttons
        VStack(spacing: 12) {
          Button(action: {
            requestNotificationPermission()
          }) {
            Text(strings.notificationAllow)
              .font(.headline)
              .foregroundColor(.appBackgroundAdaptive)
              .frame(maxWidth: .infinity)
              .frame(height: 56)
              .background(Color.appForegroundAdaptive)
              .clipShape(Capsule())
          }
          
          Button(action: {
            OnboardingService.shared.hasSeenNotificationPrompt = true
            onSkip()
          }) {
            Text(strings.onboardingNotNow)
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
        .padding(.bottom, 24)
      }
      .padding(.horizontal, 24)
    }
    .floatingSheetPresentation(height: 340)
    .preferredColorScheme(themeManager.current.colorScheme)
  }
  
  private func requestNotificationPermission() {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
      DispatchQueue.main.async {
        OnboardingService.shared.hasSeenNotificationPrompt = true
        if granted {
          // Track permission granted
          AnalyticsService.shared.track(.screenView(name: "Notification_Permission_Granted"))
          onAllow()
        } else {
          // Track permission denied
          AnalyticsService.shared.track(.screenView(name: "Notification_Permission_Denied"))
          onSkip()
        }
      }
    }
  }
}

#Preview {
  NotificationPromptSheet(hasSeries: true, onAllow: {}, onSkip: {})
}
