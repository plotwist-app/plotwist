//
//  OnboardingWelcomeContent.swift
//  Plotwist
//

import SwiftUI

struct OnboardingWelcomeContent: View {
  let onContinue: () -> Void
  @State private var strings = L10n.current
  @State private var showSkipConfirmation = false
  
  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      Spacer()
      
      // App Icon
      Image("PlotistLogo")
        .resizable()
        .frame(width: 48, height: 48)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .padding(.bottom, 16)
      
      // Title
      Text(strings.onboardingWelcomeTitle)
        .font(.system(size: 28, weight: .bold))
        .foregroundColor(.white)
        .padding(.bottom, 8)
      
      // Description
      Text(strings.onboardingWelcomeSubtitle)
        .font(.subheadline)
        .foregroundColor(.white.opacity(0.7))
        .padding(.bottom, 24)
      
      // CTA Button
      Button(action: onContinue) {
        Text(strings.onboardingGetStarted)
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(.black)
          .frame(maxWidth: .infinity)
          .frame(height: 52)
          .background(Color.white)
          .clipShape(Capsule())
      }
      
      #if DEBUG
      // Skip Onboarding Button (Dev Only)
      Button {
        showSkipConfirmation = true
      } label: {
        HStack(spacing: 6) {
          Image(systemName: "forward.end")
          Text("Skip")
        }
        .font(.caption.weight(.medium))
        .foregroundColor(.white.opacity(0.5))
        .frame(maxWidth: .infinity)
      }
      .confirmationDialog("Pular onboarding?", isPresented: $showSkipConfirmation, titleVisibility: .visible) {
        Button("Pular", role: .destructive) {
          OnboardingService.shared.completeOnboarding()
        }
        Button("Cancelar", role: .cancel) {}
      }
      #endif
    }
    .padding(.horizontal, 24)
    .padding(.top, 24)
    .padding(.bottom, 0)
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}
