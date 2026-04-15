//
//  OnboardingCelebration.swift
//  Plotwist
//

import SwiftUI

struct OnboardingCelebration: View {
  let onDismiss: () -> Void
  @State private var strings = L10n.current
  @State private var showContent = false
  
  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive
        .ignoresSafeArea()
      
      VStack(spacing: 24) {
        Spacer()
        
        // Celebration icon
        Image(systemName: "checkmark.circle.fill")
          .font(.system(size: 80))
          .foregroundColor(.green)
          .scaleEffect(showContent ? 1 : 0.5)
          .opacity(showContent ? 1 : 0)
        
        VStack(spacing: 8) {
          Text(strings.onboardingCelebrationTitle)
            .font(.system(size: 28, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
            .multilineTextAlignment(.center)
          
          Text(strings.onboardingCelebrationSubtitle)
            .font(.body)
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
        }
        .opacity(showContent ? 1 : 0)
        .offset(y: showContent ? 0 : 20)
        
        Spacer()
        
        Button(action: onDismiss) {
          Text(strings.onboardingGoToHome)
            .font(.headline)
            .foregroundColor(.appBackgroundAdaptive)
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(Color.appForegroundAdaptive)
            .clipShape(Capsule())
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 48)
        .opacity(showContent ? 1 : 0)
      }
    }
    .onAppear {
      withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
        showContent = true
      }
      
      // Prefetch home data in the background so it's ready when the user taps "Go to Home"
      HomePrefetchService.shared.prefetchHomeData()
      
      AnalyticsService.shared.track(.screenView(name: "Onboarding_Celebration"))
    }
  }
}
