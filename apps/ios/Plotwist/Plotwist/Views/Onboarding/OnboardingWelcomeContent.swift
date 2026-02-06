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
    VStack(alignment: .leading, spacing: 16) {
      // App Icon
      if let uiImage = UIImage(named: "AppIcon") {
        Image(uiImage: uiImage)
          .resizable()
          .frame(width: 48, height: 48)
          .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
      }
      
      // Title
      Text(strings.onboardingWelcomeTitle)
        .font(.system(size: 28, weight: .bold))
        .foregroundColor(.appForegroundAdaptive)
      
      // Description
      Text(strings.onboardingWelcomeSubtitle)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
      
      Spacer()
      
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
        .foregroundColor(.appMutedForegroundAdaptive)
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
    .padding(.bottom, 40)
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}
