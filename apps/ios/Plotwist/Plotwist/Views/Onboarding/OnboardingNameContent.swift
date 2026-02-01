//
//  OnboardingNameContent.swift
//  Plotwist
//

import SwiftUI

struct OnboardingNameContent: View {
  let onContinue: () -> Void
  @StateObject private var onboardingService = OnboardingService.shared
  @State private var strings = L10n.current
  @State private var userName: String = ""
  @FocusState private var isNameFocused: Bool
  
  private var canContinue: Bool {
    !userName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
  }
  
  var body: some View {
    VStack(spacing: 0) {
      Spacer()
      
      // Title & Description
      VStack(spacing: 8) {
        Text(strings.onboardingNameTitle)
          .font(.system(size: 28, weight: .bold))
          .foregroundColor(.appForegroundAdaptive)
          .multilineTextAlignment(.center)
        
        Text(strings.onboardingNameSubtitle)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
          .multilineTextAlignment(.center)
      }
      .padding(.bottom, 32)
      .padding(.horizontal, 24)
      
      // Name Input
      TextField(strings.onboardingNamePlaceholder, text: $userName)
        .textInputAutocapitalization(.words)
        .autocorrectionDisabled()
        .padding(12)
        .background(Color.appInputFilled)
        .cornerRadius(12)
        .focused($isNameFocused)
        .submitLabel(.continue)
        .onSubmit {
          if canContinue {
            onboardingService.setUserName(userName.trimmingCharacters(in: .whitespacesAndNewlines))
            onContinue()
          }
        }
        .padding(.horizontal, 24)
      
      Spacer()
      Spacer()
      
      // CTA Button
      Button(action: {
        onboardingService.setUserName(userName.trimmingCharacters(in: .whitespacesAndNewlines))
        onContinue()
      }) {
        Text(strings.continueButton)
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(canContinue ? .appBackgroundAdaptive : .appMutedForegroundAdaptive)
          .frame(maxWidth: .infinity)
          .frame(height: 52)
          .background(canContinue ? Color.appForegroundAdaptive : Color.appInputFilled)
          .clipShape(Capsule())
      }
      .disabled(!canContinue)
      .padding(.horizontal, 24)
      .padding(.bottom, 48)
    }
    .frame(maxWidth: .infinity)
    .onAppear {
      // Load saved name if returning to this step
      if userName.isEmpty && !onboardingService.userName.isEmpty {
        userName = onboardingService.userName
      }
      
      // Focus name field after a short delay
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
        isNameFocused = true
      }
    }
  }
}
