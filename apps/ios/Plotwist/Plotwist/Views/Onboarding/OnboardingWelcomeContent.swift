//
//  OnboardingWelcomeContent.swift
//  Plotwist
//

import SwiftUI

struct OnboardingWelcomeContent: View {
  let onContinue: () -> Void
  @State private var strings = L10n.current
  @State private var showResetConfirmation = false
  
  var body: some View {
    VStack(spacing: 20) {
      // Title & Description
      VStack(spacing: 8) {
        Text(strings.onboardingWelcomeTitle)
          .font(.system(size: 26, weight: .bold))
          .foregroundColor(.appForegroundAdaptive)
          .multilineTextAlignment(.center)
        
        Text(strings.onboardingWelcomeSubtitle)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
          .multilineTextAlignment(.center)
      }
      
      // CTA Button
      Button(action: onContinue) {
        Text(strings.onboardingGetStarted)
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(.appBackgroundAdaptive)
          .frame(maxWidth: .infinity)
          .frame(height: 52)
          .background(Color.appForegroundAdaptive)
          .clipShape(Capsule())
      }
      
      // Reset Onboarding Button (Dev)
      Button {
        showResetConfirmation = true
      } label: {
        HStack(spacing: 6) {
          Image(systemName: "arrow.counterclockwise")
          Text("Reset")
        }
        .font(.caption.weight(.medium))
        .foregroundColor(.appMutedForegroundAdaptive)
      }
      .confirmationDialog("Resetar onboarding?", isPresented: $showResetConfirmation, titleVisibility: .visible) {
        Button("Resetar", role: .destructive) {
          OnboardingService.shared.reset()
          UserDefaults.standard.set(false, forKey: "isGuestMode")
          NotificationCenter.default.post(name: .authChanged, object: nil)
        }
        Button("Cancelar", role: .cancel) {}
      }
    }
    .padding(.horizontal, 24)
    .padding(.top, 28)
    .padding(.bottom, 40)
    .frame(maxWidth: 400)
    .frame(maxWidth: .infinity)
  }
}
